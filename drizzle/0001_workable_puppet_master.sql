CREATE TABLE `reactions` (
	`id` text PRIMARY KEY NOT NULL,
	`post_key` text NOT NULL,
	`author_key` text NOT NULL,
	`value` integer NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `reactions_post_idx` ON `reactions` (`post_key`);--> statement-breakpoint
CREATE TABLE `views` (
	`id` text PRIMARY KEY NOT NULL,
	`post_key` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `views_post_idx` ON `views` (`post_key`);--> statement-breakpoint
ALTER TABLE `comments` ADD `parent_id` text;--> statement-breakpoint
ALTER TABLE `comments` ADD `kind` text DEFAULT 'discussion' NOT NULL;