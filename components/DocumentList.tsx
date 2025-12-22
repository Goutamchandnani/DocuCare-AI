"use client";

import React from 'react';
import Link from 'next/link';

interface Document {
  id: string;
  filename: string;
  document_type: string;
  created_at: string;
}

interface DocumentListProps {
  documents: Document[];
  onDelete: (documentId: string) => void;
}

export default function DocumentList({ documents, onDelete }: DocumentListProps) {
  if (documents.length === 0) {
    return <p className="text-center text-gray-500">No documents found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg">
        <thead>
          <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">Filename</th>
            <th className="py-3 px-6 text-left">Type</th>
            <th className="py-3 px-6 text-left">Uploaded On</th>
            <th className="py-3 px-6 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {documents.map((doc) => (
            <tr key={doc.id} className="border-b border-gray-200 hover:bg-gray-100">
              <td className="py-3 px-6 text-left whitespace-nowrap">
                <Link href={`/documents/${doc.id}`} className="text-blue-600 hover:underline">
                  {doc.filename}
                </Link>
              </td>
              <td className="py-3 px-6 text-left">{doc.document_type}</td>
              <td className="py-3 px-6 text-left">{new Date(doc.created_at).toLocaleDateString()}</td>
              <td className="py-3 px-6 text-center">
                <button
                  onClick={() => onDelete(doc.id)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
