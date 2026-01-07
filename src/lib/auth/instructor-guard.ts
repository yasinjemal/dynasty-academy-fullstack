import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

/**
 * Server-side middleware to check instructor access
 * This runs on the server before the page is rendered
 */
export async function checkInstructorAccess() {
  const session = await getServerSession(authOptions);

  // Not authenticated
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/instructor/dashboard");
  }

  // Get user role from database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  // Not an instructor or admin
  if (user?.role !== "INSTRUCTOR" && user?.role !== "ADMIN") {
    redirect("/become-instructor");
  }

  return { session, user };
}

/**
 * Check if user has instructor application approved
 */
export async function checkInstructorApplication(userId: string) {
  const application = await prisma.instructorApplication.findFirst({
    where: {
      userId,
      status: "approved",
    },
  });

  return !!application;
}
