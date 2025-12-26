import { NextResponse } from 'next/server';
import { ChatRequestBody, ChatSuccessResponse, ChatErrorResponse } from './interfaces';
import { getAuthenticatedUser } from '@/lib/auth-service';
import { generateChatResponse } from '@/lib/chat-service';

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: ChatRequestBody = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json<ChatErrorResponse>({ error: 'Message is required' }, { status: 400 });
    }

    const { reply, citations } = await generateChatResponse(message, user.id);

    return NextResponse.json<ChatSuccessResponse>({ reply, citations }, { status: 200 });

  } catch (error) {
    console.error('Error in chat API route:', error);
    return NextResponse.json<ChatErrorResponse>({ error: 'Internal server error' }, { status: 500 });
  }
}
