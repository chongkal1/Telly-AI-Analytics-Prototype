import { DailyTraffic, TrafficMetric } from '@/types';
import { pages } from './pages';

function generateDailyTraffic(days: number): DailyTraffic[] {
  const data: DailyTraffic[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Growth from ~200 clicks/day (12mo ago) to ~1000 clicks/day (now)
    // Based on real Cloudflare data: ~44K weekly referrals = ~6300/day total,
    // organic clicks ~1000/day current week
    const dayIndex = days - i;
    const progress = dayIndex / days; // 0 → 1
    const baseClicks = 200 + 800 * Math.pow(progress, 1.3);
    const noise = Math.sin(dayIndex * 0.5) * 40 + Math.cos(dayIndex * 0.3) * 20;
    const weekendDip = [0, 6].includes(date.getDay()) ? 0.6 : 1;

    const clicks = Math.round((baseClicks + noise) * weekendDip);
    const impressions = Math.round(clicks * (12 + Math.random() * 5));
    const ctr = clicks / impressions;
    const position = 22 - (dayIndex * 0.03) + Math.random() * 3;

    data.push({
      date: date.toISOString().split('T')[0],
      clicks: Math.max(0, clicks),
      impressions: Math.max(0, impressions),
      ctr: Math.round(ctr * 10000) / 10000,
      position: Math.round(Math.max(1, position) * 10) / 10,
    });
  }

  return data;
}

// Deterministic pseudo-random from page index — gives consistent results per page
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Compute a traffic multiplier for each page based on its index
// Top pages get higher multipliers, long tail gets lower
function getPageMultiplier(pageIndex: number, totalPages: number): number {
  // Power-law distribution: few pages get lots of traffic, most get modest traffic
  const rank = pageIndex + 1;
  const base = Math.pow(totalPages / rank, 0.45); // power-law curve
  // Normalize so top page ≈ 2.5, median ≈ 0.5, tail ≈ 0.15
  return Math.max(0.1, base * 0.35);
}

function generatePageTraffic(pageId: string, days: number, multiplier: number, seed: number): TrafficMetric[] {
  const data: TrafficMetric[] = [];
  const now = new Date();
  const rng = seededRandom(seed);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const dayIndex = days - i;
    const progress = dayIndex / days;
    const baseClicks = (5 + 20 * Math.pow(progress, 1.3)) * multiplier;
    const noise = Math.sin(dayIndex * 0.7 + seed * 0.1) * 3 * multiplier;
    const weekendDip = [0, 6].includes(date.getDay()) ? 0.5 : 1;

    const clicks = Math.round(Math.max(0, (baseClicks + noise) * weekendDip));
    const impressions = Math.round(clicks * (10 + rng() * 8));

    data.push({
      date: date.toISOString().split('T')[0],
      pageId,
      clicks,
      impressions: Math.max(0, impressions),
      ctr: impressions > 0 ? Math.round((clicks / impressions) * 10000) / 10000 : 0,
      position: Math.round((18 - multiplier * 3 + rng() * 6) * 10) / 10,
    });
  }

  return data;
}

export const dailyTraffic: DailyTraffic[] = generateDailyTraffic(365);

// Lazy cache — generate traffic per page on demand instead of upfront for all 2800+ pages
const _pageTrafficCache: Record<string, TrafficMetric[]> = {};

function getOrGeneratePageTraffic(pageId: string): TrafficMetric[] {
  if (_pageTrafficCache[pageId]) return _pageTrafficCache[pageId];

  // Extract page index from id (e.g. 'p142' → 141)
  const idx = parseInt(pageId.replace('p', ''), 10) - 1;
  const mult = getPageMultiplier(idx, pages.length);
  const data = generatePageTraffic(pageId, 365, mult, idx * 7 + 31);
  _pageTrafficCache[pageId] = data;
  return data;
}

// Proxy object that lazily generates traffic data per page
export const pageTraffic: Record<string, TrafficMetric[]> = new Proxy({} as Record<string, TrafficMetric[]>, {
  get(_target, prop: string) {
    if (typeof prop !== 'string' || !prop.startsWith('p')) return undefined;
    return getOrGeneratePageTraffic(prop);
  },
  has(_target, prop: string) {
    return typeof prop === 'string' && prop.startsWith('p');
  },
});

// Aggregated metrics for each page, with optional date range
export function getPageMetrics(pageId: string, startDate?: string, endDate?: string) {
  const traffic = getOrGeneratePageTraffic(pageId);

  const filterRange = (data: TrafficMetric[], s?: string, e?: string) =>
    s && e ? data.filter((d) => d.date >= s && d.date <= e) : data.slice(-30);

  const currentData = filterRange(traffic, startDate, endDate);

  // Compute previous period of equal length
  let previousData: TrafficMetric[];
  if (startDate && endDate) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    const days = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const prevEnd = new Date(s);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - days + 1);
    previousData = filterRange(traffic, prevStart.toISOString().split('T')[0], prevEnd.toISOString().split('T')[0]);
  } else {
    previousData = traffic.slice(-60, -30);
  }

  const sum = (arr: TrafficMetric[]) => ({
    clicks: arr.reduce((s, d) => s + d.clicks, 0),
    impressions: arr.reduce((s, d) => s + d.impressions, 0),
    avgCtr: arr.length > 0 ? arr.reduce((s, d) => s + d.ctr, 0) / arr.length : 0,
    avgPosition: arr.length > 0 ? arr.reduce((s, d) => s + d.position, 0) / arr.length : 0,
  });

  return {
    current: sum(currentData),
    previous: sum(previousData),
  };
}
