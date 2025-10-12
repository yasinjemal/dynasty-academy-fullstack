import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Force Node.js runtime for file operations
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// PDF parsing - Simplified version (for full PDF support, consider external service)
async function parsePDF(buffer: Buffer): Promise<string[]> {
  try {
    // Try to extract text from PDF
    // Note: This is a simplified approach. For production, consider using:
    // 1. External PDF processing service (AWS Textract, Google Document AI)
    // 2. Server-side tool (pdf2json, pdfjs-dist with canvas)
    
    const text = buffer.toString('utf-8', 0, Math.min(buffer.length, 100000))
    
    // If we can't extract readable text, create a placeholder
    if (!text || text.length < 100) {
      return [
        '<div class="text-center p-8"><h2>PDF Preview Not Available</h2><p>This PDF file has been uploaded successfully but text extraction is not yet implemented.</p><p>Users will be able to download the PDF file.</p></div>'
      ]
    }
    
    // Split content into pages
    const wordsPerPage = 300
    const words = text.split(/\s+/).filter(w => w.trim().length > 0)
    const pages: string[] = []
    
    for (let i = 0; i < words.length; i += wordsPerPage) {
      const pageWords = words.slice(i, i + wordsPerPage)
      pages.push(`<div class="page-content">${pageWords.join(' ')}</div>`)
    }
    
    return pages.length > 0 ? pages : [
      '<div class="text-center p-8"><p>PDF uploaded successfully. Text extraction available after processing.</p></div>'
    ]
  } catch (error) {
    console.error('PDF parsing error:', error)
    // Don't throw error - return placeholder instead
    return [
      '<div class="text-center p-8"><h2>PDF Uploaded</h2><p>The PDF file has been uploaded successfully.</p><p>Advanced text extraction will be added in a future update.</p></div>'
    ]
  }
}

// DOCX parsing
async function parseDOCX(buffer: Buffer): Promise<string[]> {
  try {
    const mammoth = require('mammoth')
    const result = await mammoth.convertToHtml({ buffer })
    
    // Split by paragraph or page breaks
    const content = result.value
    const paragraphs = content.split(/<\/p>|<br\s*\/?>/).filter((p: string) => p.trim())
    
    // Group paragraphs into pages
    const wordsPerPage = 300
    const pages: string[] = []
    let currentPage = ''
    let wordCount = 0
    
    for (const paragraph of paragraphs) {
      const words = paragraph.replace(/<[^>]*>/g, '').split(/\s+/)
      wordCount += words.length
      currentPage += paragraph + '</p>'
      
      if (wordCount >= wordsPerPage) {
        pages.push(currentPage)
        currentPage = ''
        wordCount = 0
      }
    }
    
    if (currentPage) pages.push(currentPage)
    
    return pages
  } catch (error) {
    console.error('DOCX parsing error:', error)
    throw new Error('Failed to parse DOCX file')
  }
}

// Markdown parsing
async function parseMarkdown(text: string): Promise<string[]> {
  try {
    const { marked } = require('marked')
    const html = await marked(text)
    
    // Split by headings or line breaks
    const sections = html.split(/(?=<h[1-6]>)/)
    
    // Group into pages
    const wordsPerPage = 300
    const pages: string[] = []
    let currentPage = ''
    let wordCount = 0
    
    for (const section of sections) {
      const words = section.replace(/<[^>]*>/g, '').split(/\s+/)
      wordCount += words.length
      currentPage += section
      
      if (wordCount >= wordsPerPage) {
        pages.push(currentPage)
        currentPage = ''
        wordCount = 0
      }
    }
    
    if (currentPage) pages.push(currentPage)
    
    return pages
  } catch (error) {
    console.error('Markdown parsing error:', error)
    throw new Error('Failed to parse Markdown file')
  }
}

// Plain text parsing
function parseText(text: string): string[] {
  const wordsPerPage = 300
  const words = text.split(/\s+/)
  const pages: string[] = []
  
  for (let i = 0; i < words.length; i += wordsPerPage) {
    const pageWords = words.slice(i, i + wordsPerPage)
    pages.push(`<p>${pageWords.join(' ')}</p>`)
  }
  
  return pages
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const bookId = formData.get('bookId') as string
    const previewPages = parseInt(formData.get('previewPages') as string) || 30

    if (!file || !bookId) {
      return NextResponse.json(
        { error: 'File and bookId are required' },
        { status: 400 }
      )
    }

    // Verify book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    })

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    // Get file extension
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const allowedExtensions = ['pdf', 'docx', 'doc', 'md', 'txt']

    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PDF, DOCX, MD, TXT' },
        { status: 400 }
      )
    }

    // Read file buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save original file
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'books')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const fileName = `${bookId}-${Date.now()}.${fileExt}`
    const filePath = join(uploadsDir, fileName)
    await writeFile(filePath, buffer)

    // Parse content based on file type
    let pages: string[] = []

    switch (fileExt) {
      case 'pdf':
        pages = await parsePDF(buffer)
        break
      case 'docx':
      case 'doc':
        pages = await parseDOCX(buffer)
        break
      case 'md':
        pages = await parseMarkdown(buffer.toString('utf-8'))
        break
      case 'txt':
        pages = parseText(buffer.toString('utf-8'))
        break
      default:
        throw new Error('Unsupported file type')
    }

    // Save content to database
    const contentDir = join(process.cwd(), 'data', 'book-content', bookId)
    if (!existsSync(contentDir)) {
      await mkdir(contentDir, { recursive: true })
    }

    // Save each page as a separate JSON file for efficient loading
    const contentFile = join(contentDir, 'content.json')
    await writeFile(
      contentFile,
      JSON.stringify({
        totalPages: pages.length,
        pages,
        uploadedAt: new Date().toISOString(),
      })
    )

    // Update book record
    await prisma.book.update({
      where: { id: bookId },
      data: {
        fileUrl: `/uploads/books/${fileName}`,
        totalPages: pages.length,
        previewPages: Math.min(previewPages, pages.length),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Book file uploaded successfully',
      data: {
        fileName,
        totalPages: pages.length,
        previewPages: Math.min(previewPages, pages.length),
        fileUrl: `/uploads/books/${fileName}`,
      },
    })
  } catch (error: any) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    )
  }
}
