import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import { eq } from "drizzle-orm";

export async function DELETE() {
  // Outside the try: getCurrentUser redirects signed-out users, and that redirect must not be caught.
  const currentUser = await getCurrentUser();

  try {
    await db.delete(user).where(eq(user.id, currentUser.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete user:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
