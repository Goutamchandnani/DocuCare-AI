import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import React from 'react';
import { AddMedicationFromDocumentButton } from '@/components/AddMedicationFromDocumentButton';

interface DocumentDetailsPageProps {
  params: { id: string };
}

export default async function DocumentDetailsPage({ params }: DocumentDetailsPageProps) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    notFound(); // Or redirect to login
  }

  const { data: document, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (error || !document) {
    console.error('Error fetching document details:', error);
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Document Details</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-lg font-semibold">Filename: {document.filename}</p>
        <p className="text-gray-600">Type: {document.document_type}</p>
        <p className="text-gray-600">Uploaded On: {new Date(document.created_at).toLocaleDateString()}</p>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Document Preview</h2>
          {document.file_url ? (
            <iframe src={document.file_url} className="w-full h-[600px] border rounded-md"></iframe>
          ) : (
            <p>No preview available.</p>
          )}
        </div>


        {document.aiSummary && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold">AI Summary</h2>
            <p className="text-gray-700">{document.aiSummary}</p>
          </div>
        )}

        {document.structured_data && Object.keys(document.structured_data).length > 0 && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold">Structured Data</h2>
            <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
              {JSON.stringify(document.structured_data, null, 2)}
            </pre>
          </div>
        )}

        {document.document_type === 'prescription' &&
         document.structured_data &&
         document.structured_data.Medications &&
         document.structured_data.Medications.length > 0 && (
          <div className="mt-6">
            <AddMedicationFromDocumentButton document={document} />
          </div>
        )}
      </div>
    </div>
  );
}
