import { pgTable, text, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';

export const inviteCodeStatus = pgEnum('invite_code_status', ['unused', 'used']);

export const inviteCodes = pgTable('invite_codes', {
  code: text('code').primaryKey(),
  status: inviteCodeStatus('status').notNull().default('unused'),
  usedBy: text('used_by'),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  usedAt: timestamp('used_at', { withTimezone: true }),
});

export const artists = pgTable('artists', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  slug: text('slug').notNull().unique(),
  displayName: text('display_name').notNull(),
  bio: text('bio').notNull().default(''),
  // Array of { type: 'instagram' | 'tiktok' | 'spotify' | 'youtube', href, label, sub }
  links: jsonb('links').notNull().default([]),
  backgroundEffect: text('background_effect').notNull().default('liquid'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Artist = typeof artists.$inferSelect;
export type NewArtist = typeof artists.$inferInsert;
export type InviteCode = typeof inviteCodes.$inferSelect;
