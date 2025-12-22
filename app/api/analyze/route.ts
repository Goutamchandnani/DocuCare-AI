import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { extractedText } = body;

    if (!extractedText) {
      return NextResponse.json({ error: 'Extracted text is required for analysis' }, { status: 400 });
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229", // Or another suitable model
      max_tokens: 1000,
      messages: [{ role: "user", content: `Analyze the following medical text: ${extractedText}` }],
    });

    const aiAnalysis = response.content[0].text;

    return NextResponse.json({ aiAnalysis }, { status: 200 });
  } catch (error) {
    console.error('Error in AI analysis API route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
