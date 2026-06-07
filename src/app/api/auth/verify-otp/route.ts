import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcrypt";
import { prisma } from "@/lib/prisma";

// Verifies the 6-digit OTP. On success, returns a single-use resetToken
// that the client must pass to /api/auth/reset-password.
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
      return NextResponse.json({ error: "OTP has expired." }, { status: 400 });
    }

    const valid = await compare(String(otp), record.token);
    if (!valid) {
      return NextResponse.json({ error: "Invalid or expired OTP." }, { status: 400 });
    }

    // Delete OTP token on successful verification — one-time use.
    await prisma.verificationToken.delete({ where: { token: record.token } });

    // Issue a short-lived reset token (plain UUID, stored hashed).
    const { randomUUID } = await import("crypto");
    const resetToken = randomUUID();
    const { hash } = await import("bcrypt");
    const hashedReset = await hash(resetToken, 10);
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.verificationToken.create({
      data: { identifier: `reset:${email}`, token: hashedReset, expires },
    });

    return NextResponse.json({ success: true, resetToken });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
