import { createServerClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse, NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  const supabase = createServerClient(cookies())

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File
  const documentType = formData.get('documentType') as string

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${uuidv4()}.${fileExt}`
  const filePath = `${user.id}/${fileName}`

  try {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, { cacheControl: '3600', upsert: false })

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: publicUrlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    const fileUrl = publicUrlData.publicUrl

    let extractedText = ''
    let aiSummary = ''
    let structuredData = {}

    // Call OCR API for all supported file types
    const ocrResponse = await fetch(`${req.nextUrl.origin}/api/ocr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileUrl }),
    })

    if (ocrResponse.ok) {
      const ocrData = await ocrResponse.json()
      extractedText = ocrData.extractedText || ''

      // Call AI extraction API if text was extracted
      if (extractedText) {
        const extractResponse = await fetch(`${req.nextUrl.origin}/api/extract`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ extractedText }),
        })

        if (extractResponse.ok) {
          const extractData = await extractResponse.json()
          structuredData = extractData.structuredData || {}
        } else {
          console.error('Error calling AI extraction API:', extractResponse.statusText)
        }
      }
    } else {
      console.error('Error calling OCR API:', ocrResponse.statusText)
    }

    const { data: document, error: insertError } = await supabase
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
      .single()

    if (insertError) {
      console.error('Supabase document insert error:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Call the embed API to generate and store embeddings
    if (document) {
      const embedResponse = await fetch(`${req.nextUrl.origin}/api/embed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: document.id,
          extractedText: extractedText,
          structuredData: structuredData,
        }),
      });

      if (!embedResponse.ok) {
        console.error('Error calling embed API:', embedResponse.statusText);
        // Optionally, handle this error more gracefully, e.g., log and continue without embeddings
      }
    }

    return NextResponse.json({ message: 'File uploaded and document created', document }, { status: 200 })
  } catch (error: any) {
    console.error('Unexpected error in upload API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
