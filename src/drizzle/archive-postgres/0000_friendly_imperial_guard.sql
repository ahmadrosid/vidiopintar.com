CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_id" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"sender" varchar(10) NOT NULL,
	"timestamp" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_id" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"timestamp" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"youtube_id" varchar(20) NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"channel_title" varchar(100),
	"published_at" timestamp,
	"thumbnail_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "videos_youtube_id_unique" UNIQUE("youtube_id")
);
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_video_id_videos_youtube_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("youtube_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_video_id_videos_youtube_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("youtube_id") ON DELETE no action ON UPDATE no action;