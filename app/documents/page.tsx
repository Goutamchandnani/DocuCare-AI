"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import DocumentSearchFilter from '../../components/DocumentSearchFilter';
import { Skeleton } from "@/components/ui/skeleton";
import DocumentGrid from '../../components/DocumentGrid';
import { UploadZone } from '../../components/UploadZone';

interface Document {
  id: string;
  filename: string;
  document_type: string;
  created_at: string;
  aiSummary?: string;
}

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('User not authenticated.');
      setLoading(false);
      return;
    }

    const queryParams = new URLSearchParams();
    if (searchTerm) {
      queryParams.append('searchTerm', searchTerm);
    }
    if (filterType && filterType !== 'all') {
      queryParams.append('filterType', filterType);
    }

    const url = `/api/documents?${queryParams.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDocuments(data as Document[]);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      setError(`Failed to load documents: ${err.message}`);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterType, supabase]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilter = (type: string) => {
    setFilterType(type);
  };

  const handleDelete = async (documentId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete document');
      }
      fetchDocuments(); // Re-fetch documents after deletion
    } catch (err: any) {
      console.error('Error deleting document:', err.message);
      alert(`Failed to delete document: ${err.message}`);
    }
  };

  const uploadDocument = useCallback(async (formData: FormData): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.error || 'An unknown error occurred during upload.' };
      }

      // Assuming successful upload, re-fetch documents
      fetchDocuments();
      return { success: true, message: 'Document uploaded successfully!' };
    } catch (error: any) {
      console.error('Error uploading document:', error);
      return { success: false, message: `Network error or server unreachable: ${error.message}` };
    }
  }, [fetchDocuments]);

  if (loading) return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">
        <Skeleton className="h-9 w-1/3" />
      </h1>
      <div className="mb-6">
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    </div>
  );
  if (error) return <div className="container mx-auto p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Your Documents</h1>
      <div className="mb-6">
        <UploadZone onUploadSuccess={fetchDocuments} uploadDocument={uploadDocument} />
      </div>
      <DocumentSearchFilter onSearch={handleSearch} onFilter={handleFilter} />
      <DocumentGrid documents={documents} onDelete={handleDelete} />
      {documents.length === 0 && !loading && !error && (
        <div className="text-center py-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="mx-auto h-12 w-12 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 21h7.5V6.75a3.75 3.75 0 00-3.75-3.75H9.75M10.5 21v-7.5M6 7.5h3v3H6V7.5z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            No documents found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by uploading a new document.
          </p>
        </div>
      )}
    </div>
  );
}
