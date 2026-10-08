ALTER TABLE `mcp_api_keys` ADD `user_id` text REFERENCES user(id) ON DELETE cascade;
--> statement-breakpoint
CREATE INDEX `mcp_api_keys_user_id_idx` ON `mcp_api_keys` (`user_id`);
