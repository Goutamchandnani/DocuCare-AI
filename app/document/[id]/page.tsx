import { createServerClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { Document } from '@/types'
import { AddMedicationFromDocumentButton } from '@/components/AddMedicationFromDocumentButton'

export default async function DocumentDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient(cookies())

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: document, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !document) {
    console.error('Error fetching document:', error)
    redirect('/dashboard')
  }

  const isPdf = document.file_url.endsWith('.pdf')
  const isImage = document.file_url.endsWith('.png') || document.file_url.endsWith('.jpg') || document.file_url.endsWith('.jpeg')

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold">Document Detail Page</h1>
      <p className="text-lg mt-4">Document ID: {params.id}</p>
      <div className="mt-8 w-full max-w-2xl bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">{document.filename}</h2>
        <p className="text-gray-700 mb-2"><strong>Type:</strong> {document.document_type}</p>
        <p className="text-gray-700 mb-2"><strong>Uploaded:</strong> {new Date(document.created_at).toLocaleDateString()}</p>
        {document.ai_summary && <p className="text-gray-800 mb-2"><strong>AI Summary:</strong> {document.ai_summary}</p>}
        {document.extracted_text && <p className="text-gray-800"><strong>Extracted Text:</strong> {document.extracted_text}</p>}

        {document.document_type === 'prescription' && (
          <div className="mt-4">
            <AddMedicationFromDocumentButton document={document} />
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Document Preview</h3>
          {isPdf && (
            <iframe src={document.file_url} className="w-full h-96 border rounded-lg"></iframe>
          )}
          {isImage && (
            <Image src={document.file_url} alt="Document Preview" width={800} height={600} className="w-full h-auto object-contain border rounded-lg" />
          )}
          {!isPdf && !isImage && (
            <p className="text-gray-600">No preview available for this file type.</p>
          )}
        </div>
      </div>
    </div>
  )
}