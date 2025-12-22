'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface UploadZoneProps {
  onUploadSuccess?: () => void;
}

export function UploadZone({ onUploadSuccess }: UploadZoneProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [documentType, setDocumentType] = useState('other') // Default to 'other'

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles)
    setMessage('')
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => {},
    onDragLeave: () => {},
    onDragOver: () => {},
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
  })

  const handleUpload = async () => {
    if (files.length === 0) {
      setMessage('Please select a file to upload.')
      return
    }

    setUploading(true)
    setMessage('')

    const formData = new FormData()
    files.forEach(file => {
      formData.append('file', file)
    })
    formData.append('documentType', documentType)

    try {
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json()
        setMessage(`Upload successful: ${uploadData.filename}. Analyzing document...`)
        setFiles([])

        // Call the analyze API
        const analyzeResponse = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileUrl: uploadData.document.file_url,
            documentId: uploadData.document.id,
            documentType: uploadData.document.document_type,
          }),
        })

        if (analyzeResponse.ok) {
          const analyzeData = await analyzeResponse.json()
          setMessage(`Analysis successful: ${analyzeData.summary}`)
          if (onUploadSuccess) {
            onUploadSuccess()
          }
        } else {
          const errorData = await analyzeResponse.json()
          setMessage(`Analysis failed: ${errorData.error}`)
        }

      } else {
        const errorData = await uploadResponse.json()
        setMessage(`Upload failed: ${errorData.error}`)
      }
    } catch (error: any) {
      setMessage(`Operation failed: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
      <div {...getRootProps()} className="cursor-pointer p-4">
        <input {...getInputProps() as React.InputHTMLAttributes<HTMLInputElement>} />
        {
          isDragActive ?
            <p>Drop the files here ...</p> :
            <p>Drag &apos;n&apos; drop some files here, or click to select files</p>
        }
      </div>
      {
        files.length > 0 && (
          <div className="mt-4">
            <h4 className="text-lg font-semibold">Selected files:</h4>
            <ul>
              {files.map(file => (
                <li key={file.name} className="text-sm text-gray-700">{file.name} - {file.size} bytes</li>
              ))}
            </ul>
            <div className="mt-4">
              <label htmlFor="documentType" className="block text-sm font-medium text-gray-700">Document Type</label>
              <select
                id="documentType"
                name="documentType"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
              >
                <option value="prescription">Prescription</option>
                <option value="lab_report">Lab Report</option>
                <option value="other">Other</option>
              </select>
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        )
      }
      {message && <p className="mt-4 text-sm text-red-500">{message}</p>}
    </div>
  )
}
