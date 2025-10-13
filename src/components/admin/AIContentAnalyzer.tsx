'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Sparkles, Loader2, BookOpen, Tag, DollarSign, FileText, TrendingUp, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface AIAnalysisResult {
  description: string
  category: string
  suggestedPrice: number
  tags: string[]
  metaTitle: string
  metaDescription: string
  targetAudience: string
  keyPoints: string[]
}

interface AIContentAnalyzerProps {
  bookTitle: string
  currentDescription?: string
  onAnalysisComplete: (result: AIAnalysisResult) => void
  disabled?: boolean
}

export default function AIContentAnalyzer({
  bookTitle,
  currentDescription,
  onAnalysisComplete,
  disabled = false
}: AIContentAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null)

  const analyzeContent = async () => {
    if (!bookTitle.trim()) {
      toast.error('Please enter a book title first')
      return
    }

    setIsAnalyzing(true)
    try {
      const res = await fetch('/api/admin/books/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: bookTitle,
          existingDescription: currentDescription
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to analyze content')
      }

      const result = await res.json()
      setAnalysis(result.analysis)
      setShowResults(true)
      toast.success('✨ AI analysis complete!')
    } catch (error) {
      console.error('AI Analysis error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to analyze content')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const applyAnalysis = () => {
    if (analysis) {
      onAnalysisComplete(analysis)
      toast.success('✅ AI suggestions applied to form!')
      setShowResults(false)
    }
  }

  const regenerate = () => {
    setShowResults(false)
    setAnalysis(null)
    analyzeContent()
  }

  return (
    <div className="space-y-4">
      {/* Generate Button */}
      <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Content Analyzer
          </CardTitle>
          <CardDescription>
            Let AI generate compelling book descriptions, suggest optimal categories, pricing, and SEO metadata
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            onClick={analyzeContent}
            disabled={disabled || isAnalyzing || !bookTitle.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate with AI
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Analysis Results */}
      {showResults && analysis && (
        <Card className="border-green-200 dark:border-green-800 animate-in slide-in-from-bottom-4 duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Sparkles className="h-5 w-5" />
              AI Analysis Results
            </CardTitle>
            <CardDescription>
              Review the suggestions below and apply them to your book
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Description */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <FileText className="h-4 w-4 text-blue-600" />
                Generated Description
              </Label>
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {analysis.description}
                </p>
              </div>
            </div>

            {/* Category & Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <BookOpen className="h-4 w-4 text-purple-600" />
                  Suggested Category
                </Label>
                <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    {analysis.category}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  Recommended Price
                </Label>
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    ${analysis.suggestedPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <Tag className="h-4 w-4 text-orange-600" />
                Generated Tags
              </Label>
              <div className="flex flex-wrap gap-2">
                {analysis.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
                Target Audience
              </Label>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {analysis.targetAudience}
                </p>
              </div>
            </div>

            {/* Key Points */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <AlertCircle className="h-4 w-4 text-pink-600" />
                Key Selling Points
              </Label>
              <ul className="space-y-2">
                {analysis.keyPoints.map((point, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 p-2 bg-pink-50 dark:bg-pink-950/20 rounded-lg"
                  >
                    <span className="text-pink-600 font-bold mt-0.5">•</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* SEO Metadata */}
            <div className="space-y-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Label className="text-base font-semibold">SEO Metadata</Label>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs text-gray-600 dark:text-gray-400">Meta Title</Label>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {analysis.metaTitle}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600 dark:text-gray-400">Meta Description</Label>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {analysis.metaDescription}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button
              onClick={applyAnalysis}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Apply to Form
            </Button>
            <Button
              onClick={regenerate}
              variant="outline"
              className="flex-1"
            >
              <Loader2 className="mr-2 h-4 w-4" />
              Regenerate
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
