ALTER TABLE `transactions` ADD `mayar_member_id` text;--> statement-breakpoint
ALTER TABLE `transactions` ADD `mayar_transaction_id` text;--> statement-breakpoint
ALTER TABLE `transactions` ADD `mayar_member_email` text;--> statement-breakpoint
ALTER TABLE `transactions` ADD `membership_bill_url` text;--> statement-breakpoint
ALTER TABLE `transactions` ADD `subscription_ends_at` integer;--> statement-breakpoint
CREATE TABLE `mayar_webhook_events` (
	`id` text PRIMARY KEY NOT NULL,
	`dedup_key` text NOT NULL,
	`event` text NOT NULL,
	`mayar_transaction_id` text,
	`mayar_member_id` text,
	`payload_summary` text,
	`processed_at` integer,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mayar_webhook_events_dedup_key_unique` ON `mayar_webhook_events` (`dedup_key`);
