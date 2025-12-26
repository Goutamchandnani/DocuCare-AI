import { createServerClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse, NextRequest } from 'next/server'
import { ApiError } from '@/lib/api-error'

export async function POST(req: NextRequest) {
  const supabase = createServerClient(cookies())

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new ApiError('Authentication required.', 401)
  }

  const { documentId, extractedText } = await req.json()

  if (!documentId || !extractedText) {
    throw new ApiError('Document ID and extracted text are required.', 400)
  }

  try {
    const { data, error } = await supabase
      .from('documents')
      .update({ extracted_text: extractedText })
      .eq('id', documentId)
      .eq('user_id', user.id) // Ensure user owns the document
      .select()
      .single()

    if (error) {
      console.error('Supabase update document error:', error)
      throw new ApiError('Failed to update document with provided text.', 500)
    }

    if (!data) {
      throw new ApiError('Document not found or user does not have permission.', 404)
    }

    // Optionally, trigger re-analysis or embedding update here if needed
    // For now, we'll just return success.

    return NextResponse.json({ message: 'Document text updated successfully', document: data }, { status: 200 })
  } catch (error: any) {
    console.error('Unexpected error in update-text API:', error)
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
