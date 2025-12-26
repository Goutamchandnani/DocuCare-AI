import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Anthropic from '@anthropic-ai/sdk';
import { ApiError } from '@/lib/api-error';
import { retry } from '@/lib/utils';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new ApiError('Authentication required.', 401);
  }

  try {
    const body = await request.json();
    const { extractedText } = body;

    if (!extractedText) {
      throw new ApiError('Extracted text is missing for analysis.', 400);
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await retry(() => anthropic.messages.create({
      model: "claude-3-sonnet-20240229", // Or another suitable model
      max_tokens: 1000,
      messages: [{ role: "user", content: `Analyze the following medical text: ${extractedText}` }],
    }));

    const aiAnalysis = response.content[0].text;

    return NextResponse.json({ aiAnalysis }, { status: 200 });
  } catch (error) {
    console.error('Error in AI analysis API route:', error);
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'An unexpected error occurred during AI analysis.' }, { status: 500 });
  }
}
