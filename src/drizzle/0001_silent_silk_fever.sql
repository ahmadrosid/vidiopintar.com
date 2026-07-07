CREATE TABLE `transcript_cache` (
	`video_id` text PRIMARY KEY NOT NULL,
	`response` text,
	`unavailable` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
