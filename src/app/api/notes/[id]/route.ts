import { NextRequest, NextResponse } from "next/server";
import { NoteRepository, UserVideoRepository } from "@/lib/db/repository";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const user = await getCurrentUser();
    const { id } = params;
    const body = await request.json();
    const { text, color, timestamp } = body;

    const note = await NoteRepository.getById(Number(id));
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Verify note belongs to the user
    if (note.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const updates: { text?: string; color?: string; timestamp?: number } = {};
    if (text !== undefined) updates.text = text;
    if (color !== undefined) updates.color = color;
    if (timestamp !== undefined) updates.timestamp = Number(timestamp);

    const updatedNote = await NoteRepository.update(Number(id), updates);
    if (!updatedNote) {
      return NextResponse.json(
        { error: "Failed to update note" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const user = await getCurrentUser();
    const { id } = params;

    const note = await NoteRepository.getById(Number(id));
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Verify note belongs to the user
    if (note.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await NoteRepository.delete(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}

