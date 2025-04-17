import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  authProvider: text("auth_provider"), // 'local', 'google', 'apple'
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  authProvider: true,
  avatarUrl: true,
});

// Affirmations table
export const affirmations = pgTable("affirmations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  text: text("text").notNull(),
  reminderTime: text("reminder_time"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAffirmationSchema = createInsertSchema(affirmations).pick({
  userId: true,
  text: true,
  reminderTime: true,
  isActive: true,
});

// Reminders table
export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  scheduledTime: timestamp("scheduled_time").notNull(),
  isComplete: boolean("is_complete").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReminderSchema = createInsertSchema(reminders).pick({
  userId: true,
  title: true,
  description: true,
  scheduledTime: true,
  isComplete: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertAffirmation = z.infer<typeof insertAffirmationSchema>;
export type Affirmation = typeof affirmations.$inferSelect;

export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type Reminder = typeof reminders.$inferSelect;
