ALTER TABLE "messages" RENAME COLUMN "sender" TO "role";--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_video_id_videos_youtube_id_fk";
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_video_id_videos_youtube_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("youtube_id") ON DELETE cascade ON UPDATE no action;