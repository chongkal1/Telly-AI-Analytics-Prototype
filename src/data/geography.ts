export interface GeoTrafficEntry {
  country: string;
  countryCode: string;
  sessions: number;
  clicks: number;
  impressions: number;
  leads: number;
  conversionRate: number;
  percentageOfTotal: number;
}

export function getGeographicData(): GeoTrafficEntry[] {
  const raw: Omit<GeoTrafficEntry, 'percentageOfTotal'>[] = [
    { country: 'United States', countryCode: 'US', sessions: 12480, clicks: 4820, impressions: 62400, leads: 48, conversionRate: 3.85 },
    { country: 'United Kingdom', countryCode: 'GB', sessions: 3740, clicks: 1445, impressions: 18700, leads: 14, conversionRate: 3.74 },
    { country: 'Canada', countryCode: 'CA', sessions: 2180, clicks: 842, impressions: 10900, leads: 8, conversionRate: 3.67 },
    { country: 'Germany', countryCode: 'DE', sessions: 1870, clicks: 722, impressions: 9350, leads: 7, conversionRate: 3.74 },
    { country: 'Australia', countryCode: 'AU', sessions: 1560, clicks: 603, impressions: 7800, leads: 6, conversionRate: 3.85 },
    { country: 'India', countryCode: 'IN', sessions: 1340, clicks: 518, impressions: 6700, leads: 4, conversionRate: 2.99 },
    { country: 'France', countryCode: 'FR', sessions: 1120, clicks: 433, impressions: 5600, leads: 4, conversionRate: 3.57 },
    { country: 'Netherlands', countryCode: 'NL', sessions: 940, clicks: 363, impressions: 4700, leads: 3, conversionRate: 3.19 },
    { country: 'Singapore', countryCode: 'SG', sessions: 810, clicks: 313, impressions: 4050, leads: 3, conversionRate: 3.70 },
    { country: 'Brazil', countryCode: 'BR', sessions: 690, clicks: 267, impressions: 3450, leads: 2, conversionRate: 2.90 },
    { country: 'Japan', countryCode: 'JP', sessions: 580, clicks: 224, impressions: 2900, leads: 2, conversionRate: 3.45 },
    { country: 'Sweden', countryCode: 'SE', sessions: 470, clicks: 182, impressions: 2350, leads: 2, conversionRate: 4.26 },
    { country: 'Israel', countryCode: 'IL', sessions: 410, clicks: 158, impressions: 2050, leads: 2, conversionRate: 4.88 },
    { country: 'South Korea', countryCode: 'KR', sessions: 350, clicks: 135, impressions: 1750, leads: 1, conversionRate: 2.86 },
    { country: 'UAE', countryCode: 'AE', sessions: 260, clicks: 100, impressions: 1300, leads: 1, conversionRate: 3.85 },
  ];

  const totalSessions = raw.reduce((s, e) => s + e.sessions, 0);

  return raw.map((e) => ({
    ...e,
    percentageOfTotal: Math.round((e.sessions / totalSessions) * 1000) / 10,
  }));
}
