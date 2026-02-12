import { DailyTraffic, TrafficMetric } from '@/types';

function generateDailyTraffic(days: number): DailyTraffic[] {
  const data: DailyTraffic[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Simulate growth trend with some noise
    const dayIndex = days - i;
    const baseClicks = 120 + (dayIndex * 2.5);
    const noise = Math.sin(dayIndex * 0.5) * 30 + Math.cos(dayIndex * 0.3) * 15;
    const weekendDip = [0, 6].includes(date.getDay()) ? 0.6 : 1;

    const clicks = Math.round((baseClicks + noise) * weekendDip);
    const impressions = Math.round(clicks * (12 + Math.random() * 5));
    const ctr = clicks / impressions;
    const position = 18 - (dayIndex * 0.08) + Math.random() * 3;

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

function generatePageTraffic(pageId: string, days: number, multiplier: number): TrafficMetric[] {
  const data: TrafficMetric[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const dayIndex = days - i;
    const baseClicks = (8 + dayIndex * 0.3) * multiplier;
    const noise = Math.sin(dayIndex * 0.7 + multiplier) * 5;
    const weekendDip = [0, 6].includes(date.getDay()) ? 0.5 : 1;

    const clicks = Math.round(Math.max(0, (baseClicks + noise) * weekendDip));
    const impressions = Math.round(clicks * (10 + Math.random() * 8));

    data.push({
      date: date.toISOString().split('T')[0],
      pageId,
      clicks,
      impressions: Math.max(0, impressions),
      ctr: impressions > 0 ? Math.round((clicks / impressions) * 10000) / 10000 : 0,
      position: Math.round((15 - multiplier * 2 + Math.random() * 4) * 10) / 10,
    });
  }

  return data;
}

export const dailyTraffic: DailyTraffic[] = generateDailyTraffic(90);

export const pageTraffic: Record<string, TrafficMetric[]> = {
  p1: generatePageTraffic('p1', 90, 2.5),
  p2: generatePageTraffic('p2', 90, 2.0),
  p3: generatePageTraffic('p3', 90, 1.8),
  p4: generatePageTraffic('p4', 90, 1.5),
  p5: generatePageTraffic('p5', 90, 1.7),
  p6: generatePageTraffic('p6', 90, 2.2),
  p7: generatePageTraffic('p7', 90, 1.9),
  p8: generatePageTraffic('p8', 90, 1.6),
  p9: generatePageTraffic('p9', 90, 2.3),
  p10: generatePageTraffic('p10', 90, 1.4),
  p11: generatePageTraffic('p11', 90, 1.3),
  p12: generatePageTraffic('p12', 90, 1.8),
  p13: generatePageTraffic('p13', 90, 1.5),
  p14: generatePageTraffic('p14', 90, 1.2),
  p15: generatePageTraffic('p15', 90, 1.6),
  p16: generatePageTraffic('p16', 90, 1.0),
  p17: generatePageTraffic('p17', 90, 2.1),
  p18: generatePageTraffic('p18', 90, 1.1),
  p19: generatePageTraffic('p19', 90, 0.9),
  p20: generatePageTraffic('p20', 90, 1.7),
};

// Aggregated metrics for each page, with optional date range
export function getPageMetrics(pageId: string, startDate?: string, endDate?: string) {
  const traffic = pageTraffic[pageId] || [];

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
