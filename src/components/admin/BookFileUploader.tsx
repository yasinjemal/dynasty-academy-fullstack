'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BookFileUploaderProps {
  bookId: string
  onUploadComplete?: (data?: any) => void
}

export default function BookFileUploader({ bookId, onUploadComplete }: BookFileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [previewPages, setPreviewPages] = useState(30)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bookId', bookId)
      formData.append('previewPages', previewPages.toString())

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 500)

      const res = await fetch('/api/admin/books/upload-file', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Upload failed')
      }

      const data = await res.json()
      alert('Book file uploaded successfully!')
      
      if (onUploadComplete) {
        onUploadComplete(data)
      }

      setFile(null)
      setProgress(0)
    } catch (error: any) {
      alert(error.message || 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>📚 Upload Book File</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Book File (PDF, DOCX, or MD)
          </label>
          <input
            type="file"
            accept=".pdf,.docx,.doc,.md,.txt"
            onChange={handleFileChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            disabled={uploading}
          />
          {file && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Free Preview Pages
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={previewPages}
            onChange={(e) => setPreviewPages(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            disabled={uploading}
          />
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Number of pages users can read for free before purchasing
          </p>
        </div>

        {uploading && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              Uploading... {progress}%
            </p>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? 'Uploading...' : 'Upload Book File'}
        </Button>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            📖 Supported Formats:
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
            <li>• <strong>PDF</strong> - Best for maintaining layout</li>
            <li>• <strong>DOCX/DOC</strong> - Converted to readable format</li>
            <li>• <strong>Markdown (.md)</strong> - Perfect for technical books</li>
            <li>• <strong>Plain Text (.txt)</strong> - Simple text books</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
