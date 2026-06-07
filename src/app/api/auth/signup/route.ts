import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, semester, branch } = body;

    if (!email || !password || !firstName) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { mail_id: email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const hashedPassword = await hash(password, 10);
    const sem = semester ?? "6";
    const br  = branch ?? "CSE";

    await prisma.semesters.upsert({
      where: { sem_no: sem },
      update: {},
      create: { sem_no: sem },
    });

    await prisma.branch.upsert({
      where: { branch_name: br },
      update: {},
      create: { branch_name: br },
    });

    await prisma.college.upsert({
      where: { college_code: "305" },
      update: {},
      create: {
        college_code: "305",
        college_name: "dsit",
        address: "bangalore",
        college_mail: "dsit@gmail.com",
        college_website: "dsit.com",
      },
    });

    await prisma.user.create({
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
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[signup error]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
