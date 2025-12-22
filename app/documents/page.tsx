"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import DocumentSearchFilter from '../../components/DocumentSearchFilter';
import DocumentList from '../../components/DocumentList';

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

    let query = supabase
      .from('documents')
      .select('id, filename, document_type, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (filterType !== 'all') {
      query = query.eq('document_type', filterType);
    }

    if (searchTerm) {
      query = query.ilike('filename', `%{searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to load documents.');
      setDocuments([]);
    } else if (data) {
      setDocuments(data as Document[]);
    } else {
      setDocuments([]);
    }
    setLoading(false);
  }, [supabase, filterType, searchTerm]);

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
      // This will require a new API route for deletion
      // For now, we'll simulate deletion or handle it directly if possible
      const { error } = await supabase.from('documents').delete().eq('id', documentId);
      if (error) {
        throw new Error(error.message);
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
      <DocumentSearchFilter onSearch={handleSearch} onFilter={handleFilter} />
      <DocumentList documents={documents} onDelete={handleDelete} />
    </div>
  );
}
