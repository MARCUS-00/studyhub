import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import { prisma } from "@/lib/prisma";
import { validatePassword } from "@/lib/passwordPolicy";
import { sendOtpEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, semester, branch, regNo, mobileNo, skills } = body;

    if (!email || !password || !firstName) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const policyError = validatePassword(password);
    if (policyError) {
      return NextResponse.json({ error: policyError }, { status: 422 });
    }

    const existing = await prisma.user.findUnique({ where: { mail_id: email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    if (regNo) {
      const takenRegNo = await prisma.user_details.findUnique({ where: { reg_no: regNo } });
      if (takenRegNo) {
        return NextResponse.json({ error: "Registration number already in use." }, { status: 409 });
      }
    }

    const hashedPassword = await hash(password, 10);
    const sem = semester ?? "6";
    const br  = branch ?? "CSE";

    await prisma.semesters.upsert({ where: { sem_no: sem }, update: {}, create: { sem_no: sem } });
    await prisma.branch.upsert({ where: { branch_name: br }, update: {}, create: { branch_name: br } });
    await prisma.college.upsert({
      where: { college_code: "305" },
      update: {},
      create: { college_code: "305", college_name: "dsit", address: "bangalore", college_mail: "dsit@gmail.com", college_website: "dsit.com" },
    });

    const user = await prisma.user.create({
      data: {
        first_name: firstName,
        last_name: lastName ?? "",
        mail_id: email,
        password: hashedPassword,
        address: "bangalore",
        branch_name: br,
        sem_no: sem,
        role: "STUDENT",
        prof_image: "",
        college_code: "305",
        email_verified: false,
        skills: Array.isArray(skills) ? skills : [],
      },
    });

    if (regNo || mobileNo) {
      await prisma.user_details.create({
        data: { usersId: user.id, reg_no: regNo ?? null, mobile_no: mobileNo ?? null },
      });
    }

    // Issue OTP for email verification; falls back to console in dev (SMTP_HOST unset).
    const { randomInt } = await import("crypto");
    const otp = String(randomInt(100000, 1000000));
    const hashedOtp = await hash(otp, 10);
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({ data: { identifier: email, token: hashedOtp, expires } });
    await sendOtpEmail(email, otp);

    return NextResponse.json({ success: true, requiresOtp: true }, { status: 201 });
  } catch (err) {
    console.error("[signup error]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
