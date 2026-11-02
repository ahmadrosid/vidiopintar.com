CREATE TABLE `mcp_plan_usage` (
	`user_id` text NOT NULL,
	`period_start` integer NOT NULL,
	`calls` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `period_start`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
