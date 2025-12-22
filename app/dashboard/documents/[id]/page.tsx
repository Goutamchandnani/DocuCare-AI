"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Document {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  upload_date: string;
  ai_summary: string | null;
  extracted_text: string | null;
  key_information: any | null; // JSON type
}

export default function DocumentDetailPage() {
  const { id } = useParams()
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      const fetchDocument = async () => {
        try {
          const response = await fetch(`/api/documents/${id}`)
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          const data = await response.json()
          setDocument(data)
        } catch (err: any) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      }
      fetchDocument()
    }
  }, [id])

  if (loading) {
    return <div className="container mx-auto p-4">Loading document details...</div>
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>
  }

  if (!document) {
    return <div className="container mx-auto p-4">Document not found.</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Document Details: {document.file_name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Document Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>File Name:</strong> {document.file_name}</p>
            <p><strong>File Type:</strong> {document.file_type}</p>
            <p><strong>Upload Date:</strong> {new Date(document.upload_date).toLocaleDateString()}</p>
            {/* Add more document info here */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{document.ai_summary || 'No AI summary available.'}</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Extracted Key Information</CardTitle>
          </CardHeader>
          <CardContent>
            {document.key_information ? (
              <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded-md">
                {JSON.stringify(document.key_information, null, 2)}
              </pre>
            ) : (
              <p>No key information extracted.</p>
            )}
          </CardContent>
        </Card>

        {/* Document Preview will go here */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Document Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {document.file_path ? (
              <iframe src={document.file_path} className="w-full h-[400px] md:h-[600px] border rounded-md"></iframe>
            ) : (
              <p>No preview available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
