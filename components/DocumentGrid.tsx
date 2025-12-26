"use client";

import React from 'react';
import DocumentCard from './DocumentCard';

interface Document {
  id: string;
  filename: string;
  document_type: string;
  created_at: string;
  aiSummary?: string;
}

interface DocumentGridProps {
  documents: Document[];
  onDelete: (documentId: string) => void;
}

export default function DocumentGrid({ documents, onDelete }: DocumentGridProps) {
  if (documents.length === 0) {
    return <p className="text-center text-gray-500">No documents found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} onDelete={onDelete} />
      ))}
    </div>
  );
}
