import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, existingDescription } = await req.json()

    if (!title) {
      return NextResponse.json({ error: 'Book title is required' }, { status: 400 })
    }

    // Create AI prompt
    const prompt = `You are an expert book marketer and content strategist for an online book academy. Analyze this book and provide comprehensive marketing content.

Book Title: "${title}"
${existingDescription ? `Existing Description: "${existingDescription}"` : ''}

Please provide:
1. A compelling 150-200 word book description that hooks readers and highlights value
2. The most appropriate category from: Business, Self-Help, Fiction, Non-Fiction, Technology, Science, History
3. A suggested price between $9.99 and $49.99 based on the perceived value and market positioning
4. 5-8 relevant tags for discovery
5. Target audience description (who should read this)
6. 3-5 key selling points
7. SEO-optimized meta title (under 60 characters)
8. SEO-optimized meta description (under 160 characters)

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "description": "compelling description here",
  "category": "category name",
  "suggestedPrice": 29.99,
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "targetAudience": "description of target readers",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "metaTitle": "SEO title",
  "metaDescription": "SEO description"
}`

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert book marketing strategist. Always respond with valid JSON only, no markdown formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    })

    const responseText = completion.choices[0].message.content
    if (!responseText) {
      throw new Error('No response from OpenAI')
    }

    // Parse JSON response
    let analysis
    try {
      analysis = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText)
      throw new Error('Invalid response format from AI')
    }

    // Validate required fields
    const requiredFields = ['description', 'category', 'suggestedPrice', 'tags', 'targetAudience', 'keyPoints', 'metaTitle', 'metaDescription']
    const missingFields = requiredFields.filter(field => !analysis[field])
    
    if (missingFields.length > 0) {
      console.error('Missing fields in AI response:', missingFields)
      throw new Error(`AI response missing required fields: ${missingFields.join(', ')}`)
    }

    return NextResponse.json({
      success: true,
      analysis,
      usage: {
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens,
        totalTokens: completion.usage?.total_tokens
      }
    })

  } catch (error) {
    console.error('AI Analysis Error:', error)
    
    if (error instanceof Error) {
      // OpenAI specific errors
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to environment.' },
          { status: 500 }
        )
      }
      
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'AI service rate limit exceeded. Please try again in a moment.' },
          { status: 429 }
        )
      }

      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'AI service quota exceeded. Please contact administrator.' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to analyze content with AI. Please try again.' },
      { status: 500 }
    )
  }
}
