ALTER TABLE `gifts` ADD `sender_label` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE INDEX `gifts_owner_created_idx` ON `gifts` (`owner`,`created_at`);