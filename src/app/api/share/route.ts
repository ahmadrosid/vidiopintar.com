
import { nanoid } from 'nanoid';
import { SharedVideoRepository, UserVideoRepository, VideoRepository } from '@/lib/db/repository';
import { getCurrentUser } from '@/lib/auth';
import { env } from '@/lib/env/server';

/**
 * Create a shared video link
 * @param youtubeId The YouTube ID of the video to share
 * @returns The slug for the shared video
 */
async function createSharedVideo(youtubeId: string, userVideoId: number): Promise<string> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  const userVideo = await UserVideoRepository.getById(userVideoId);
  if (!userVideo || userVideo.userId !== user.id) {
    throw new Error("Forbidden");
  }

  const video = await VideoRepository.getByYoutubeId(youtubeId);
  if (!video) {
    throw new Error("Video not found");
  }

  // Check if the user has already shared this video
  const isAlreadyShared = await SharedVideoRepository.isSharedByOwner(youtubeId, user.id);
  if (isAlreadyShared) {
    // Find the existing shared video and return its slug
    const sharedVideos = await SharedVideoRepository.getByOwnerId(user.id);
    const existingShared = sharedVideos.find(sv => sv.youtubeId === youtubeId);
    if (existingShared) {
      return existingShared.slug;
    }
  }

  const slug = nanoid(8);

  await SharedVideoRepository.create({
    youtubeId,
    userVideoId,
    slug,
    ownerId: user.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return slug;
}

export async function POST(req: Request) {
    const { youtubeId, userVideoId } = await req.json();
    const slug = await createSharedVideo(youtubeId, userVideoId);
    return Response.json({ url: `${env.NEXT_PUBLIC_SITE_URL}/shared/${slug}` });
}
