import { getServerSession } from "next-auth/next";
import { NextAuthOptions } from "@/lib/authOptions";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(NextAuthOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { firstName, lastName, branchName, semNo, profImage, mobileNo } = await req.json();

    if (branchName) {
      await prisma.branch.upsert({
        where: { branch_name: branchName },
        create: { branch_name: branchName },
        update: {},
      });
    }
    if (semNo) {
      await prisma.semesters.upsert({
        where: { sem_no: String(semNo) },
        create: { sem_no: String(semNo) },
        update: {},
      });
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(firstName && { first_name: firstName }),
        ...(lastName !== undefined && { last_name: lastName }),
        ...(branchName && { branch_name: branchName }),
        ...(semNo && { sem_no: String(semNo) }),
        ...(profImage !== undefined && { prof_image: profImage }),
      },
    });

    if (mobileNo !== undefined) {
      const existing = await prisma.user_details.findFirst({
        where: { usersId: session.user.id },
      });
      if (existing) {
        await prisma.user_details.update({
          where: { id: existing.id },
          data: { mobile_no: mobileNo },
        });
      } else {
        await prisma.user_details.create({
          data: { usersId: session.user.id, mobile_no: mobileNo },
        });
      }
    }

    return NextResponse.json({ success: true, user: updated });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
