import { createServerClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse, NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { ApiError } from '@/lib/api-error'
import { retry } from '@/lib/utils'
import { PostgrestSingleResponse } from '@supabase/supabase-js'
import { Document } from '@/types'

export async function POST(req: NextRequest) {
  const supabase = createServerClient(cookies())

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new ApiError('Authentication required.', 401)
  }

  const formData = await req.formData()
  const file = formData.get('file') as File
  const documentType = formData.get('documentType') as string

  if (!file) {
    throw new ApiError('No file was provided for upload.', 400)
  }

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    throw new ApiError('Invalid file type. Please upload a PDF, JPEG, or PNG image.', 400);
  }

  if (file.size > maxFileSize) {
    throw new ApiError('File size exceeds the maximum limit of 10MB.', 400);
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${uuidv4()}.${fileExt}`
  const filePath = `${user.id}/${fileName}`

  try {
    const { data: uploadData, error: uploadError } = await retry(() =>
      supabase.storage
        .from('documents')
        .upload(filePath, file, { cacheControl: '3600', upsert: false })
    )

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError)
      throw new ApiError('Failed to upload file to storage. Please try again.', 500)
    }

    const { data: publicUrlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    const fileUrl = publicUrlData.publicUrl

    let extractedText = ''
    let aiSummary = ''
    let structuredData = {}
    let ocrFailed = false;

    // Call OCR API for all supported file types
    const ocrResponse = await retry(() => fetch(`${req.nextUrl.origin}/api/ocr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileUrl }),
    }))

    if (ocrResponse.ok) {
      const ocrData = await ocrResponse.json()
      extractedText = ocrData.extractedText || ''
      ocrFailed = false;

      // Call AI extraction API if text was extracted
      if (extractedText) {
        const extractResponse = await retry(() => fetch(`${req.nextUrl.origin}/api/extract`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ extractedText }),
        }))

        if (extractResponse.ok) {
          const extractData = await extractResponse.json()
          structuredData = extractData.structuredData || {}
          aiSummary = extractData.aiSummary || ''
        } else {
          console.error('Error calling AI extraction API:', extractResponse.statusText)
          throw new ApiError('Failed to extract information from the document.', 500)
        }
      }
    } else {
      console.error('Error calling OCR API:', ocrResponse.statusText)
      ocrFailed = true;
      // Do not throw an error here, allow graceful degradation
    }

    const { data: document, error: insertError }: PostgrestSingleResponse<Document> = await retry(async () => {
      return await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          filename: file.name,
          file_url: fileUrl,
          document_type: documentType,
          extracted_text: extractedText, // Filled by OCR API
          ai_summary: aiSummary, // Filled by analyze API
          structured_data: structuredData, // Filled by AI extraction API
          metadata: {},
        })
        .select()
        .single();
    })

    if (insertError) {
      console.error('Supabase document insert error:', insertError)
      throw new ApiError('Failed to record document details. Please try again.', 500)
    }

    // Call the embed API to generate and store embeddings
    if (document) {
      const embedResponse = await retry(() => fetch(`${req.nextUrl.origin}/api/embed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: document.id,
          extractedText: extractedText,
          structuredData: structuredData,
        }),
      }));

      if (!embedResponse.ok) {
        console.error('Error calling embed API:', embedResponse.statusText);
        // Optionally, handle this error more gracefully, e.g., log and continue without embeddings
      }
    }

    return NextResponse.json({ message: 'File uploaded and document created', document, ocrFailed }, { status: 200 })
  } catch (error: any) {
    console.error('Unexpected error in upload API:', error)
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    return NextResponse.json({ error: 'An unexpected error occurred during file processing.' }, { status: 500 })
  }
}
