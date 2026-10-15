import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const gifts=sqliteTable('gifts',{
 id:text('id').primaryKey(), message:text('message').notNull(), recipient:text('recipient').notNull(), statusKey:text('status_key').notNull(), owner:text('owner').notNull(), openedAt:integer('opened_at'), receipt:text('receipt'), createdAt:integer('created_at').notNull()
});
