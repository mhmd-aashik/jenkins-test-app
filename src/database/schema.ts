import {
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const statusEnum = pgEnum('task_status', [
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
]);

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: statusEnum('status').default('PENDING').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
