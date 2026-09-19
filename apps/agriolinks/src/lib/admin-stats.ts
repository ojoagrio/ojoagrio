import { and, eq, gte, isNotNull, sql } from 'drizzle-orm';
import { getDb } from '@/db';
import { artists, dailyStats } from '@/db/schema';
import { isSuspended, isTrialExpired } from './artists';
import { activeLinks } from './links';
import type { ArtistLink } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

/** The slice of an artist row the stats need — kept flat so computeStats stays a pure, DB-free function. */
export interface StatsRow {
  slug: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string;
  linkCount: number;
  productCount: number;
  trialEndsAt: Date | null;
  isBlocked: boolean;
  viewCount: number;
  buyClickCount: number;
  createdAt: Date;
  signupCode: string | null;
}

export interface ChannelStats {
  /** Invite code the artists signed up with, or null for accounts from before attribution existed. */
  code: string | null;
  registered: number;
  /** Photo + bio + at least one link — a page someone would actually share. */
  activated: number;
  withProduct: number;
  trialExpired: number;
}

export interface DailyPoint {
  day: string;
  views: number;
  clicks: number;
}

export interface DailySeries {
  points: DailyPoint[];
  last7: { views: number; clicks: number };
  prev7: { views: number; clicks: number };
}

export interface ExpiringArtist {
  slug: string;
  displayName: string;
  daysLeft: number;
  viewCount: number;
}

export interface FunnelStep {
  label: string;
  count: number;
  /** Share of the previous step (of the registered total for the first one). */
  pctOfPrevious: number;
}

export interface WeekBucket {
  label: string;
  count: number;
}

export interface AdminStats {
  total: number;
  active: number;
  trialExpired: number;
  blocked: number;
  totalViews: number;
  totalClicks: number;
  /** null when there are no views yet — avoids a division by zero and a misleading "0%". */
  ctr: number | null;
  expiringSoon: ExpiringArtist[];
  funnel: FunnelStep[];
  signupsByWeek: WeekBucket[];
  topByViews: { slug: string; displayName: string; viewCount: number; buyClickCount: number }[];
  inactive: { slug: string; displayName: string; daysSinceSignup: number }[];
  byChannel: ChannelStats[];
}

function pct(part: number, whole: number): number {
  return whole === 0 ? 0 : Math.round((part / whole) * 100);
}

function formatDay(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * "Real" artists are the ones that signed up through the trial flow
 * (trialEndsAt set) — same rule the landing's social-proof counter uses, and
 * it leaves out the hand-seeded demo and the admin's own account.
 */
export function computeStats(rows: StatsRow[], now: Date = new Date()): AdminStats {
  const real = rows.filter((r) => r.trialEndsAt !== null);

  const blocked = real.filter((r) => r.isBlocked);
  const trialExpired = real.filter((r) => !r.isBlocked && isTrialExpired(r.trialEndsAt));
  const active = real.filter((r) => !isSuspended(r));

  const totalViews = real.reduce((sum, r) => sum + r.viewCount, 0);
  const totalClicks = real.reduce((sum, r) => sum + r.buyClickCount, 0);

  const expiringSoon = real
    .filter((r) => {
      if (r.isBlocked || !r.trialEndsAt) return false;
      const msLeft = r.trialEndsAt.getTime() - now.getTime();
      return msLeft > 0 && msLeft <= 7 * DAY_MS;
    })
    .map((r) => ({
      slug: r.slug,
      displayName: r.displayName,
      daysLeft: Math.ceil((r.trialEndsAt!.getTime() - now.getTime()) / DAY_MS),
      viewCount: r.viewCount,
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  // Cumulative on purpose: each step only counts artists who also passed the
  // previous ones, so it answers "where do they drop off, in this order" and
  // can only ever go down.
  const withPhoto = real.filter((r) => !!r.avatarUrl);
  const withBio = withPhoto.filter((r) => r.bio.trim().length > 0);
  const withLink = withBio.filter((r) => r.linkCount > 0);
  const withProduct = withLink.filter((r) => r.productCount > 0);
  const withViews = withProduct.filter((r) => r.viewCount > 0);
  const stepCounts: [string, number][] = [
    ['Registrados', real.length],
    ['Con foto', withPhoto.length],
    ['+ bio', withBio.length],
    ['+ al menos 1 link', withLink.length],
    ['+ al menos 1 producto', withProduct.length],
    ['+ al menos 1 visita', withViews.length],
  ];
  const funnel: FunnelStep[] = stepCounts.map(([label, count], i) => ({
    label,
    count,
    pctOfPrevious: i === 0 ? (count > 0 ? 100 : 0) : pct(count, stepCounts[i - 1][1]),
  }));

  const signupsByWeek: WeekBucket[] = [];
  for (let i = 7; i >= 0; i--) {
    const end = now.getTime() - i * 7 * DAY_MS;
    const start = end - 7 * DAY_MS;
    signupsByWeek.push({
      label: formatDay(new Date(start)),
      count: real.filter((r) => r.createdAt.getTime() > start && r.createdAt.getTime() <= end).length,
    });
  }

  const topByViews = [...real]
    .filter((r) => r.viewCount > 0)
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5)
    .map((r) => ({ slug: r.slug, displayName: r.displayName, viewCount: r.viewCount, buyClickCount: r.buyClickCount }));

  const inactive = real
    .filter((r) => !r.isBlocked && r.viewCount === 0 && now.getTime() - r.createdAt.getTime() > 7 * DAY_MS)
    .map((r) => ({
      slug: r.slug,
      displayName: r.displayName,
      daysSinceSignup: Math.floor((now.getTime() - r.createdAt.getTime()) / DAY_MS),
    }))
    .sort((a, b) => b.daysSinceSignup - a.daysSinceSignup);

  const channels = new Map<string | null, StatsRow[]>();
  for (const r of real) {
    const key = r.signupCode ?? null;
    channels.set(key, [...(channels.get(key) ?? []), r]);
  }
  const byChannel: ChannelStats[] = [...channels.entries()]
    .map(([code, group]) => ({
      code,
      registered: group.length,
      activated: group.filter((r) => !!r.avatarUrl && r.bio.trim().length > 0 && r.linkCount > 0).length,
      withProduct: group.filter((r) => r.productCount > 0).length,
      trialExpired: group.filter((r) => !r.isBlocked && isTrialExpired(r.trialEndsAt)).length,
    }))
    // Biggest channel first; the "sin dato" bucket (null) always last.
    .sort((a, b) => (a.code === null ? 1 : b.code === null ? -1 : b.registered - a.registered));

  return {
    total: real.length,
    active: active.length,
    trialExpired: trialExpired.length,
    blocked: blocked.length,
    totalViews,
    totalClicks,
    ctr: totalViews === 0 ? null : Math.round((totalClicks / totalViews) * 1000) / 10,
    expiringSoon,
    funnel,
    signupsByWeek,
    topByViews,
    inactive,
    byChannel,
  };
}

function addDays(day: string, n: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/**
 * Fills a fixed window of `days` ending on `today` (YYYY-MM-DD) with zeros
 * for days that had no traffic, so the chart's x-axis is always continuous.
 */
export function buildDailySeries(
  rows: { day: string; views: number; clicks: number }[],
  today: string,
  days = 30
): DailySeries {
  const byDay = new Map(rows.map((r) => [r.day, r]));
  const points: DailyPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = addDays(today, -i);
    const r = byDay.get(day);
    points.push({ day, views: r?.views ?? 0, clicks: r?.clicks ?? 0 });
  }
  const sum = (slice: DailyPoint[]) => ({
    views: slice.reduce((s, p) => s + p.views, 0),
    clicks: slice.reduce((s, p) => s + p.clicks, 0),
  });
  return { points, last7: sum(points.slice(-7)), prev7: sum(points.slice(-14, -7)) };
}

export async function getDailySeries(days = 30): Promise<DailySeries> {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
  const from = addDays(today, -(days - 1));
  // Join to artists so the demo and admin accounts (no trial) don't pollute the trend.
  const rows = await getDb()
    .select({
      day: dailyStats.day,
      views: sql<number>`sum(${dailyStats.views})::int`,
      clicks: sql<number>`sum(${dailyStats.buyClicks})::int`,
    })
    .from(dailyStats)
    .innerJoin(artists, eq(artists.slug, dailyStats.slug))
    .where(and(isNotNull(artists.trialEndsAt), gte(dailyStats.day, from)))
    .groupBy(dailyStats.day);
  return buildDailySeries(rows, today, days);
}

export async function getAdminStats(): Promise<AdminStats> {
  const rows = await getDb().select().from(artists);
  return computeStats(
    rows.map((r) => ({
      slug: r.slug,
      displayName: r.displayName,
      avatarUrl: r.avatarUrl,
      bio: r.bio,
      linkCount: activeLinks(r.links as ArtistLink[]).length,
      productCount: (r.products as unknown[]).length,
      trialEndsAt: r.trialEndsAt,
      isBlocked: r.isBlocked,
      viewCount: r.viewCount,
      buyClickCount: r.buyClickCount,
      createdAt: r.createdAt,
      signupCode: r.signupCode,
    }))
  );
}
