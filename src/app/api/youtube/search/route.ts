import { NextRequest, NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/auth";
import { searchYoutube } from "@/lib/youtube/search";

const MAX_QUERY_LENGTH = 200;
const DEFAULT_VIDEO_LIMIT = 24;
const DEFAULT_CHANNEL_LIMIT = 12;

export async function GET(request: NextRequest) {
  try {
    const user = await getOptionalUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const raw = request.nextUrl.searchParams.get("q") ?? "";
    const trimmed = raw.trim();

    if (trimmed.length < 2) {
      return NextResponse.json({ videos: [], channels: [] });
    }

    const q =
      trimmed.length > MAX_QUERY_LENGTH
        ? trimmed.slice(0, MAX_QUERY_LENGTH)
        : trimmed;

    const videoLimitParam = Number(request.nextUrl.searchParams.get("limit"));
    const channelLimitParam = Number(
      request.nextUrl.searchParams.get("channelLimit"),
    );

    const maxVideos = Number.isFinite(videoLimitParam)
      ? Math.min(Math.max(Math.trunc(videoLimitParam), 1), 50)
      : DEFAULT_VIDEO_LIMIT;
    const maxChannels = Number.isFinite(channelLimitParam)
      ? Math.min(Math.max(Math.trunc(channelLimitParam), 0), 50)
      : DEFAULT_CHANNEL_LIMIT;

    const result = await searchYoutube({
      query: q,
      maxVideos,
      maxChannels,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error searching YouTube:", error);
    return NextResponse.json(
      { error: "Failed to search YouTube" },
      { status: 500 },
    );
  }
}
