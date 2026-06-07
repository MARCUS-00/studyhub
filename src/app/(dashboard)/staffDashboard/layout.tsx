import { NextAuthOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import StaffSidebar from "@/components/StaffSidebar";

interface Props {
  readonly children: React.ReactNode;
}

export default async function StaffDashboardLayout({ children }: Props) {
  const session = await getServerSession(NextAuthOptions);

  if (!session?.user) redirect("/signin");
  if (session.user.role !== "STAFF") redirect("/dashboard");

  return <StaffSidebar>{children}</StaffSidebar>;
}
