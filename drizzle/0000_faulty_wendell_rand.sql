CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`post_key` text NOT NULL,
	`post_title` text NOT NULL,
	`author_key` text NOT NULL,
	`display_name` text NOT NULL,
	`body` text NOT NULL,
	`status` text NOT NULL,
	`anonymous` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `comments_post_idx` ON `comments` (`post_key`,`status`);--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`body` text NOT NULL,
	`kind` text NOT NULL,
	`provider` text NOT NULL,
	`model` text NOT NULL,
	`source_url` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `restrictions` (
	`author_key` text PRIMARY KEY NOT NULL,
	`reason` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`email_opt_in` integer NOT NULL,
	`in_app` integer NOT NULL,
	`frequency` text NOT NULL,
	`topics` text NOT NULL,
	`updated_at` text NOT NULL,
	`consent_at` text
);
