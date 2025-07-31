import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  emoji: text("emoji").notNull().default("🚀"),
  description: text("description"),
  color: text("color").notNull().default("blue"),
  isExpanded: boolean("is_expanded").notNull().default(true),
  progress: integer("progress").notNull().default(0),
  timeSpent: text("time_spent").notNull().default("0h 0m"),
  coreDirection: jsonb("core_direction").$type<{
    whatBuilding?: string;
    whyMatters?: string;
    whoFor?: string;
  }>().default({}),
  executionRules: text("execution_rules"),
  teamCulture: text("team_culture"),
});

export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  emoji: text("emoji").notNull(),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  isExpanded: boolean("is_expanded").notNull().default(true),
});

export const agents = pgTable("agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role").notNull(),
  color: text("color").notNull().default("blue"),
  teamId: varchar("team_id").references(() => teams.id).notNull(),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").$type<'user' | 'system' | 'hatch'>().notNull(),
  author: text("author").notNull(),
  hatchId: varchar("hatch_id").references(() => agents.id),
  teamId: varchar("team_id").references(() => teams.id),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  content: text("content").notNull(),
  timestamp: text("timestamp").notNull().default(sql`now()`),
  metadata: jsonb("metadata").$type<{
    isStreaming?: boolean;
    streamProgress?: number;
    personality?: any;
    taskContext?: string[];
    referencedMessages?: string[];
    attachments?: any[];
    reactions?: any[];
    isSystemGenerated?: boolean;
  }>().default({}),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
