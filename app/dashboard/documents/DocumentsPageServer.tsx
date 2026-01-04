import { createServerClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Document } from '@/types'
import DocumentsPageClient from './DocumentsPageClient'

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: { query?: string; type?: string; page?: string; pageSize?: string }
}) {
  const supabase = createServerClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { query, type, page, pageSize } = searchParams
  const currentPage = parseInt(page || '1', 10)
  const itemsPerPage = parseInt(pageSize || '10', 10)
  const offset = (currentPage - 1) * itemsPerPage
  const limit = itemsPerPage
  let documentsQuery = supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)

  if (query) {
    documentsQuery = documentsQuery.or(`filename.ilike.%${query}%,extracted_text.ilike.%${query}%,ai_summary.ilike.%${query}%`)
  }

  if (type) {
    documentsQuery = documentsQuery.eq('document_type', type)
  }

  const { count: totalCount, error: countError } = await supabase
    .from('documents')
    .select('id', { count: 'exact' })
    .eq('user_id', user.id)
    .filter('filename', 'ilike', `%${query || ''}%`)
    .filter('document_type', 'eq', type || '')
    .limit(0)

  if (countError) {
    console.error('Error fetching document count:', countError)
    return <p>Error loading document count.</p>
  }

  const { data: documents, error } = await documentsQuery
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching documents:', error)
    return <p>Error loading documents.</p>
  }

  const uploadDocument = async (formData: FormData): Promise<{ success: boolean; message: string }> => {
    'use server'
    const file = formData.get('file') as File
    const documentType = formData.get('document_type') as string

    if (!file) {
      return { success: false, message: 'No file selected.' }
    }

    try {
      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/ocr`, {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        console.error('Error uploading document:', errorData.error)
        return { success: false, message: errorData.error || 'An unknown error occurred during upload.' }
      }

      revalidatePath('/dashboard/documents')
      return { success: true, message: 'Document uploaded successfully!' }
    } catch (networkError: any) {
      console.error('Network error during document upload:', networkError)
      return { success: false, message: `Network error or server unreachable: ${networkError.message}` }
    }
  }

  return (
    <DocumentsPageClient
      documents={documents || []}
      initialQuery={query}
      initialType={type}
      uploadDocument={uploadDocument}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      totalCount={totalCount || 0}
    />
  )
}