"use client";

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface DocumentDetailsProps {
  documentId: string;
}

interface Document {
  id: string;
  filename: string;
  file_url: string;
  document_type: string;
  extracted_text: string;
  ai_summary: string;
  structured_data: any; // This will hold the JSON from AI extraction
  created_at: string;
}

export default function DocumentDetails({ documentId }: DocumentDetailsProps) {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchDocument() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) {
        console.error('Error fetching document:', error);
        setError('Failed to load document details.');
        setDocument(null);
      } else if (data) {
        setDocument(data);
      } else {
        setError('Document not found.');
        setDocument(null);
      }
      setLoading(false);
    }

    if (documentId) {
      fetchDocument();
    }
  }, [documentId, supabase]);

  if (loading) {
    return <div className="p-4 text-center">Loading document details...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  if (!document) {
    return <div className="p-4 text-center">No document selected or found.</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Document: {document.filename}</h2>
      <p className="text-gray-600 mb-2">Type: {document.document_type}</p>
      <p className="text-gray-600 mb-4">Uploaded: {new Date(document.created_at).toLocaleDateString()}</p>

      {document.structured_data && Object.keys(document.structured_data).length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">AI Extracted Information:</h3>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            {Object.entries(document.structured_data).map(([key, value]) => (
              <div key={key} className="mb-2">
                <strong className="capitalize">{key.replace(/_/g, ' ')}:</strong>
                {typeof value === 'object' && value !== null ? (
                  <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-2 rounded-sm mt-1">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                ) : (
                  <span className="ml-2">{String(value)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {document.ai_summary && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">AI Summary:</h3>
          <p className="bg-gray-50 p-4 rounded-md border border-gray-200 whitespace-pre-wrap">
            {document.ai_summary}
          </p>
        </div>
      )}

      {document.extracted_text && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">Raw Extracted Text:</h3>
          <p className="bg-gray-50 p-4 rounded-md border border-gray-200 whitespace-pre-wrap text-sm max-h-60 overflow-y-auto">
            {document.extracted_text}
          </p>
        </div>
      )}
    </div>
  );
}
