import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const gifts=sqliteTable('gifts',{
 id:text('id').primaryKey(), message:text('message').notNull(), senderLabel:text('sender_label').notNull().default(''), recipient:text('recipient').notNull(), statusKey:text('status_key').notNull(), owner:text('owner').notNull(), openedAt:integer('opened_at'), receipt:text('receipt'), createdAt:integer('created_at').notNull()
},table=>[index('gifts_owner_created_idx').on(table.owner,table.createdAt)]);
