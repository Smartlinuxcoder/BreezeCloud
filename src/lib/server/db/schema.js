import { integer, pgTable, text, serial } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  fullName: text('fullName').notNull(),
});

export const files = pgTable("files", {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	path: text('path').notNull(),
	ownerId: integer('ownerId').notNull(),
  });