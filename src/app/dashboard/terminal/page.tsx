'use client'; // Required for hooks like useState, useEffect, useRef

import React, { useEffect, useRef, useState } from 'react'; // Removed useContext as useAuth is used
import { Terminal } from '@xterm/xterm'; // Updated import
import { FitAddon } from '@xterm/addon-fit'; // Updated import
import { WebLinksAddon } from '@xterm/addon-web-links'; // Updated import
import '@xterm/xterm/css/xterm.css'; // Updated import for styles
import { useAuth } from '@/context/AuthContext'; // Import the useAuth hook

const TerminalPage: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termInstance = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null); // Allow null initially
  const ws = useRef<WebSocket | null>(null);
  const { token, isLoading } = useAuth(); // Use the hook to get token and loading state
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false); // Track initialization state

  useEffect(() => {
    // Wait for auth loading, token, and ensure not already initialized
    if (!terminalRef.current || isLoading || !token || isInitialized) {
      console.log(`[TerminalPage] useEffect: Skipping initialization (ref:${!!terminalRef.current}, loading:${isLoading}, token:${!!token}, initialized:${isInitialized})`);
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
          setIsInitialized(false); // Reset flag
          setIsConnected(false); // Reset connection status
      };

    }, 10); // Slightly increased timeout delay

    // --- Cleanup function definition ---
    return () => {
        clearTimeout(timerId); // Always clear timeout on cleanup
        cleanupFunc(); // Call the currently defined cleanup function
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token || undefined]); // Rerun ONLY when token changes (map null to undefined). isLoading check is inside. isInitialized prevents re-run.

  return (
    <div className="flex flex-col h-full p-4 bg-gray-100 dark:bg-gray-900">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">PowerShell Terminal</h1>
      {!token && !isLoading && <p className="text-red-500">Authentication token not found. Please log in.</p>}
      {isLoading && <p className="text-blue-500">Checking authentication...</p>}
      {error && <p className="text-red-500 mb-2">Error: {error}</p>}
      <div ref={terminalRef} className="flex-grow w-full h-full bg-black" />
      {/* Status Indicator */}
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Status: {isConnected ? <span className="text-green-500">Connected</span> : <span className="text-red-500">Disconnected</span>}
      </div>
    </div>
  );
};

export default TerminalPage;
