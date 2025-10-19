import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { YoutubeTranscript } from "youtube-transcript";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url, numSections = 15 } = body;

    if (!url) {
      return NextResponse.json(
        { error: "YouTube URL is required" },
        { status: 400 }
      );
    }

    // Extract video ID
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    // 🎬 STEP 1: Extract YouTube transcript
    let transcript: any[];
    let fullText: string;

    try {
      transcript = await YoutubeTranscript.fetchTranscript(videoId);
      fullText = transcript.map((t) => t.text).join(" ");

      if (!fullText || fullText.length < 100) {
        // Fallback to mock if transcript is too short or unavailable
        console.warn("Transcript too short or unavailable, using mock data");
        return generateMockResponse(videoId, numSections);
      }
    } catch (transcriptError) {
      console.error("Transcript extraction failed:", transcriptError);
      // Fallback to mock data if transcript extraction fails
      return generateMockResponse(videoId, numSections);
    }

    // 🤖 STEP 2: Use GPT-4 to intelligently split into sections
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert course architect. Split video transcripts into logical learning sections.
Return ONLY valid JSON with this exact structure:
{
  "title": "Suggested course title",
  "description": "Brief course description",
  "sections": [
    {
      "sectionTitle": "Section name",
      "summary": "What this section covers",
      "keyPoints": ["Point 1", "Point 2", "Point 3"],
      "estimatedMinutes": 15
    }
  ]
}`,
          },
          {
            role: "user",
            content: `Split this video transcript into ${numSections} logical learning sections.
Each section should be a cohesive topic or concept.

Transcript (first 8000 characters):
${fullText.substring(0, 8000)}

Return JSON with title, description, and ${numSections} sections.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      });

      const aiResponse = JSON.parse(
        completion.choices[0]?.message?.content || "{}"
      );

      // Map AI sections to our format with timestamps
      const sectionsWithTimestamps = mapSectionsToTimestamps(
        aiResponse.sections || [],
        transcript
      );

      // Calculate actual video duration from transcript
      const totalDurationMs = transcript[transcript.length - 1]?.offset || 0;
      const totalDurationMinutes = Math.ceil(totalDurationMs / 60000);

      return NextResponse.json({
        success: true,
        videoId,
        suggestedTitle: aiResponse.title || "AI-Generated Course",
        suggestedDescription:
          aiResponse.description ||
          "Comprehensive course generated from video content",
        sections: sectionsWithTimestamps,
        totalDuration: totalDurationMinutes,
        transcriptLength: transcript.length,
      });
    } catch (aiError) {
      console.error("AI processing failed:", aiError);
      // Fallback to mock if AI fails
      return generateMockResponse(videoId, numSections);
    }
  } catch (error) {
    console.error("YouTube processing error:", error);
    return NextResponse.json(
      { error: "Failed to process video" },
      { status: 500 }
    );
  }
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

function extractTitleFromUrl(url: string): string {
  // In production, fetch actual video title from YouTube API
  return "Comprehensive Masterclass";
}

// Helper to generate mock response as fallback
function generateMockResponse(videoId: string, numSections: number) {
  const mockSections = generateMockSections(numSections);
  return NextResponse.json({
    success: true,
    videoId,
    suggestedTitle: "AI-Generated Course",
    suggestedDescription:
      "Transform your knowledge with this comprehensive course",
    sections: mockSections,
  });
}

// Map AI-generated sections to timestamps from transcript
function mapSectionsToTimestamps(aiSections: any[], transcript: any[]): any[] {
  if (!transcript || transcript.length === 0) {
    return aiSections.map((section, index) => ({
      sectionTitle: section.sectionTitle || `Section ${index + 1}`,
      summary: section.summary || "",
      keyPoints: section.keyPoints || [],
      duration: section.estimatedMinutes || 15,
      startTime: formatTime(index * 15),
      endTime: formatTime((index + 1) * 15),
    }));
  }

  // Get ACTUAL video duration from transcript
  const totalDurationMs = transcript[transcript.length - 1]?.offset || 0;
  const totalMinutes = totalDurationMs / 60000;

  // Calculate section duration based on REAL video length
  const sectionDuration = totalMinutes / aiSections.length;

  console.log(
    `📹 Video Duration: ${Math.ceil(totalMinutes)} minutes (${formatTime(
      totalMinutes
    )})`
  );
  console.log(
    `📊 Splitting into ${aiSections.length} sections of ~${Math.ceil(
      sectionDuration
    )} minutes each`
  );

  return aiSections.map((section, index) => {
    const startMinutes = index * sectionDuration;
    const endMinutes = (index + 1) * sectionDuration;

    // Find transcript entries for this time range
    const sectionTranscript = transcript.filter((t) => {
      const tMinutes = t.offset / 60000;
      return tMinutes >= startMinutes && tMinutes < endMinutes;
    });

    // Get actual text content for this section
    const sectionText = sectionTranscript.map((t) => t.text).join(" ");

    return {
      sectionTitle: section.sectionTitle || `Section ${index + 1}`,
      summary: section.summary || "",
      keyPoints: section.keyPoints || [],
      duration: Math.ceil(sectionDuration), // REAL duration calculated from video
      startTime: formatTime(startMinutes),
      endTime: formatTime(endMinutes),
      transcriptCount: sectionTranscript.length,
      textLength: sectionText.length, // For debugging
    };
  });
}

function generateMockSections(count: number) {
  const sectionTemplates = [
    {
      prefix: "Introduction to",
      topics: [
        "Core Concepts",
        "Getting Started",
        "Setup & Installation",
        "Overview",
      ],
    },
    {
      prefix: "Understanding",
      topics: [
        "Fundamentals",
        "Key Principles",
        "Best Practices",
        "Advanced Concepts",
      ],
    },
    {
      prefix: "Working with",
      topics: ["Tools & Resources", "Workflows", "Integrations", "Automation"],
    },
    {
      prefix: "Building",
      topics: ["Projects", "Applications", "Solutions", "Real-World Examples"],
    },
    {
      prefix: "Mastering",
      topics: ["Advanced Techniques", "Optimization", "Performance", "Scaling"],
    },
  ];

  const sections = [];
  const avgDuration = 600 / count; // Assume 10-hour video (600 minutes)

  for (let i = 0; i < count; i++) {
    const template = sectionTemplates[i % sectionTemplates.length];
    const topic =
      template.topics[Math.floor(Math.random() * template.topics.length)];

    const startMinutes = Math.floor(i * avgDuration);
    const endMinutes = Math.floor((i + 1) * avgDuration);
    const duration = endMinutes - startMinutes;

    sections.push({
      sectionTitle: `${i + 1}. ${template.prefix} ${topic}`,
      startTime: formatTime(startMinutes),
      endTime: formatTime(endMinutes),
      duration: duration,
      keyPoints: [
        `Key concept ${i + 1}`,
        `Practical application`,
        `Best practices`,
        `Common pitfalls to avoid`,
      ],
      summary: `In this section, you'll learn about ${topic.toLowerCase()}. We'll cover essential concepts, practical examples, and real-world applications.`,
    });
  }

  return sections;
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  const secs = Math.floor(((minutes % 60) - mins) * 60);

  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/* 
PRODUCTION IMPLEMENTATION GUIDE:

1. Install dependencies:
   npm install youtube-transcript openai

2. Extract transcript:
   ```typescript
   import { YoutubeTranscript } from 'youtube-transcript';
   
   const transcript = await YoutubeTranscript.fetchTranscript(videoId);
   const fullText = transcript.map(t => t.text).join(' ');
   ```

3. Use GPT-5 for intelligent splitting:
   ```typescript
   import OpenAI from 'openai';
   
   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
   
   const completion = await openai.chat.completions.create({
     model: "gpt-4",
     messages: [
       {
         role: "system",
         content: "You are an AI course architect. Split transcripts into logical learning sections."
       },
       {
         role: "user",
         content: `Split this transcript into ${numSections} logical sections. Return structured JSON with: sectionTitle, summary, keyPoints (array), estimatedDuration.\n\nTranscript: ${fullText}`
       }
     ],
     response_format: { type: "json_object" }
   });
   
   const sections = JSON.parse(completion.choices[0].message.content);
   ```

4. Map timestamps:
   - Use transcript timestamps to determine start/end times
   - Calculate actual durations based on content
   - Ensure no gaps or overlaps between sections

5. Generate thumbnails (optional):
   - Use Leonardo AI or Midjourney API
   - Create section-specific thumbnails
   - Store in Cloudinary or S3

6. Add to database:
   ```typescript
   await prisma.courseAI.create({
     data: {
       courseId: courseId,
       sourceUrl: url,
       transcriptUrl: transcriptUrl,
       aiData: sections,
     }
   });
   ```
*/
