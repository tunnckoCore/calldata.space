CREATE TABLE `collections` (
	`id` text PRIMARY KEY NOT NULL,
	`supply` integer NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`logo` text DEFAULT 'https://example.com/logo.png' NOT NULL,
	`banner` text DEFAULT 'https://example.com/banner.png' NOT NULL,
	`links` text DEFAULT '[]' NOT NULL,
	`team` text DEFAULT '[]' NOT NULL,
	`royalties` text DEFAULT '{}' NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `collections_slug_unique` ON `collections` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `collections_name_unique` ON `collections` (`name`);--> statement-breakpoint
CREATE TABLE `ethscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`number` integer,
	`block_number` integer NOT NULL,
	`block_timestamp` integer NOT NULL,
	`transaction_index` integer NOT NULL,
	`media_type` text NOT NULL,
	`media_subtype` text NOT NULL,
	`content_type` text NOT NULL,
	`content_sha` text NOT NULL,
	`is_esip0` integer NOT NULL,
	`is_esip3` integer NOT NULL,
	`is_esip4` integer NOT NULL,
	`is_esip6` integer NOT NULL,
	`is_esip8` integer NOT NULL,
	`creator` text NOT NULL,
	`initial_owner` text NOT NULL,
	`current_owner` text NOT NULL,
	`previous_owner` text NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`collection_id` text,
	FOREIGN KEY (`id`) REFERENCES `transactions`(`transaction_hash`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`block_number` integer NOT NULL,
	`block_blockhash` text NOT NULL,
	`block_timestamp` integer NOT NULL,
	`transaction_type` integer NOT NULL,
	`transaction_hash` text PRIMARY KEY NOT NULL,
	`transaction_index` integer NOT NULL,
	`transaction_value` integer NOT NULL,
	`transaction_fee` blob NOT NULL,
	`gas_price` text NOT NULL,
	`gas_used` text NOT NULL,
	`from_address` text NOT NULL,
	`to_address` text NOT NULL,
	`is_transfer` integer NOT NULL,
	`truncated_data` text NOT NULL,
	`truncated_data_raw` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transfers` (
	`transaction_hash` text NOT NULL,
	`ethscription_id` text NOT NULL,
	`index` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_log_index` integer,
	`block_blockhash` text NOT NULL,
	`block_number` integer NOT NULL,
	`block_timestamp` integer NOT NULL,
	`transaction_index` integer NOT NULL,
	`from_address` text NOT NULL,
	`to_address` text NOT NULL,
	FOREIGN KEY (`transaction_hash`) REFERENCES `transactions`(`transaction_hash`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ethscription_id`) REFERENCES `ethscriptions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `votes` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_hash` text NOT NULL,
	`ethscription_id` text NOT NULL,
	`voted_at` integer DEFAULT (unixepoch()) NOT NULL,
	`voter` text NOT NULL,
	`rank` integer DEFAULT 0,
	`up` integer NOT NULL,
	`down` integer NOT NULL,
	FOREIGN KEY (`transaction_hash`) REFERENCES `transactions`(`transaction_hash`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ethscription_id`) REFERENCES `ethscriptions`(`id`) ON UPDATE no action ON DELETE no action
);
