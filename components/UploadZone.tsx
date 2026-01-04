'use client'

import { useCallback, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Progress } from "./ui/progress"
import { useToast } from "./ui/use-toast"

interface UploadZoneProps {
  onUploadSuccess?: () => void;
  uploadDocument: (formData: FormData) => Promise<{ success: boolean; message: string }>;
}

export function UploadZone({ onUploadSuccess, uploadDocument }: UploadZoneProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [documentType, setDocumentType] = useState('other') // Default to 'other'
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()
  const router = useRouter()

  const handleManualTextSubmit = async () => {
    // This function is no longer directly used in the simplified upload flow
    // but keeping it for now in case manual text entry is re-introduced differently.
    toast({
      title: "Info",
      description: "Manual text entry is not currently supported in this flow.",
      variant: "default",
    });
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
      toast({
        title: "Error",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return
    }

    setUploading(true)
    setProgress(0) // Reset progress on new upload

    const formData = new FormData()
    files.forEach(file => {
      formData.append('file', file)
    })
    formData.append('documentType', documentType)

    try {
      const result = await uploadDocument(formData);

      if (result.success) {
        toast({
          title: "Upload successful",
          description: result.message,
          variant: "success",
        });
        setFiles([]);
        setProgress(100);
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        toast({
          title: "Upload failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error during document upload:', error);
      toast({
        title: "Operation failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
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
              </div>
            )}
          </div>
        )
      }
    </div>
  )
}
