import { pgTable, text, timestamp, jsonb, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;

export const inviteCodes = pgTable('invite_codes', {
  code: text('code').primaryKey(),
  // null = unlimited uses (a public campaign code); a number caps redemptions
  // (1 = the old single-use invite behavior).
  maxUses: integer('max_uses').default(1),
  usesCount: integer('uses_count').notNull().default(0),
  // Free trial length granted to whoever redeems this code.
  trialDays: integer('trial_days').notNull().default(30),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type InviteCode = typeof inviteCodes.$inferSelect;

export const artists = pgTable('artists', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  slug: text('slug').notNull().unique(),
  displayName: text('display_name').notNull(),
  bio: text('bio').notNull().default(''),
  avatarUrl: text('avatar_url'),
  // Array of { type: 'instagram' | 'tiktok' | 'spotify' | 'youtube', href, label, sub }
  links: jsonb('links').notNull().default([]),
  backgroundEffect: text('background_effect').notNull().default('liquid'),
  // Null means "no trial tracked" (e.g. the hand-seeded demo artist). Real
  // signups always get one from the invite code they redeemed.
  trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Artist = typeof artists.$inferSelect;
export type NewArtist = typeof artists.$inferInsert;
