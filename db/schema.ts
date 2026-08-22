import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const bills = sqliteTable("bills", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  amountCents: integer("amount_cents").notNull(),
  frequency: text("frequency", { enum: ["monthly", "quarterly", "yearly"] }).notNull(),
  category: text("category").notNull(),
  dueDay: integer("due_day").notNull(),
  color: text("color").notNull().default("blue"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const profiles = sqliteTable("profiles", {
  id: integer("id").primaryKey(),
  incomeCents: integer("income_cents").notNull(),
  savingsTargetCents: integer("savings_target_cents").notNull(),
  flexibleSpentCents: integer("flexible_spent_cents").notNull(),
  daysUntilPayday: integer("days_until_payday").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
