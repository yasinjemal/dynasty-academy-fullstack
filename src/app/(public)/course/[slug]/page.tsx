import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCoursePageData, getCourseDetail } from "@/lib/api/course-data";
import { CourseDetailClient } from "@/components/course-detail";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseDetail(slug);

  return {
    title: `${course.title} | Dynasty Academy`,
    description: course.shortDescription || course.description.slice(0, 160),
    keywords: course.tags.join(", "),
    openGraph: {
      title: course.title,
      description: course.shortDescription,
      images: [course.coverImage],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: course.title,
      description: course.shortDescription,
      images: [course.coverImage],
    },
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  
  // Fetch all course page data
  const data = await getCoursePageData(slug, session?.user?.id);

  if (!data.course || data.course.status !== "published") {
    notFound();
  }

  return (
    <CourseDetailClient
      data={data}
      userId={session?.user?.id}
    />
  );
}
