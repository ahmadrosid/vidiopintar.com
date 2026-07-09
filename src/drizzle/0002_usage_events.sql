CREATE TABLE `user_usage_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`event_type` text NOT NULL,
	`youtube_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `user_usage_events` (`user_id`, `event_type`, `youtube_id`, `created_at`)
SELECT `user_id`, 'video_added', `youtube_id`, `created_at` FROM `user_videos`;
--> statement-breakpoint
INSERT INTO `user_usage_events` (`user_id`, `event_type`, `youtube_id`, `created_at`)
SELECT uv.`user_id`, 'chat_message', uv.`youtube_id`, m.`created_at`
FROM `messages` m
INNER JOIN `user_videos` uv ON m.`user_video_id` = uv.`id`
WHERE m.`role` = 'user';
