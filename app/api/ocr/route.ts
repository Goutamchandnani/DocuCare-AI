import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { geminiFlash } from '@/lib/gemini';
import { ApiError } from '@/lib/api-error';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // 1. Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get file from form
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 3. Upload to SUPABASE Storage (not Google Cloud!)
    const fileName = `${user.id}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('documents') // Your Supabase bucket
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // 4. Get public URL from Supabase
    const { data: { publicUrl } } = supabase
      .storage
      .from('documents')
      .getPublicUrl(fileName);

    // 5. Process with Gemini (handles OCR + AI analysis)
    const fileBuffer = await file.arrayBuffer();
    const base64File = Buffer.from(fileBuffer).toString('base64');

    const result = await geminiFlash.generateContent([
      {
        inlineData: {
          mimeType: file.type,
          data: base64File
        }
      },
      {
        text: `Analyze this medical document and extract:

1. Plain language summary (2-3 sentences)
2. Document type (prescription/lab_report/other)
3. All medications with dosage and frequency
4. Lab results if present
5. Doctor name and date

Respond in JSON format.`
      }
    ]);

    const analysis = JSON.parse(result.response.text());

    // 6. Save to Supabase Database
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        filename: file.name,
        file_url: publicUrl, // Supabase URL, not Google Cloud!
        file_path: fileName,
        document_type: analysis.documentType,
        ai_summary: analysis.summary,
        extracted_data: analysis,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({
      success: true,
      document,
      analysis
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred during OCR processing.', details: error.message },
      { status: 500 }
    );
  }
}
