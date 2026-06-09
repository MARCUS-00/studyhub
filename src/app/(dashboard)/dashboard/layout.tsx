import { NextAuthOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import DashboardLayoutUI from "./layout-ui";

interface Props {
  readonly children: React.ReactNode;
}

export default async function DashboardLayout({ children }: Props) {
  const session = await getServerSession(NextAuthOptions);

  if (session?.user?.role === "STAFF") redirect("/staffDashboard");

  return <DashboardLayoutUI>{children}</DashboardLayoutUI>;
}
