import { integer, pgTable, text, serial, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  fullName: text('fullName').notNull(),
  storageQuota: integer('storage_quota').notNull().default(536870912), // 512MB in bytes
  storageUsed: integer('storage_used').notNull().default(0),
  fileTree: jsonb('file_tree').notNull().default('{}'),
});
