import { compare, hash } from "bcrypt";
import { getServerSession } from "next-auth/next";
import { NextAuthOptions } from "@/lib/authOptions";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validatePassword } from "@/lib/passwordPolicy";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(NextAuthOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { oldPassword, newPassword } = await req.json();
    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: "Old password and new password are required." },
        { status: 400 }
      );
    }

    const policyError = validatePassword(newPassword);
    if (policyError) {
      return NextResponse.json({ error: policyError }, { status: 422 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user?.password) {
      return NextResponse.json({ error: "No password set for this account." }, { status: 400 });
    }

    const oldMatches = await compare(oldPassword, user.password);
    if (!oldMatches) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }

    const sameAsOld = await compare(newPassword, user.password);
    if (sameAsOld) {
      return NextResponse.json(
        { error: "New password must differ from your current password." },
        { status: 422 }
      );
    }

    const hashed = await hash(newPassword, 10);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashed },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
