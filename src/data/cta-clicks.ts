import { LandingPage, DailyCtaClicks } from '@/types';
import { dailyTraffic, pageTraffic } from './traffic';
import { leads } from './leads';

// Landing pages that blog CTAs point to
export const landingPages: LandingPage[] = [
  { id: 'lp1', url: '/pricing', title: 'Pricing', type: 'pricing' },
  { id: 'lp2', url: '/demo', title: 'Book a Demo', type: 'demo' },
  { id: 'lp3', url: '/product', title: 'Product Overview', type: 'product' },
  { id: 'lp4', url: '/free-trial', title: 'Free Trial', type: 'signup' },
  { id: 'lp5', url: '/contact-sales', title: 'Contact Sales', type: 'contact' },
  { id: 'lp6', url: '/case-studies', title: 'Case Studies Hub', type: 'product' },
];

// Distribution weights for how CTA clicks spread across landing pages
const LP_WEIGHTS: Record<string, number> = {
  lp1: 0.28, // Pricing gets most clicks
  lp2: 0.22,
  lp3: 0.18,
  lp4: 0.14,
  lp5: 0.10,
  lp6: 0.08,
};

function generateDailyCtaClicks(days: number): DailyCtaClicks[] {
  const data: DailyCtaClicks[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const dayIndex = days - i;
    // CTA clicks ~8-15% of organic traffic, with growth trend + noise
    const growthFactor = 1 + (dayIndex / days) * 0.6;
    const weekendDip = [0, 6].includes(date.getDay()) ? 0.55 : 1;
    const noise = Math.sin(dayIndex * 0.5) * 0.12 + Math.cos(dayIndex * 0.3) * 0.08;

    // Find matching organic traffic for this day to calibrate
    const dateStr = date.toISOString().split('T')[0];
    const organicDay = dailyTraffic.find((d) => d.date === dateStr);
    const organicClicks = organicDay?.clicks ?? (120 + dayIndex * 2.5);

    // CTA clicks = 8-15% of organic clicks
    const ctaRate = 0.10 + (dayIndex / days) * 0.04; // grows from ~10% to ~14%
    const baseTotal = Math.round(organicClicks * ctaRate * growthFactor * weekendDip * (1 + noise));
    const totalClicks = Math.max(1, baseTotal);

    // Distribute across landing pages
    const byLandingPage: Record<string, number> = {};
    let allocated = 0;
    const lpIds = landingPages.map((lp) => lp.id);

    lpIds.forEach((lpId, idx) => {
      if (idx === lpIds.length - 1) {
        // Last one gets remainder
        byLandingPage[lpId] = Math.max(0, totalClicks - allocated);
      } else {
        const weight = LP_WEIGHTS[lpId] ?? 0.1;
        const lpNoise = 1 + Math.sin(dayIndex * 0.3 + idx) * 0.15;
        const clicks = Math.round(totalClicks * weight * lpNoise);
        byLandingPage[lpId] = Math.max(0, clicks);
        allocated += byLandingPage[lpId];
      }
    });

    data.push({ date: dateStr, totalClicks, byLandingPage });
  }

  return data;
}

// Per-blog-article CTA click multipliers (calibrated to organic traffic multipliers in traffic.ts)
const PAGE_CTA_MULTIPLIERS: Record<string, number> = {
  p1: 2.5,  p2: 2.0,  p3: 1.8,  p4: 1.5,  p5: 1.7,
  p6: 2.2,  p7: 1.9,  p8: 1.6,  p9: 2.3,  p10: 1.4,
  p11: 1.3, p12: 1.8, p13: 1.5, p14: 1.2, p15: 1.6,
  p16: 1.0, p17: 2.1, p18: 1.1, p19: 0.9, p20: 1.7,
};

interface PageCtaData {
  pageId: string;
  totalCtaClicks: number;
  ctaRate: number; // CTA clicks / organic visits
  byLandingPage: Record<string, number>;
}

function generatePageCtaClicks(): Record<string, PageCtaData> {
  const result: Record<string, PageCtaData> = {};

  Object.entries(PAGE_CTA_MULTIPLIERS).forEach(([pageId, multiplier]) => {
    // Sum organic clicks for this page (last 30 days default)
    const traffic = pageTraffic[pageId] || [];
    const last30 = traffic.slice(-30);
    const organicClicks = last30.reduce((s, d) => s + d.clicks, 0);

    // CTA clicks = 8-15% of organic, scaled by multiplier relative to average
    const avgMultiplier = 1.65;
    const ctaRate = 0.10 + (multiplier / avgMultiplier - 1) * 0.03;
    const totalCtaClicks = Math.round(organicClicks * ctaRate);

    // Distribute across landing pages
    const byLandingPage: Record<string, number> = {};
    let allocated = 0;
    const lpIds = landingPages.map((lp) => lp.id);

    lpIds.forEach((lpId, idx) => {
      if (idx === lpIds.length - 1) {
        byLandingPage[lpId] = Math.max(0, totalCtaClicks - allocated);
      } else {
        const weight = LP_WEIGHTS[lpId] ?? 0.1;
        const clicks = Math.round(totalCtaClicks * weight);
        byLandingPage[lpId] = clicks;
        allocated += clicks;
      }
    });

    result[pageId] = {
      pageId,
      totalCtaClicks,
      ctaRate: organicClicks > 0 ? totalCtaClicks / organicClicks : 0,
      byLandingPage,
    };
  });

  return result;
}

export const dailyCtaClicks: DailyCtaClicks[] = generateDailyCtaClicks(90);
export const pageCtaClicks: Record<string, PageCtaData> = generatePageCtaClicks();

// Filter daily CTA clicks by date range
export function filterCtaClicksByDate(
  data: DailyCtaClicks[],
  startDate?: string,
  endDate?: string,
): DailyCtaClicks[] {
  if (!startDate || !endDate) return data.slice(-30);
  return data.filter((d) => d.date >= startDate && d.date <= endDate);
}

// Aggregate CTA metrics for a period
export function getCtaMetrics(startDate?: string, endDate?: string) {
  const current = filterCtaClicksByDate(dailyCtaClicks, startDate, endDate);

  // Auto-compute previous period
  let previous: DailyCtaClicks[];
  if (startDate && endDate) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    const days = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const prevEnd = new Date(s);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - days + 1);
    previous = filterCtaClicksByDate(
      dailyCtaClicks,
      prevStart.toISOString().split('T')[0],
      prevEnd.toISOString().split('T')[0],
    );
  } else {
    previous = dailyCtaClicks.slice(-60, -30);
  }

  const sumClicks = (arr: DailyCtaClicks[]) => arr.reduce((s, d) => s + d.totalClicks, 0);

  const curClicks = sumClicks(current);
  const prevClicks = sumClicks(previous);

  // Organic visits for the same period
  const filterTraffic = (s?: string, e?: string) => {
    if (!s || !e) return dailyTraffic.slice(-30);
    return dailyTraffic.filter((d) => d.date >= s && d.date <= e);
  };
  const organicVisits = filterTraffic(startDate, endDate).reduce((s, d) => s + d.clicks, 0);
  const prevOrganicVisits = (() => {
    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      const days = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const prevEnd = new Date(s);
      prevEnd.setDate(prevEnd.getDate() - 1);
      const prevStart = new Date(prevEnd);
      prevStart.setDate(prevStart.getDate() - days + 1);
      return filterTraffic(
        prevStart.toISOString().split('T')[0],
        prevEnd.toISOString().split('T')[0],
      ).reduce((s, d) => s + d.clicks, 0);
    }
    return dailyTraffic.slice(-60, -30).reduce((s, d) => s + d.clicks, 0);
  })();

  const ctaRate = organicVisits > 0 ? curClicks / organicVisits : 0;
  const prevCtaRate = prevOrganicVisits > 0 ? prevClicks / prevOrganicVisits : 0;

  // Top landing pages by clicks in the period
  const lpTotals: Record<string, number> = {};
  current.forEach((d) => {
    Object.entries(d.byLandingPage).forEach(([lpId, clicks]) => {
      lpTotals[lpId] = (lpTotals[lpId] || 0) + clicks;
    });
  });

  const totalLpClicks = Object.values(lpTotals).reduce((s, v) => s + v, 0);
  const topLandingPages = landingPages
    .map((lp) => ({
      ...lp,
      clicks: lpTotals[lp.id] || 0,
      share: totalLpClicks > 0 ? (lpTotals[lp.id] || 0) / totalLpClicks : 0,
    }))
    .sort((a, b) => b.clicks - a.clicks);

  // Top blog articles by CTA clicks
  const topBlogArticles = Object.values(pageCtaClicks)
    .map((p) => ({
      pageId: p.pageId,
      ctaClicks: p.totalCtaClicks,
      ctaRate: p.ctaRate,
    }))
    .sort((a, b) => b.ctaClicks - a.ctaClicks);

  return {
    totalCtaClicks: curClicks,
    ctaClicksChange: prevClicks > 0 ? Math.round(((curClicks - prevClicks) / prevClicks) * 100) : null,
    previousCtaClicks: prevClicks,
    ctaRate,
    ctaRateChange: prevCtaRate > 0 ? Math.round(((ctaRate - prevCtaRate) / prevCtaRate) * 100) : null,
    topLandingPages,
    topBlogArticles,
  };
}

// Funnel data: Organic Visits → CTA Clicks → Leads
export function getCtaFunnelData(startDate?: string, endDate?: string) {
  const filterTraffic = (s?: string, e?: string) => {
    if (!s || !e) return dailyTraffic.slice(-30);
    return dailyTraffic.filter((d) => d.date >= s && d.date <= e);
  };

  const organicVisits = filterTraffic(startDate, endDate).reduce((s, d) => s + d.clicks, 0);
  const ctaData = filterCtaClicksByDate(dailyCtaClicks, startDate, endDate);
  const ctaClicks = ctaData.reduce((s, d) => s + d.totalClicks, 0);
  const totalLeads = leads.filter((l) => l.status !== 'lost').length;

  const ctaRate = organicVisits > 0 ? ctaClicks / organicVisits : 0;
  const leadConvRate = ctaClicks > 0 ? totalLeads / ctaClicks : 0;

  return {
    organicVisits,
    ctaClicks,
    leads: totalLeads,
    ctaRate,
    leadConvRate,
  };
}
