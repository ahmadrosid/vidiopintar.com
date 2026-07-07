CREATE TABLE "shared_videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"youtube_id" varchar(20) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"owner_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shared_videos_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"youtube_id" varchar(20) NOT NULL,
	"summary" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "quizzes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "notes" CASCADE;--> statement-breakpoint
DROP TABLE "quizzes" CASCADE;--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_video_id_videos_youtube_id_fk";
--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "user_video_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "shared_videos" ADD CONSTRAINT "shared_videos_youtube_id_videos_youtube_id_fk" FOREIGN KEY ("youtube_id") REFERENCES "public"."videos"("youtube_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared_videos" ADD CONSTRAINT "shared_videos_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_videos" ADD CONSTRAINT "user_videos_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_videos" ADD CONSTRAINT "user_videos_youtube_id_videos_youtube_id_fk" FOREIGN KEY ("youtube_id") REFERENCES "public"."videos"("youtube_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_video_id_user_videos_id_fk" FOREIGN KEY ("user_video_id") REFERENCES "public"."user_videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" DROP COLUMN "summary";--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "video_id";