import { NextRequest, NextResponse } from "next/server";
import { NoteRepository, UserVideoRepository } from "@/lib/db/repository";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { userVideoId, timestamp, text, color } = body;

    if (!userVideoId || timestamp === undefined || !text || !color) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify userVideoId belongs to the user
    const userVideo = await UserVideoRepository.getById(userVideoId);
    if (!userVideo || userVideo.userId !== user.id) {
      return NextResponse.json(
        { error: "User video not found or unauthorized" },
        { status: 404 }
      );
    }

    const note = await NoteRepository.create({
      userId: user.id,
      userVideoId,
      timestamp: Number(timestamp),
      text,
      color,
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const userVideoId = searchParams.get("userVideoId");

    if (!userVideoId) {
      return NextResponse.json(
        { error: "userVideoId is required" },
        { status: 400 }
      );
    }

    // Verify userVideoId belongs to the user
    const userVideo = await UserVideoRepository.getById(Number(userVideoId));
    if (!userVideo || userVideo.userId !== user.id) {
      return NextResponse.json(
        { error: "User video not found or unauthorized" },
        { status: 404 }
      );
    }

    const notes = await NoteRepository.getByUserVideoId(Number(userVideoId));
    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

