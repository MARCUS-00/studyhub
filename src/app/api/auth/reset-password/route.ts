import { hash, compare } from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validatePassword } from "@/lib/passwordPolicy";

// Resets the password only when the caller presents the short-lived resetToken
// issued by /api/auth/verify-otp. The token is deleted on use (single-use).
export async function POST(req: NextRequest) {
  try {
    const { email, password, resetToken } = await req.json();

    if (!email || !password || !resetToken) {
      return NextResponse.json(
        { error: "Email, password, and reset token required." },
        { status: 400 }
      );
    }

    const policyError = validatePassword(password);
    if (policyError) {
      return NextResponse.json({ error: policyError }, { status: 422 });
    }

    const record = await prisma.verificationToken.findFirst({
      where: { identifier: `reset:${email}` },
    });

    if (!record || record.expires < new Date()) {
      if (record) {
        await prisma.verificationToken.delete({ where: { token: record.token } });
      }
      return NextResponse.json(
        { error: "Reset session expired. Please restart the forgot-password flow." },
        { status: 400 }
      );
    }

    const valid = await compare(String(resetToken), record.token);
    if (!valid) {
      return NextResponse.json({ error: "Invalid reset token." }, { status: 400 });
    }

    // Verify "new ≠ old" (FR4).
    const user = await prisma.user.findUnique({ where: { mail_id: email } });
    if (user?.password) {
      const sameAsOld = await compare(password, user.password);
      if (sameAsOld) {
        return NextResponse.json(
          { error: "New password must differ from your current password." },
          { status: 422 }
        );
      }
    }

    const hashed = await hash(password, 10);
    await prisma.user.update({ where: { mail_id: email }, data: { password: hashed } });

    // Consume the reset token.
    await prisma.verificationToken.delete({ where: { token: record.token } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
