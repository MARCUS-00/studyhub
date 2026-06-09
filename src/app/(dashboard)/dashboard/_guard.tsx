import { getServerSession } from "next-auth/next";
import { NextAuthOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export default async function DashboardRoleGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(NextAuthOptions);
  if (session?.user?.role === "STAFF") redirect("/staffDashboard");
  return <>{children}</>;
}
