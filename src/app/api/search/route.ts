import { NextRequest, NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/auth";
import { NoteRepository, VideoRepository } from "@/lib/db/repository";

const MAX_QUERY_LENGTH = 200;

export async function GET(request: NextRequest) {
  try {
    const user = await getOptionalUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const raw = request.nextUrl.searchParams.get("q") ?? "";
    const trimmed = raw.trim();

    if (trimmed.length < 2) {
      return NextResponse.json({ videos: [], notes: [] });
    }

    const q =
      trimmed.length > MAX_QUERY_LENGTH
        ? trimmed.slice(0, MAX_QUERY_LENGTH)
        : trimmed;

    const [videos, notes] = await Promise.all([
      VideoRepository.searchForUser(user.id, q),
      NoteRepository.searchByUserId(user.id, q),
    ]);

    return NextResponse.json({ videos, notes });
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
