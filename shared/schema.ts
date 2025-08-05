import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
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
  brain: jsonb("brain").$type<{
    documents?: Array<{
      id: string;
      title: string;
      content: string;
      type: 'idea-development' | 'project-plan' | 'meeting-notes' | 'research';
      createdAt: string;
    }>;
    sharedMemory?: string;
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
  personality: jsonb("personality").$type<{
    traits?: string[];
    communicationStyle?: string;
    expertise?: string[];
    welcomeMessage?: string;
  }>().default({}),
  isSpecialAgent: boolean("is_special_agent").notNull().default(false),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Chat System Tables

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  teamId: varchar("team_id").references(() => teams.id), // null for project-level chats
  agentId: varchar("agent_id").references(() => agents.id), // null for team/project chats
  type: text("type").notNull().$type<"project" | "team" | "hatch">(),
  title: text("title"), // optional conversation title
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").references(() => conversations.id).notNull(),
  userId: varchar("user_id").references(() => users.id), // null for AI messages
  agentId: varchar("agent_id").references(() => agents.id), // null for user messages
  content: text("content").notNull(),
  messageType: text("message_type").notNull().$type<"user" | "agent" | "system">(),
  metadata: jsonb("metadata").$type<{
    isStreaming?: boolean;
    typingDuration?: number;
    responseTime?: number;
    personality?: string;
    mentions?: string[];
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Message Reactions Table for AI Training
export const messageReactions = pgTable("message_reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: varchar("message_id").references(() => messages.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  reactionType: text("reaction_type").notNull().$type<"thumbs_up" | "thumbs_down">(),
  agentId: varchar("agent_id").references(() => agents.id), // which agent the feedback is about
  feedbackData: jsonb("feedback_data").$type<{
    responseQuality?: number; // 1-5 scale
    helpfulness?: number; // 1-5 scale
    accuracy?: number; // 1-5 scale
    notes?: string;
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversationMemory = pgTable("conversation_memory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").references(() => conversations.id).notNull(),
  memoryType: text("memory_type").notNull().$type<"context" | "summary" | "key_points" | "decisions">(),
  content: text("content").notNull(),
  importance: integer("importance").notNull().default(5), // 1-10 scale
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const typingIndicators = pgTable("typing_indicators", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").references(() => conversations.id).notNull(),
  agentId: varchar("agent_id").references(() => agents.id).notNull(),
  isTyping: boolean("is_typing").notNull().default(false),
  estimatedDuration: integer("estimated_duration"), // seconds
  startedAt: timestamp("started_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

// Chat Schema Validations
export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageReactionSchema = createInsertSchema(messageReactions).omit({
  id: true,
  createdAt: true,
});

export const insertConversationMemorySchema = createInsertSchema(conversationMemory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTypingIndicatorSchema = createInsertSchema(typingIndicators).omit({
  id: true,
  startedAt: true,
  updatedAt: true,
});

// Type Exports
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Chat Type Exports
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessageReaction = z.infer<typeof insertMessageReactionSchema>;
export type MessageReaction = typeof messageReactions.$inferSelect;
export type InsertConversationMemory = z.infer<typeof insertConversationMemorySchema>;
export type ConversationMemory = typeof conversationMemory.$inferSelect;
export type InsertTypingIndicator = z.infer<typeof insertTypingIndicatorSchema>;
export type TypingIndicator = typeof typingIndicators.$inferSelect;
