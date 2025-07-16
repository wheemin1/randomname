import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const nicknameChecks = pgTable("nickname_checks", {
  id: serial("id").primaryKey(),
  nickname: text("nickname").notNull().unique(),
  status: text("status", { enum: ["free", "busy", "error"] }).notNull(),
  lastChecked: timestamp("last_checked").notNull().defaultNow(),
  ttl: timestamp("ttl").notNull(),
});

export const generatedNicknames = pgTable("generated_nicknames", {
  id: serial("id").primaryKey(),
  nickname: text("nickname").notNull(),
  length: integer("length").notNull(),
  type: text("type", { enum: ["random", "korean", "pure", "english"] }).notNull(),
  options: jsonb("options").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertNicknameCheckSchema = createInsertSchema(nicknameChecks).omit({
  id: true,
  lastChecked: true,
});

export const insertGeneratedNicknameSchema = createInsertSchema(generatedNicknames).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type NicknameCheck = typeof nicknameChecks.$inferSelect;
export type GeneratedNickname = typeof generatedNicknames.$inferSelect;
export type InsertNicknameCheck = z.infer<typeof insertNicknameCheckSchema>;
export type InsertGeneratedNickname = z.infer<typeof insertGeneratedNicknameSchema>;
