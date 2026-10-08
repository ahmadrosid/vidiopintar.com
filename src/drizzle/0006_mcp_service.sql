CREATE TABLE `mcp_api_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`prefix` text NOT NULL,
	`key_hash` text NOT NULL,
	`requests_per_minute` integer DEFAULT 30 NOT NULL,
	`requests_per_day` integer DEFAULT 1000 NOT NULL,
	`bytes_per_day` integer DEFAULT 10000000 NOT NULL,
	`created_at` integer NOT NULL,
	`revoked_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mcp_api_keys_prefix_unique` ON `mcp_api_keys` (`prefix`);
--> statement-breakpoint
CREATE UNIQUE INDEX `mcp_api_keys_key_hash_unique` ON `mcp_api_keys` (`key_hash`);
--> statement-breakpoint
CREATE TABLE `mcp_usage` (
	`key_id` text NOT NULL,
	`window` text NOT NULL,
	`period_start` integer NOT NULL,
	`requests` integer DEFAULT 0 NOT NULL,
	`output_bytes` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`key_id`, `window`, `period_start`),
	FOREIGN KEY (`key_id`) REFERENCES `mcp_api_keys`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `mcp_usage_period_start_idx` ON `mcp_usage` (`period_start`);
--> statement-breakpoint
CREATE TABLE `mcp_transcript_cache` (
	`video_id` text NOT NULL,
	`language` text NOT NULL,
	`response` text NOT NULL,
	`expires_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`video_id`, `language`)
);
--> statement-breakpoint
CREATE INDEX `mcp_transcript_cache_expires_at_idx` ON `mcp_transcript_cache` (`expires_at`);
