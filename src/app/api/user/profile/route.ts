import { getServerSession } from "next-auth/next";
import { NextAuthOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(NextAuthOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const [details, user] = await Promise.all([
    prisma.user_details.findFirst({
      where: { usersId: session.user.id },
      select: { reg_no: true, mobile_no: true, bio: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { points: true, skills: true },
    }),
  ]);

  return NextResponse.json({
    regNo: details?.reg_no ?? null,
    mobileNo: details?.mobile_no ?? null,
    bio: details?.bio ?? null,
    points: user?.points ?? 0,
    skills: user?.skills ?? [],
  });
}
