import { pgTable, text, timestamp, jsonb, integer, boolean, date, primaryKey } from 'drizzle-orm/pg-core';

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
  // How many products the catálogo allows for whoever redeems this code —
  // same shape as trialDays, so a future code can grant a bigger catalog
  // without a schema change.
  maxProducts: integer('max_products').notNull().default(6),
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
  // Digits-only WhatsApp number used by every product's "Buy on WhatsApp" button.
  whatsappNumber: text('whatsapp_number'),
  // Array of { id, name, price, available, description, photos } — the
  // artist's small product catalog (arttoys-style), same jsonb-array pattern
  // as `links` above.
  products: jsonb('products').notNull().default([]),
  // How many products this artist is allowed to list — copied from the
  // invite code's maxProducts at signup, kept per-artist so it can be raised
  // later as an upsell without touching every existing row.
  maxProducts: integer('max_products').notNull().default(6),
  // Null means "no trial tracked" (e.g. the hand-seeded demo artist). Real
  // signups always get one from the invite code they redeemed.
  trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
  // Own, lightweight analytics — no third-party service. Total (not
  // time-windowed) counts, incremented atomically on each real page view /
  // WhatsApp buy-click, shown back to the artist in their dashboard.
  viewCount: integer('view_count').notNull().default(0),
  buyClickCount: integer('buy_click_count').notNull().default(0),
  // Admin-only kill switch — behaves exactly like an expired trial (read-only
  // dashboard, paused public page) rather than denying login outright, so an
  // affected artist can still see why.
  isBlocked: boolean('is_blocked').notNull().default(false),
  // Which invite code this artist signed up with (channel attribution). Null for
  // accounts created before this column existed. Admin coupon redemptions never
  // overwrite it — it records how they arrived, not what they were later given.
  signupCode: text('signup_code'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Artist = typeof artists.$inferSelect;
export type NewArtist = typeof artists.$inferInsert;

// Per-day counters (America/Mexico_City days) behind the admin trend charts.
// artists.viewCount / buyClickCount stay as the all-time totals; this table
// only exists to answer "how did it move". One row per artist per day.
export const dailyStats = pgTable(
  'daily_stats',
  {
    slug: text('slug').notNull(),
    day: date('day', { mode: 'string' }).notNull(),
    views: integer('views').notNull().default(0),
    buyClicks: integer('buy_clicks').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.slug, t.day] })]
);
