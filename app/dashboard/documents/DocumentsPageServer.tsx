import { createServerClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Document } from '@/types'
import DocumentsPageClient from './DocumentsPageClient'

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: { query?: string; type?: string }
}) {
  const supabase = createServerClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { query, type } = searchParams
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

  const { data: documents, error } = await documentsQuery.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching documents:', error)
    return <p>Error loading documents.</p>
  }

  const uploadDocument = async (formData: FormData) => {
    'use server'
    const file = formData.get('file') as File
    const documentType = formData.get('document_type') as string

    if (!file) {
      console.error('No file selected')
      return
    }

    const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json()
      console.error('Error uploading document:', errorData.error)
    }

    redirect('/dashboard/documents')
  }

  return (
    <DocumentsPageClient
      documents={documents || []}
      initialQuery={query}
      initialType={type}
      uploadDocument={uploadDocument}
    />
  )
}