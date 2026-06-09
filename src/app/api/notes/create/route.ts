import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { NextAuthOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

// POST — STAFF only: insert a notes row after client has uploaded the PDF to Storage.
// The Storage upload (to the "notes" bucket) stays client-side; only the DB insert is
// moved here. The "avatars" and "notes" Storage buckets need authenticated-upload policies
// (Storage RLS is separate from table RLS — set those in the Supabase Storage dashboard).
export async function POST(req: NextRequest) {
  const session = await getServerSession(NextAuthOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (session.user.role !== "STAFF") return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  try {
    const body = await req.json();
    const { title, fileUrl, unitNo, unitName, subCode, semester, branchName } = body as {
      title: string;
      fileUrl: string;
      unitNo: string;
      unitName: string;
      subCode: string;
      semester: string;
      branchName?: string;
    };

    if (!title?.trim() || !fileUrl?.trim() || !unitNo?.trim() || !unitName?.trim() || !subCode?.trim() || !semester?.trim())
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });

    const branch = branchName?.trim() || "CSE";

    await prisma.semesters.upsert({ where: { sem_no: semester }, update: {}, create: { sem_no: semester } });
    await prisma.branch.upsert({ where: { branch_name: branch }, update: {}, create: { branch_name: branch } });

    const note = await prisma.notes.create({
      data: {
        title: title.trim(),
        file_url: fileUrl,
        unit_no: unitNo,
        unit_name: unitName,
        sub_code: subCode,
        sem_no: semester,
        branch_name: branch,
        usersId: session.user.id,
        likes: 0,
        dislikes: 0,
      },
    });

    return NextResponse.json({ noteId: note.id }, { status: 201 });
  } catch (err) {
    console.error("[notes/create]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
