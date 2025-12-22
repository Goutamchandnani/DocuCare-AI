"use client"

import { ChatInterface } from '@/components/ChatInterface'

export default function ChatPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">AI Chat Assistant</h1>
      <ChatInterface />
    </div>
  )
}
