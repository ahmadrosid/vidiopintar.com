ALTER TABLE "shared_videos" ALTER COLUMN "user_video_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "user_videos" ADD COLUMN "quick_start_questions" json;