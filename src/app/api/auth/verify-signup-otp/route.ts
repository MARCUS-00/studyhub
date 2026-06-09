import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcrypt";
import { prisma } from "@/lib/prisma";

// POST { email, otp } — verifies OTP issued at signup and flips email_verified = true.
export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP required." }, { status: 400 });
    }

    const record = await prisma.verificationToken.findFirst({
      where: { identifier: email },
    });

    if (!record) {
      return NextResponse.json({ error: "Invalid or expired OTP." }, { status: 400 });
    }

    if (record.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token: record.token } });
      return NextResponse.json({ error: "OTP has expired. Please sign up again." }, { status: 400 });
    }

    const valid = await compare(String(otp), record.token);
    if (!valid) {
      return NextResponse.json({ error: "Invalid or expired OTP." }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.verificationToken.delete({ where: { token: record.token } }),
      prisma.user.update({ where: { mail_id: email }, data: { email_verified: true } }),
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
