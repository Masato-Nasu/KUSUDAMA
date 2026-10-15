CREATE TABLE `gifts` (
	`id` text PRIMARY KEY NOT NULL,
	`message` text NOT NULL,
	`recipient` text NOT NULL,
	`status_key` text NOT NULL,
	`owner` text NOT NULL,
	`opened_at` integer,
	`receipt` text,
	`created_at` integer NOT NULL
);
