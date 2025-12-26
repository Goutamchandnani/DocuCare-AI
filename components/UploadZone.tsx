'use client'

import { useCallback, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Progress } from "./ui/progress"
import { useToast } from "./ui/use-toast"

interface UploadZoneProps {
  onUploadSuccess?: () => void;
}

export function UploadZone({ onUploadSuccess }: UploadZoneProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [documentType, setDocumentType] = useState('other') // Default to 'other'
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const [showManualTextEntry, setShowManualTextEntry] = useState(false)
  const [manualText, setManualText] = useState('')
  const [failedDocumentInfo, setFailedDocumentInfo] = useState<{ documentId: string, fileUrl: string, filename: string } | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleManualTextSubmit = async () => {
    if (!failedDocumentInfo || !manualText.trim()) {
      toast({
        title: "Error",
        description: "Please provide text for manual entry.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/document/update-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: failedDocumentInfo.documentId,
          extractedText: manualText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update document with manual text.');
      }

      toast({
        title: "Success",
        description: "Document updated with manual text. Analyzing document...",
        variant: "success",
      });

      // Optionally trigger analysis again or redirect
      // For now, let's just hide the manual entry and clear the state
      setShowManualTextEntry(false);
      setManualText('');
      setFailedDocumentInfo(null);
      router.refresh(); // Refresh the document list

    } catch (error: any) {
      console.error('Error submitting manual text:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to update document with manual text.',
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (uploading) {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress === 100) {
            clearInterval(timer);
            return 100;
          }
          const diff = Math.random() * 10;
          return Math.min(oldProgress + diff, 90); // Cap at 90% until actual success
        });
      }, 500);
      return () => {
        clearInterval(timer);
        setProgress(0);
        setMessage(null);
      };
    }
  }, [uploading]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles)
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
      setMessage("Please select a file to upload.");
      return
    }

    setUploading(true)

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
        let uploadData;
        try {
          uploadData = await uploadResponse.json();
        } catch (jsonError) {
          toast({
            title: "Upload successful, but response malformed",
            description: "Could not parse upload response.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Upload successful",
          description: `File: ${uploadData.filename}. Analyzing document...`,
          variant: "success",
        })
        setFiles([])
        setProgress(100) // Set to 100% on successful upload
        setMessage(null); // Clear any previous messages

        // Check if OCR failed during upload process
        if (uploadData.ocrFailed) {
          setShowManualTextEntry(true);
          setFailedDocumentInfo({ documentId: uploadData.document.id, fileUrl: uploadData.document.file_url, filename: uploadData.filename });
          toast({
            title: "OCR Failed",
            description: "Automatic text extraction failed. Please enter the document text manually.",
            variant: "destructive",
            duration: 8000,
          });
          return;
        }

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
          let analyzeData;
          try {
            analyzeData = await analyzeResponse.json();
          } catch (jsonError) {
            toast({
              title: "Analysis successful, but response malformed",
              description: "Could not parse analysis response.",
              variant: "destructive",
            });
            return;
          }
          toast({
            title: "Analysis successful",
            description: analyzeData.summary,
            variant: "success",
          })
          if (onUploadSuccess) {
            onUploadSuccess()
          }
        } else {
          let errorData;
          try {
            errorData = await analyzeResponse.json();
          } catch (jsonError) {
            toast({
              title: "Analysis failed",
              description: "Could not parse analysis error response.",
              variant: "destructive",
            });
            return;
          }
          toast({
            title: "Analysis failed",
            description: errorData.error || "An unknown error occurred during analysis.",
            variant: "destructive",
          })
        }

      } else {
        let errorData;
        try {
          errorData = await uploadResponse.json();
        } catch (jsonError) {
          toast({
            title: "Upload failed",
            description: "Could not parse upload error response.",
            variant: "destructive",
          });
          return;
        }
        toast({
          title: "Upload failed",
          description: errorData.error || "An unknown error occurred during upload.",
          variant: "destructive",
        })
      }
    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : "An unexpected error occurred.";
      setMessage(errorMessage);
      toast({
        title: "Operation failed",
        description: errorMessage,
        variant: "destructive",
      })
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
            {uploading && (
              <div className="mt-4">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-gray-500 mt-1">{message}</p>
              </div>
            )}
          </div>
        )
      }
      {!uploading && message && <p className="mt-4 text-sm text-red-500">{message}</p>}

      {showManualTextEntry && failedDocumentInfo && (
        <div className="mt-8 p-4 border border-gray-300 rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Manual Text Entry for {failedDocumentInfo.filename}</h3>
          <p className="text-sm text-gray-600 mb-4">Automatic text extraction failed. Please review the document and enter the text below.</p>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows={10}
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Enter extracted text here..."
          ></textarea>
          <button
            onClick={handleManualTextSubmit}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            Submit Manual Text
          </button>
        </div>
      )}
    </div>
  )
}
