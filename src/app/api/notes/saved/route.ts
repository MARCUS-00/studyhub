import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { NextAuthOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(NextAuthOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const rows = await prisma.favourites.findMany({
    where: { usersId: session.user.id },
    select: {
      note: {
        select: {
          id: true,
          title: true,
          unit_no: true,
          unit_name: true,
          sem_no: true,
          branch_name: true,
          uploaded_date: true,
          likes: true,
          dislikes: true,
          sub_code: true,
          file_url: true,
          users: { select: { first_name: true, prof_image: true } },
          subject: { select: { sub_name: true } },
        },
      },
    },
  });

  return NextResponse.json(rows.map((row) => row.note));
}
