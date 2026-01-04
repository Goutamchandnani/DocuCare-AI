"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ExtractedData {
  summary?: string;
  documentType?: string;
  medications?: { name: string; dosage: string; frequency: string }[];
  labResults?: { testName: string; result: string; units: string; referenceRange: string }[];
  doctorName?: string;
  date?: string;
}

interface Document {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  upload_date: string;
  ai_summary: string | null;
  extracted_text: string | null;
  extracted_data: ExtractedData | null; // JSON type
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
            {document.extracted_data ? (
              <div className="space-y-4">
                {document.extracted_data.summary && (
                  <div>
                    <h3 className="text-lg font-semibold">Summary:</h3>
                    <p>{document.extracted_data.summary}</p>
                  </div>
                )}
                {document.extracted_data.documentType && (
                  <div>
                    <h3 className="text-lg font-semibold">Document Type:</h3>
                    <p>{document.extracted_data.documentType}</p>
                  </div>
                )}
                {document.extracted_data.doctorName && (
                  <div>
                    <h3 className="text-lg font-semibold">Doctor Name:</h3>
                    <p>{document.extracted_data.doctorName}</p>
                  </div>
                )}
                {document.extracted_data.date && (
                  <div>
                    <h3 className="text-lg font-semibold">Date:</h3>
                    <p>{document.extracted_data.date}</p>
                  </div>
                )}
                {document.extracted_data.medications && document.extracted_data.medications.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold">Medications:</h3>
                    <ul className="list-disc pl-5">
                      {document.extracted_data.medications.map((med, index) => (
                        <li key={index}>
                          {med.name} - {med.dosage} ({med.frequency})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {document.extracted_data.labResults && document.extracted_data.labResults.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold">Lab Results:</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference Range</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {document.extracted_data.labResults.map((lab, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lab.testName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lab.result}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lab.units}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lab.referenceRange}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
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
