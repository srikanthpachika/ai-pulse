CREATE TABLE `analytics_views` (
	`id` text PRIMARY KEY NOT NULL,
	`session_key` text NOT NULL,
	`section` text NOT NULL,
	`day` text NOT NULL,
	`active_seconds` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `analytics_day_idx` ON `analytics_views` (`day`);--> statement-breakpoint
CREATE INDEX `analytics_session_idx` ON `analytics_views` (`session_key`);