import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ChatRequestBody, Document, Citation, ChatHistoryItem } from '@/app/api/chat/interfaces';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');


const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const claudeCache = new Map<string, { reply: string, citations: Citation[] }>();

export async function generateChatResponse(message: string, userId: string) {
  const supabase = createRouteHandlerClient({ cookies });

  // 1. Generate embedding for the user's message
  const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
  const embeddingResponse = await embeddingModel.embedContent({
    content: { role: 'user', parts: [{ text: message }] },
  });

  const userMessageEmbedding = embeddingResponse.embedding?.values ?? [];

  // 2. Query the vector database for relevant document snippets
  const { data, error: matchError } = await supabase.rpc('match_documents', {
    query_embedding: userMessageEmbedding,
    match_threshold: 0.78, // Adjust as needed
    match_count: 5, // Number of top matches to retrieve
  });

  const documents = data as Document[] | null;

  if (matchError) {
    console.error('Error matching documents:', matchError);
    throw new Error('Failed to retrieve relevant documents');
  }

  let context = "";
  let citations: Citation[] = [];

  if (documents && documents.length > 0) {
    context = documents.map((doc: Document) => doc.content).join("\n\n");
    citations = documents.map((doc: Document) => ({
      id: doc.id,
      title: doc.filename,
      url: doc.file_url,
    }));
  }

  // 3. Integrate with LLM to generate context-aware response
  const prompt = `You are a helpful medical assistant. Answer the user's question based on the provided context. If you cannot find the answer in the context, state that you don't have enough information.\n\nContext:\n${context}\n\nUser Question: ${message}`;

  // Check cache for existing response
  if (claudeCache.has(prompt)) {
    const cachedResponse = claudeCache.get(prompt);
    if (cachedResponse) {
      return cachedResponse;
    }
  }

  const llmResponse = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20240620',
    max_tokens: 1000,
    messages: [
      { role: 'user', content: prompt }
    ],
  });

  const reply = llmResponse.content[0].text;

  // Cache the response
  claudeCache.set(prompt, { reply, citations });

  // 4. Store chat history in Supabase
  const { error: insertChatError } = await supabase
    .from('chat_history')
    .insert<ChatHistoryItem>({
      user_id: userId,
      user_message: message,
      ai_reply: reply,
    });

  if (insertChatError) {
    console.error('Error storing chat history:', insertChatError);
    // Do not throw error here, as chat response was successful
  }

  return { reply, citations };
}
