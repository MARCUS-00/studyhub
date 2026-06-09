import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/mailer";

// Issues a 6-digit OTP stored as a bcrypt-hashed VerificationToken (10-min TTL).
// Returns 200 even when the email is not found to prevent account enumeration.
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { mail_id: email } });

    // Always return 200 so callers cannot enumerate valid emails.
    if (!user) return NextResponse.json({ success: true });

    const { randomInt } = await import("crypto");
    const otp = String(randomInt(100000, 1000000));
    const hashedOtp = await hash(otp, 10);
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    // Remove any stale tokens for this email, then create a fresh one.
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({
      data: { identifier: email, token: hashedOtp, expires },
    });

    await sendOtpEmail(email, otp);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
