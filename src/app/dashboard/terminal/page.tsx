'use client'; // Required for hooks like useState, useEffect, useRef

import React, { useEffect, useRef, useState } from 'react'; // Removed useContext as useAuth is used
import { Terminal } from '@xterm/xterm'; // Updated import
import { FitAddon } from '@xterm/addon-fit'; // Updated import
import { WebLinksAddon } from '@xterm/addon-web-links'; // Updated import
import '@xterm/xterm/css/xterm.css'; // Updated import for styles
import { useAuth } from '@/context/AuthContext'; // Import the useAuth hook
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Import Card components & CardDescription
import { Button } from '@/components/ui/button'; // Import Button
import { Power, PowerOff } from 'lucide-react'; // Import icons for toggle button

const TerminalPage: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termInstance = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null); // Allow null initially
  const ws = useRef<WebSocket | null>(null);
  const { token, isLoading } = useAuth(); // Use the hook to get token and loading state
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false); // Track xterm.js init state
  // Initialize based on token presence - assumes user wants session active if logged in
  const [isSessionActive, setIsSessionActive] = useState(!!token);

  // Function to manually start (if needed, though auto-start is back)
  const startTerminal = () => {
    setError(null);
    setIsSessionActive(true);
  };

  // Function to stop the terminal session (sends terminate msg, then closes WS)
  const stopTerminal = () => {
    console.log('[TerminalPage] Stop button clicked, sending terminate message and closing WebSocket.');
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        // Send a special message to request termination
        ws.current.send(JSON.stringify({ action: "terminate_session" }));
    }
    ws.current?.close(); // Close the WebSocket connection anyway
    termInstance.current?.clear(); // Clear the terminal display
    termInstance.current?.writeln('\r\n\x1b[33mSession stopped by user.\x1b[0m');
    setIsSessionActive(false); // Update state
    setIsConnected(false); // Update connection status display
    // No need to call cleanupFunc here, ws.onclose will trigger parts of it
  };


  useEffect(() => {
    // Effect now runs when isSessionActive becomes true
    if (!isSessionActive || !terminalRef.current || isLoading || !token || isInitialized) {
      // console.log(`[TerminalPage] useEffect: Skipping initialization (active:${isSessionActive}, ref:${!!terminalRef.current}, loading:${isLoading}, token:${!!token}, initialized:${isInitialized})`);
      return;
    }

    // --- Initialization logic wrapped in timeout ---
    let cleanupFunc = () => {
        // Default cleanup if timeout doesn't run or fails early
        console.log('[TerminalPage] Running default cleanup (init likely skipped or failed early).');
        // clearTimeout(timerId); // timerId not accessible here, but timeout won't run if effect reruns before it
        setIsInitialized(false); // Ensure reset
    };

    const timerId = setTimeout(() => {
      console.log('[TerminalPage] Initializing Terminal and WebSocket (post-timeout)...');

      // Double check conditions haven't changed during timeout
      if (!terminalRef.current || isLoading || !token) {
          console.log('[TerminalPage] Conditions changed during timeout, aborting init.');
          setIsInitialized(false); // Reset if conditions changed
          return;
      }

      setIsInitialized(true); // Mark as initialized *before* async operations

      const term = new Terminal({
        cursorBlink: true,
        convertEol: true, // Convert line endings for Windows compatibility
      });
      termInstance.current = term;

      const currentFitAddon = new FitAddon();
      fitAddon.current = currentFitAddon;
      const webLinksAddon = new WebLinksAddon();
      term.loadAddon(currentFitAddon);
      term.loadAddon(webLinksAddon);

      // Check ref again before opening
      if (!terminalRef.current) {
          console.error('[TerminalPage] Terminal ref became null before opening.');
          setIsInitialized(false); // Reset
          return;
      }
      term.open(terminalRef.current);
      currentFitAddon.fit();

      const wsUrl = `ws://localhost:5000/terminal?token=${encodeURIComponent(token)}`;
      console.log(`[TerminalPage] Connecting to WebSocket: ${wsUrl}`);
      const currentWs = new WebSocket(wsUrl);
      ws.current = currentWs;

      currentWs.onopen = () => {
        console.log('[TerminalPage] WebSocket Connected');
        setIsConnected(true);
        setError(null);
        // setIsInitialized(true); // Already set above
        term.writeln('Welcome to the PowerShell Terminal!');
        term.writeln('');
      };

      currentWs.onmessage = (event) => {
        console.log(`[TerminalPage] WebSocket Message Received: ${event.data.substring(0, 100)}${event.data.length > 100 ? '...' : ''}`);
        // Check if terminal still exists before writing
        if (termInstance.current) {
            termInstance.current.write(event.data);
        }
      };

      currentWs.onerror = (event) => {
        console.error('[TerminalPage] WebSocket Error:', event);
        setError('WebSocket connection error. Check backend console.');
        if (termInstance.current) {
            termInstance.current.writeln('\r\n\x1b[31m[TerminalPage] WebSocket Error. Connection failed or was interrupted.\x1b[0m');
        }
        setIsConnected(false);
        setIsInitialized(false); // Allow re-initialization on error
      };

      currentWs.onclose = (event) => {
        console.log(`[TerminalPage] WebSocket Closed: Code=${event.code}, Reason=${event.reason}`);
        setIsConnected(false);
        if (!error) {
            setError(`WebSocket disconnected (${event.code}).`);
        }
        if (termInstance.current) {
            termInstance.current.writeln(`\r\n\x1b[33mWebSocket Disconnected (Code: ${event.code}).\x1b[0m`);
        }
        // Let cleanup handle disposal, but reset initialized state
        setIsInitialized(false);
      };

      let command = '';
      const onDataDisposable = term.onData((data: string) => {
        const currentTerm = termInstance.current;
        const webSocket = ws.current;
        if (!currentTerm || !webSocket || webSocket.readyState !== WebSocket.OPEN) {
          console.warn('[TerminalPage] Terminal or WebSocket not ready, ignoring input.');
          return;
        }
        const code = data.charCodeAt(0);
        if (code === 13) {
          console.log(`[TerminalPage] Sending command: ${command}`);
          webSocket.send(command + '\n');
          currentTerm.write('\r\n');
          command = '';
        } else if (code === 127) {
          if (command.length > 0) {
            currentTerm.write('\b \b');
            command = command.slice(0, -1);
          }
        } else if (code >= 32 && code <= 254) {
          command += data;
          currentTerm.write(data);
        } else {
          console.log(`[TerminalPage] Ignored non-printable key code: ${code}`);
        }
      });

      const handleResize = () => {
        if (termInstance.current && fitAddon.current) {
          console.log('[TerminalPage] Window resized, fitting terminal.');
          fitAddon.current.fit();
        } else {
          console.log('[TerminalPage] Window resized, but terminal/addon instance is disposed. Skipping fit.');
        }
      };
      window.addEventListener('resize', handleResize);

      term.focus();

      // Update cleanup function specifically for successful initialization
      cleanupFunc = () => {
          console.log('[TerminalPage] Cleaning up terminal component (from successful init)...');
          window.removeEventListener('resize', handleResize);
          if (termInstance.current) {
              onDataDisposable.dispose(); // Dispose listener
              console.log('[TerminalPage] Disposing terminal instance.');
              termInstance.current.dispose(); // Dispose terminal
          }
          termInstance.current = null;
          if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) {
            console.log('[TerminalPage] Closing WebSocket connection.');
            ws.current.close();
          }
          ws.current = null;
          fitAddon.current = null;
          setIsInitialized(false); // Reset init flag
          setIsConnected(false); // Reset connection status
          // If cleanup happens due to error/exit, ensure session is marked inactive
          // setIsSessionActive(false); // Let's test without this first, rely on ws.onclose
      };

    }, 10); // Slightly increased timeout delay

    // --- Cleanup function definition ---
    return () => {
        clearTimeout(timerId); // Always clear timeout on cleanup
        cleanupFunc(); // Call the currently defined cleanup function
    };
    // Rerun effect ONLY if isSessionActive becomes true
  }, [isSessionActive, token]); // Keep token dependency for re-auth check if needed

  // Removed useEffect that auto-started based on token

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between"> {/* Use flex for button alignment */}
        <div>
          <CardTitle>PowerShell Terminal</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            Status: {isSessionActive && !error ? (isConnected ? <span className="text-green-500">Connected</span> : <span className="text-yellow-500">Connecting...</span>) : <span className="text-gray-500">Stopped</span>}
            {error && <span className="ml-2 text-red-500">({error})</span>}
            {isLoading && !token && <span className="ml-2 text-blue-500">Checking auth...</span>}
            {!token && !isLoading && <span className="ml-2 text-red-500">Not logged in.</span>}
          </CardDescription>
        </div>
        {/* Start/Stop Toggle Button */}
        <Button
          variant="outline"
          size="lg" // Make button larger
          onClick={isSessionActive ? stopTerminal : startTerminal}
          disabled={isLoading || !token}
          className="w-32" // Give fixed width
        >
          {isSessionActive ? (
            <>
              <PowerOff className="mr-2 h-5 w-5 text-red-500" /> Stop
            </>
          ) : (
            <>
              <Power className="mr-2 h-5 w-5 text-green-500" /> Start
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        {/* Terminal container - always render the div */}
        {/* Adding padding here */}
        <div ref={terminalRef} className="w-full h-full p-2 bg-muted/30 rounded-b-md" />
      </CardContent>
    </Card>
  );
};

export default TerminalPage;
