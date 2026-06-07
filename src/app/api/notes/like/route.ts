import { SupaClient } from "@/utils/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { noteId, type, action } = await req.json();
    if (!noteId || !type || !action) {
      return NextResponse.json({ error: "Missing fields." }, { status: 400 });
    }

    const field = type === "like" ? "likes" : "dislikes";
    const delta = action === "remove" ? -1 : 1;

    const { data: note } = await SupaClient.from("notes").select(field).eq("id", noteId).single();
    const current = (note as Record<string, number> | null)?.[field] ?? 0;
    const next = Math.max(0, current + delta);

    const { error } = await SupaClient.from("notes").update({ [field]: next }).eq("id", noteId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ [field]: next });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
