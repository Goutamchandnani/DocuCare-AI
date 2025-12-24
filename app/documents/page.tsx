"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import DocumentSearchFilter from '../../components/DocumentSearchFilter';
import DocumentList from '../../components/DocumentList';
import { UploadZone } from '../../components/UploadZone';

interface Document {
  id: string;
  filename: string;
  document_type: string;
  created_at: string;
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

  if (loading) return <div className="container mx-auto p-4 text-center">Loading documents...</div>;
  if (error) return <div className="container mx-auto p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Your Documents</h1>
      <div className="mb-6">
        <UploadZone onUploadSuccess={fetchDocuments} />
      </div>
      <DocumentSearchFilter onSearch={handleSearch} onFilter={handleFilter} />
      <DocumentList documents={documents} onDelete={handleDelete} />
    </div>
  );
}
