CREATE TABLE `mcp_request_metrics` (
	`id` text PRIMARY KEY NOT NULL,
	`key_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`duration_ms` integer NOT NULL,
	`outcome` text NOT NULL,
	`provider_attempt` integer DEFAULT 0 NOT NULL,
	`transcript_complete` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`key_id`) REFERENCES `mcp_api_keys`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `mcp_request_metrics_created_at_idx` ON `mcp_request_metrics` (`created_at`);
--> statement-breakpoint
CREATE INDEX `mcp_request_metrics_key_created_idx` ON `mcp_request_metrics` (`key_id`,`created_at`);
