import { NextRequest, NextResponse } from "next/server";
import { NoteRepository } from "@/lib/db/repository";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    const notes = await NoteRepository.getAllByUserIdWithVideoDetails(user.id);
    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching all notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

