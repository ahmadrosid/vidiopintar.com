CREATE TABLE `video_quizzes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_video_id` integer NOT NULL,
	`youtube_id` text NOT NULL,
	`user_id` text NOT NULL,
	`questions` text NOT NULL,
	`language` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_video_id`) REFERENCES `user_videos`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `video_quizzes_user_video_id_idx` ON `video_quizzes` (`user_video_id`);--> statement-breakpoint
CREATE TABLE `quiz_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`quiz_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`status` text NOT NULL,
	`current_index` integer DEFAULT 0 NOT NULL,
	`answers` text NOT NULL,
	`score` integer,
	`completed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`quiz_id`) REFERENCES `video_quizzes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `quiz_attempts_quiz_id_idx` ON `quiz_attempts` (`quiz_id`);--> statement-breakpoint
CREATE INDEX `quiz_attempts_user_id_idx` ON `quiz_attempts` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_usage_events_quiz_generated_user_idx` ON `user_usage_events` (`user_id`) WHERE `event_type` = 'quiz_generated';
