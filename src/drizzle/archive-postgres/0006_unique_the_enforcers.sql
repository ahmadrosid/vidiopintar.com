ALTER TABLE "shared_videos" ALTER COLUMN "slug" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "shared_videos" ADD COLUMN "user_video_id" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "shared_videos" ADD CONSTRAINT "shared_videos_user_video_id_user_videos_id_fk" FOREIGN KEY ("user_video_id") REFERENCES "public"."user_videos"("id") ON DELETE cascade ON UPDATE no action;