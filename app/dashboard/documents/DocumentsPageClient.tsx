'use client'

import { Document } from '@/types'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UploadZone } from '@/components/UploadZone'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Link from 'next/link'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'

interface DocumentsPageClientProps {
  documents: Document[]
  initialQuery?: string
  initialType?: string
  uploadDocument: (formData: FormData) => Promise<void>
  currentPage: number
  itemsPerPage: number
  totalCount: number
}

export default function DocumentsPageClient({
  documents,
  initialQuery,
  initialType,
  uploadDocument,
  currentPage,
  itemsPerPage,
  totalCount,
}: DocumentsPageClientProps) {
  const [query, setQuery] = useState(initialQuery || '')
  const [type, setType] = useState(initialType || '')

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Documents</h1>

      <div className="mb-4 flex space-x-2">
        <Input
          type="text"
          placeholder="Search documents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-grow"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="p-2 border rounded-md"
        >
          <option value="">All Types</option>
          <option value="prescription">Prescription</option>
          <option value="lab_report">Lab Report</option>
          <option value="other">Other</option>
        </select>
        <Button onClick={() => {
          const params = new URLSearchParams()
          if (query) params.set('query', query)
          if (type) params.set('type', type)
          window.location.search = params.toString()
        }}>Apply Filter</Button>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Upload New Document</h2>
        <UploadZone onUploadSuccess={() => {
          // Refresh the page or update the document list after successful upload
          window.location.reload()
        }} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Filename</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Uploaded On</TableHead>
            <TableHead>Summary</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell className="font-medium">{doc.filename}</TableCell>
              <TableCell>{doc.document_type}</TableCell>
              <TableCell>{new Date(doc.created_at).toLocaleDateString()}</TableCell>
              <TableCell>{doc.ai_summary?.substring(0, 100)}...</TableCell>
              <TableCell className="text-right">
                <Link href={`/document/${doc.id}`}>
                  <Button variant="outline" size="sm">View</Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href={`/dashboard/documents?page=${Math.max(1, currentPage - 1)}&pageSize=${itemsPerPage}${initialQuery ? `&query=${initialQuery}` : ''}${initialType ? `&type=${initialType}` : ''}`} />
          </PaginationItem>
          {[...Array(Math.ceil(totalCount / itemsPerPage))].map((_, i) => (
            <PaginationItem key={i}>
              <PaginationLink isActive={currentPage === i + 1} href={`/dashboard/documents?page=${i + 1}&pageSize=${itemsPerPage}${initialQuery ? `&query=${initialQuery}` : ''}${initialType ? `&type=${initialType}` : ''}`}>
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext href={`/dashboard/documents?page=${Math.min(Math.ceil(totalCount / itemsPerPage), currentPage + 1)}&pageSize=${itemsPerPage}${initialQuery ? `&query=${initialQuery}` : ''}${initialType ? `&type=${initialType}` : ''}`} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
