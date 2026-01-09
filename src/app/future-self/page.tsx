import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";
import { FutureSelfPage } from "@/components/future-self";

export const metadata = {
  title: "Meet Your Future Self | Dynasty Built Academy",
  description:
    "AI-powered prediction of your future based on your current learning trajectory. See where you're headed and talk to your future self.",
};

export default async function FutureSelfRoute() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, image: true },
  });

  return (
    <FutureSelfPage
      userId={session.user.id}
      userName={user?.name || session.user.name || "Builder"}
      userImage={user?.image || session.user.image}
    />
  );
}
