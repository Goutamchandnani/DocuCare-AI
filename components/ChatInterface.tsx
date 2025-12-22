"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
  citations?: { id: string; title: string; url: string }[];
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  const handleSendMessage = async () => {
    if (input.trim() === '') return

    const newUserMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
    }
    setMessages((prevMessages) => [...prevMessages, newUserMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const aiResponse: Message = {
        id: messages.length + 2,
        text: data.response,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
        citations: data.citations || [],
      }
      setMessages((prevMessages) => [...prevMessages, aiResponse])
    } catch (err: any) {
      const errorMessage: Message = {
        id: messages.length + 2,
        text: `Error: ${err.message}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prevMessages) => [...prevMessages, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto flex flex-col h-[80vh] sm:h-[70vh]">
      <CardHeader>
        <CardTitle>HealthDoc AI Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${message.sender === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800'
                }`}
            >
              <p>{message.text}</p>
              {message.citations && message.citations.length > 0 && (
                <div className="mt-2 text-xs opacity-90">
                  <strong>Sources:</strong>
                  <ul className="list-disc list-inside">
                    {message.citations.map((citation, index) => (
                      <li key={index}>
                        <a href={citation.url} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
                          {citation.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <span className="text-xs opacity-75 mt-1 block">{message.timestamp}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter className="flex space-x-2 p-4 border-t">
        <Input
          placeholder={isLoading ? "Sending..." : "Ask me anything about your health documents..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !isLoading) {
              handleSendMessage()
            }
          }}
          disabled={isLoading}
          className="flex-1"
        />
        <Button onClick={handleSendMessage} disabled={isLoading}>Send</Button>
      </CardFooter>
    </Card>
  )
}
