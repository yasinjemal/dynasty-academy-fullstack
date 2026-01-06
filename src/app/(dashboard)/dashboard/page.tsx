import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getDashboardData } from "@/lib/api/dashboard-data";
import DashboardClient from "@/components/dashboard/DashboardClient";
import DashboardNav from "@/components/dashboard/DashboardNav";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch all dashboard data on the server
  const dashboardData = await getDashboardData(session.user.id);

  return (
    <>
      <DashboardNav 
        userName={session.user.name || "User"}
        userImage={session.user.image}
        userRole={session.user.role || "USER"}
      />
      <DashboardClient 
        data={dashboardData}
        userName={session.user.name?.split(" ")[0] || "Learner"}
        userRole={session.user.role || "USER"}
      />
    </>
  );
}
