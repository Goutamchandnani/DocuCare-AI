"use client";

import { useParams } from 'next/navigation';
import DocumentDetails from '../../../components/DocumentDetails';

export default function DocumentDetailsPage() {
  const params = useParams();
  const documentId = params.id as string;

  if (!documentId) {
    return <div className="p-4 text-center">No document ID provided.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <DocumentDetails documentId={documentId} />
    </div>
  );
}
