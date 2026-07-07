CREATE TABLE "transcript_segments" (
	"id" serial PRIMARY KEY NOT NULL,
	"video_id" varchar(32) NOT NULL,
	"start" real NOT NULL,
	"end" real NOT NULL,
	"text" varchar(1000) NOT NULL,
	"is_chapter_start" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" serial PRIMARY KEY NOT NULL,
	"video_id" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"questions" jsonb NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
