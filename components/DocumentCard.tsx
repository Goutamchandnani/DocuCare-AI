"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface Document {
  id: string;
  filename: string;
  document_type: string;
  created_at: string;
  aiSummary?: string; // Optional AI summary
}

interface DocumentCardProps {
  document: Document;
  onDelete: (documentId: string) => void;
}

export default function DocumentCard({ document, onDelete }: DocumentCardProps) {
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="text-lg truncate">{document.filename}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600">Type: {document.document_type}</p>
        <p className="text-sm text-gray-600">Uploaded: {new Date(document.created_at).toLocaleDateString()}</p>
        {document.aiSummary && (
          <p className="text-sm text-gray-700 mt-2 line-clamp-3">{document.aiSummary}</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Link href={`/documents/${document.id}`} passHref>
          <Button variant="outline" size="sm">View Details</Button>
        </Link>
        <Button variant="destructive" size="sm" onClick={() => onDelete(document.id)}>
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
