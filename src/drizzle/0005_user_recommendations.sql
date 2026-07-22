CREATE TABLE `user_recommendations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`period_key` text NOT NULL,
	`videos` text NOT NULL,
	`search_queries` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_recommendations_user_id_period_key_idx` ON `user_recommendations` (`user_id`,`period_key`);
