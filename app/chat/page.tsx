"use client";

import ChatWindow from '../../components/ChatWindow';

export default function ChatPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">DocuCare AI Chat</h1>
      <div className="w-full max-w-2xl h-[70vh]">
        <ChatWindow />
      </div>
    </div>
  );
}
