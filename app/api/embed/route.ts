import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to chunk text (simple example, can be more sophisticated)
function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(i + chunkSize, text.length);
    let chunk = text.substring(i, end);

    // If it's not the last chunk, try to end at a sentence boundary
    if (end < text.length) {
      const lastSentenceEnd = chunk.lastIndexOf('.');
      if (lastSentenceEnd > chunk.length - overlap) {
        chunk = chunk.substring(0, lastSentenceEnd + 1);
      }
    }
    chunks.push(chunk);
    i += chunk.length - overlap;
    if (i < 0) i = 0; // Prevent negative index if chunk is very small
  }
  return chunks;
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { documentId, extractedText, structuredData } = body;

    if (!documentId || (!extractedText && !structuredData)) {
      return NextResponse.json({ error: 'Document ID and either extracted text or structured data are required' }, { status: 400 });
    }

    const contentToEmbed = extractedText || JSON.stringify(structuredData);

    // Chunk the content
    const textChunks = chunkText(contentToEmbed);
    const embeddingsToInsert = [];

    for (const chunk of textChunks) {
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: chunk,
      });

      const embedding = embeddingResponse.data[0].embedding;

      embeddingsToInsert.push({
        document_id: documentId,
        content: chunk,
        embedding: embedding,
        metadata: {},
      });
    }

    const { error: insertError } = await supabase
      .from('document_embeddings')
      .insert(embeddingsToInsert);

    if (insertError) {
      console.error('Error inserting embeddings:', insertError);
      return NextResponse.json({ error: 'Failed to store embeddings' }, { status: 500 });
    }

    return NextResponse.json({ message: `Embeddings generated and stored for document ${documentId}` }, { status: 200 });

  } catch (error) {
    console.error('Error in embed API route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
