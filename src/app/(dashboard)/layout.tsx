import { NextAuthOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

interface props {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: props) {
  const session = await getServerSession(NextAuthOptions);

  if (!session?.user?.role) redirect("/signin");

  return <>{children}</>;
}
