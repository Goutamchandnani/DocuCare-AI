"use client";

import DocumentDetails from '@/components/DocumentDetails';

export default function DocumentDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <div className="container mx-auto p-4">
      <DocumentDetails documentId={id} />
    </div>
  );
}
