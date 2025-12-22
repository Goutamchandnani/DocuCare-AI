"use client";

import React, { useState, FormEvent } from 'react';

interface ChatMessage {
  sender: 'user' | 'ai';
  message: string;
}

export default function ChatWindow() {
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = { sender: 'user', message: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage: ChatMessage = { sender: 'ai', message: data.reply };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'ai', message: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md p-4">
      <div className="flex-grow overflow-y-auto mb-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500">Start a conversation...</div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-2 p-2 rounded-lg ${
                msg.sender === 'user' ? 'bg-blue-100 self-end' : 'bg-gray-100 self-start'
              }`}
            >
              <strong>{msg.sender === 'user' ? 'You' : 'AI'}:</strong> {msg.message}
            </div>
          ))
        )}
        {loading && (
          <div className="mb-2 p-2 rounded-lg bg-gray-100 self-start">
            <strong>AI:</strong> Thinking...
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow border border-gray-300 rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          Send
        </button>
      </form>
    </div>
  );
}
