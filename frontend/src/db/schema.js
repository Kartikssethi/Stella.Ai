import { pgTable, boolean, text, timestamp, varchar, json,vector } from "drizzle-orm/pg-core";
import { generateId } from "ai";

// -------- USERS --------
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// -------- SESSION --------
export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

// -------- ACCOUNT --------
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// -------- VERIFICATION --------
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// -------- DOCUMENTS --------
export const document = pgTable("document", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  title: text("title").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // "creative" | "legal"
  description: text("description"),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// -------- SECTIONS --------
export const section = pgTable("section", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  documentId: text("document_id").references(() => document.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  order: varchar("order", { length: 50 }),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// -------- EMBEDDINGS (pgvector) --------
export const embedding = pgTable("embedding", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  documentId: text("document_id").references(() => document.id, { onDelete: "cascade" }),
  sectionId: text("section_id").references(() => section.id, { onDelete: "cascade" }),
  vector: vector("vector", { dimensions: 1536 }).notNull(), // ✅ pgvector column
  metadata: json("metadata"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// -------- AGENT TASKS --------
export const agentTask = pgTable("agent_task", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  documentId: text("document_id").references(() => document.id, { onDelete: "cascade" }),
  sectionId: text("section_id").references(() => section.id, { onDelete: "cascade" }),
  taskType: varchar("task_type", { length: 50 }), // "draft" | "revise" | "check_consistency"
  status: varchar("status", { length: 20 }).default("queued"),
  result: json("result"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});
