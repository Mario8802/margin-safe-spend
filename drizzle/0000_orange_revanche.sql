CREATE TABLE `bills` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`frequency` text NOT NULL,
	`category` text NOT NULL,
	`due_day` integer NOT NULL,
	`color` text DEFAULT 'blue' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` integer PRIMARY KEY NOT NULL,
	`income_cents` integer NOT NULL,
	`savings_target_cents` integer NOT NULL,
	`flexible_spent_cents` integer NOT NULL,
	`days_until_payday` integer NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `bills` (`name`, `amount_cents`, `frequency`, `category`, `due_day`, `color`) VALUES
	('Rent & utilities', 91000, 'monthly', 'Home', 1, 'violet'),
	('Groceries baseline', 39000, 'monthly', 'Food', 5, 'orange'),
	('Insurance bundle', 96000, 'yearly', 'Insurance', 12, 'blue'),
	('Car service & tyres', 72000, 'yearly', 'Transport', 18, 'green'),
	('Phone & subscriptions', 8600, 'monthly', 'Digital', 22, 'pink'),
	('Dog care reserve', 48000, 'yearly', 'Family', 27, 'yellow');
--> statement-breakpoint
INSERT INTO `profiles` (`id`, `income_cents`, `savings_target_cents`, `flexible_spent_cents`, `days_until_payday`)
VALUES (1, 295000, 40000, 23800, 13);
