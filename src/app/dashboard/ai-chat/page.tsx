"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select components

// Define message structure
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Tracks user input lock
  const [isAiTyping, setIsAiTyping] = useState(false); // Tracks AI response pending
  const [selectedModel, setSelectedModel] = useState('PetrosStav/gemma3-tools:4b'); // State for selected model
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const availableModels = ['PetrosStav/gemma3-tools:4b', 'gemma3']; // Define available models

  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      // Use setTimeout to ensure scroll happens after DOM update
      setTimeout(() => {
        scrollAreaRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        // A more direct approach if ScrollArea exposes its viewport:
        // const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        // if (viewport) viewport.scrollTop = viewport.scrollHeight;
      }, 100);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const newUserMessage: ChatMessage = { role: 'user', content: trimmedInput };
    const currentMessages = [...messages, newUserMessage];
    setMessages(currentMessages);
    setInput('');
    setIsLoading(true); // Disable user input
    setIsAiTyping(true); // Show typing indicator

    try {
      // Prepare messages in the format expected by the backend/Ollama
      const apiMessages = currentMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'; // Fallback just in case
      const response = await fetch(`${backendUrl}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization header if needed
          // 'Authorization': `Bearer ${your_auth_token}`
        },
        body: JSON.stringify({ messages: apiMessages, model: selectedModel }), // Send selected model
      });

      setIsLoading(false); // Re-enable user input
      setIsAiTyping(false); // Hide typing indicator

      if (!response.ok) {
        let errorMsg = 'Failed to get response from server.';
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || `API Error (${response.status}): ${response.statusText}`;
          console.error('API Error Response:', errorData);
        } catch (jsonError) {
          // If response is not JSON (e.g., HTML error page)
          errorMsg = `API Error (${response.status}): ${response.statusText}. Server did not return valid JSON.`;
          console.error('API Error: Non-JSON response', response.status, response.statusText);
        }
        setMessages([
          ...currentMessages,
          { role: 'assistant', content: `Error: ${errorMsg}` }
        ]);
        return;
      }

      const data = await response.json();

      // Check if the response is a tool execution result
      if (data.type === 'tool_result') {
        let outputContent = `> Executed: ${data.commandExecuted}\n\n`;
        if (data.stdout) {
          outputContent += `--- stdout ---\n${data.stdout}\n`;
        }
        if (data.stderr) {
          outputContent += `--- stderr ---\n${data.stderr}\n`;
        }
        setMessages([...currentMessages, { role: 'assistant', content: outputContent.trim() }]);
      } else if (data.message && data.message.content) {
        // Handle regular chat message
        setMessages([...currentMessages, { role: 'assistant', content: data.message.content }]);
      } else {
        // Handle unexpected format
        console.error('Unexpected response format:', data);
        setMessages([...currentMessages, { role: 'assistant', content: 'Received an unexpected response format from the AI.' }]);
      }

    } catch (error) {
      setIsLoading(false); // Re-enable user input
      setIsAiTyping(false); // Hide typing indicator
      let networkErrorMsg = 'Failed to connect to the server.';
      if (error instanceof Error) {
        networkErrorMsg = error.message;
      }
      console.error('Network or fetch error:', error);
      setMessages([
        ...currentMessages,
        { role: 'assistant', content: `Network error: ${networkErrorMsg}` }
      ]);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <Card className="flex flex-col flex-grow">
        {/* Header only contains title now */}
        <CardHeader>
          <CardTitle>AI Chat ({selectedModel})</CardTitle> {/* Display selected model */}
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
          <ScrollArea className="h-full pr-4"> {/* Adjust height/padding as needed */}
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span
                    className={`p-2 rounded-lg max-w-[85%] ${ // Increased max-width slightly
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : message.content.startsWith('Error:') || message.content.startsWith('Network error:')
                          ? 'bg-destructive text-destructive-foreground' // Error styling
                          : 'bg-muted' // Default assistant styling
                    } whitespace-pre-wrap`} // Keep whitespace formatting
                  >
                    {/* Use <pre> for assistant messages containing newlines (likely command output or code blocks) */}
                    {message.role === 'assistant' && message.content.includes('\n') && !(message.content.startsWith('Error:') || message.content.startsWith('Network error:')) ? (
                      // Add specific styling for command output/code blocks
                      <pre className="text-xs font-mono bg-background/50 p-2 rounded-sm overflow-x-auto">{message.content}</pre>
                    ) : (
                      message.content
                    )}
                  </span>
                </div>
              ))}
              {/* AI Typing Indicator */}
              {isAiTyping && (
                <div className="flex justify-start">
                  <span className="p-2 rounded-lg bg-muted text-muted-foreground italic">
                    AI is typing...
                  </span>
                </div>
              )}
               {/* Add a dummy div to help scrolling to the bottom */}
               <div ref={scrollAreaRef} />
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="pt-4 border-t"> {/* Added border-t */}
          <div className="flex w-full items-center gap-2"> {/* Use gap instead of space-x */}
            {/* Model Selector moved here */}
            <Select value={selectedModel} onValueChange={setSelectedModel} disabled={isLoading}>
              <SelectTrigger className="w-auto flex-shrink-0"> {/* Adjust width */}
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map(model => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-grow"
            />
            <Button onClick={handleSendMessage} disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
