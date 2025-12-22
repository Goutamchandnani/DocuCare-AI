import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 1. Generate embedding for the user's message
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: message,
    });

    const userMessageEmbedding = embeddingResponse.data[0].embedding;

    // 2. Query the vector database for relevant document snippets
    const { data: documents, error: matchError } = await supabase.rpc('match_documents', {
      query_embedding: userMessageEmbedding,
      match_threshold: 0.78, // Adjust as needed
      match_count: 5, // Number of top matches to retrieve
    });

    if (matchError) {
      console.error('Error matching documents:', matchError);
      return NextResponse.json({ error: 'Failed to retrieve relevant documents' }, { status: 500 });
    }

    let context = "";
    if (documents && documents.length > 0) {
      context = documents.map((doc: any) => doc.content).join("\n\n");
    }

    // 3. Integrate with LLM to generate context-aware response
    const prompt = `You are a helpful medical assistant. Answer the user's question based on the provided context. If you cannot find the answer in the context, state that you don't have enough information.

Context:\n${context}\n
User Question: ${message}`;

    const llmResponse = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1000,
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    const reply = llmResponse.content[0].text;

    // 4. Store chat history in Supabase
    const { error: insertChatError } = await supabase
      .from('chat_history')
      .insert({
        user_id: user.id,
        user_message: message,
        ai_reply: reply,
      });

    if (insertChatError) {
      console.error('Error storing chat history:', insertChatError);
    }

    return NextResponse.json({ reply }, { status: 200 });

  } catch (error) {
    console.error('Error in chat API route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
