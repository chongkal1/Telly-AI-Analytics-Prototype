import { pages } from './pages';
import { getLeadsPerPage } from './leads-distribution';

export interface DailyAITraffic {
  date: string;
  citations: number;
  appearances: number;
  chatgpt: number;
  perplexity: number;
  gemini: number;
  claude: number;
  copilot: number;
  metaAi: number;
}

export interface AIPageCitation {
  pageId: string;
  title: string;
  url: string;
  totalCitations: number;
  chatgpt: number;
  perplexity: number;
  gemini: number;
  claude: number;
  copilot: number;
  metaAi: number;
  sentiment: number; // 0-100
  avgPosition: number;
  aiClicks: number; // visits from AI referrals
  leads: number; // leads generated from this page
  change: number; // % change vs previous period
}

export interface AICompetitor {
  name: string;
  visibility: number;
  citations: number;
  sentiment: number;
  shareOfVoice: number;
}

// AI Engines with brand colors
export const AI_ENGINES = [
  { key: 'chatgpt', name: 'ChatGPT', color: '#10a37f' },
  { key: 'perplexity', name: 'Perplexity', color: '#20b8cd' },
  { key: 'gemini', name: 'Gemini', color: '#4285f4' },
  { key: 'claude', name: 'Claude', color: '#d97706' },
  { key: 'copilot', name: 'Copilot', color: '#7c3aed' },
  { key: 'metaAi', name: 'Meta AI', color: '#1877f2' },
] as const;

function generateDailyAITraffic(days: number): DailyAITraffic[] {
  const data: DailyAITraffic[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const dayIndex = days - i;
    // AI traffic growing faster than organic — exponential-ish growth
    // Real data: ChatGPT ~9,818/week (~1,400/day), total AI ~1,450/day
    // For 365 days, grow from ~30/day total to ~200/day
    const progress = dayIndex / days;
    const weekendDip = [0, 6].includes(date.getDay()) ? 0.7 : 1;
    const noise = Math.sin(dayIndex * 0.4) * 0.15 + Math.cos(dayIndex * 0.7) * 0.1;

    // ChatGPT dominates (~72%), based on real Cloudflare referral data
    // Real proportions: ChatGPT 96%+, but inflated others for demo visibility
    const baseChatGPT = Math.round((8 + 140 * Math.pow(progress, 1.5)) * weekendDip * (1 + noise));
    const basePerplexity = Math.round((2 + 24 * Math.pow(progress, 1.5)) * weekendDip * (1 + noise * 0.8));
    const baseGemini = Math.round((1.5 + 16 * Math.pow(progress, 1.5)) * weekendDip * (1 - noise * 0.5));
    const baseClaude = Math.round((1 + 8 * Math.pow(progress, 1.5)) * weekendDip * (1 + noise * 0.6));
    const baseCopilot = Math.round((0.8 + 6 * Math.pow(progress, 1.5)) * weekendDip * (1 - noise * 0.3));
    const baseMetaAi = Math.round((0.5 + 3 * Math.pow(progress, 1.5)) * weekendDip * (1 + noise * 0.4));

    const chatgpt = Math.max(0, baseChatGPT);
    const perplexity = Math.max(0, basePerplexity);
    const gemini = Math.max(0, baseGemini);
    const claude = Math.max(0, baseClaude);
    const copilot = Math.max(0, baseCopilot);
    const metaAi = Math.max(0, baseMetaAi);

    const citations = chatgpt + perplexity + gemini + claude + copilot + metaAi;
    // Appearances are higher than citations (brand mentioned but not always cited)
    const appearances = Math.round(citations * (1.6 + Math.random() * 0.4));

    data.push({
      date: date.toISOString().split('T')[0],
      citations,
      appearances,
      chatgpt,
      perplexity,
      gemini,
      claude,
      copilot,
      metaAi,
    });
  }

  return data;
}

function generatePageCitations(): AIPageCitation[] {
  const leadsMap = getLeadsPerPage();

  // Generate citation data for all pages with power-law distribution
  const pageData = pages.map((p, idx) => {
    const rank = idx + 1;
    const weight = Math.max(0.1, Math.pow(pages.length / rank, 0.4) * 0.3);
    return { id: p.id, title: p.title, url: p.url, weight };
  });

  return pageData.map((p) => {
    const base = Math.round(p.weight * 40);
    // Distribute across engines: ChatGPT ~72%, Perplexity ~12%, Gemini ~8%, Claude ~4%, Copilot ~3%, Meta ~1%
    // Based on real Cloudflare referral data showing ChatGPT dominance
    const chatgpt = Math.round(base * (0.70 + Math.random() * 0.04));
    const perplexity = Math.round(base * (0.11 + Math.random() * 0.03));
    const gemini = Math.round(base * (0.07 + Math.random() * 0.03));
    const claude = Math.round(base * (0.03 + Math.random() * 0.02));
    const copilot = Math.round(base * (0.02 + Math.random() * 0.02));
    const metaAi = Math.max(0, base - chatgpt - perplexity - gemini - claude - copilot);

    const totalCitations = chatgpt + perplexity + gemini + claude + copilot + metaAi;
    const aiClicks = Math.round(totalCitations * (0.30 + Math.random() * 0.15));

    return {
      pageId: p.id,
      title: p.title.length > 50 ? p.title.slice(0, 50) + '...' : p.title,
      url: p.url,
      totalCitations,
      chatgpt,
      perplexity,
      gemini,
      claude,
      copilot,
      metaAi,
      sentiment: Math.round(65 + p.weight * 10 + Math.random() * 8),
      avgPosition: Math.round((1.5 + (1 / p.weight) * 0.8) * 10) / 10,
      aiClicks,
      leads: leadsMap[p.id] ?? 0,
      change: Math.round((p.weight > 1.5 ? 15 : -5) + (Math.random() * 20 - 10)),
    };
  });
}

function generateCompetitorData(): AICompetitor[] {
  return [
    { name: 'Tely AI (You)', visibility: 62, citations: 1847, sentiment: 82, shareOfVoice: 28 },
    { name: 'Jasper AI', visibility: 48, citations: 1420, sentiment: 75, shareOfVoice: 22 },
    { name: 'Surfer SEO', visibility: 41, citations: 1190, sentiment: 71, shareOfVoice: 18 },
    { name: 'Clearscope', visibility: 35, citations: 980, sentiment: 78, shareOfVoice: 14 },
    { name: 'MarketMuse', visibility: 28, citations: 750, sentiment: 69, shareOfVoice: 10 },
    { name: 'Frase', visibility: 22, citations: 580, sentiment: 66, shareOfVoice: 8 },
  ];
}

export const dailyAITraffic: DailyAITraffic[] = generateDailyAITraffic(365);
export const aiPageCitations: AIPageCitation[] = generatePageCitations();
export const aiCompetitors: AICompetitor[] = generateCompetitorData();

// Helper to filter AI traffic by date range
export function filterAITrafficByDate(
  data: DailyAITraffic[],
  startDate?: string,
  endDate?: string,
): DailyAITraffic[] {
  if (!startDate || !endDate) return data.slice(-30);
  return data.filter((d) => d.date >= startDate && d.date <= endDate);
}

// Aggregate AI metrics for the period
export function getAIMetrics(startDate?: string, endDate?: string) {
  const current = filterAITrafficByDate(dailyAITraffic, startDate, endDate);

  // Auto-compute previous period
  let previous: DailyAITraffic[];
  if (startDate && endDate) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    const days = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const prevEnd = new Date(s);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - days + 1);
    previous = filterAITrafficByDate(
      dailyAITraffic,
      prevStart.toISOString().split('T')[0],
      prevEnd.toISOString().split('T')[0],
    );
  } else {
    previous = dailyAITraffic.slice(-60, -30);
  }

  const sumCitations = (arr: DailyAITraffic[]) => arr.reduce((s, d) => s + d.citations, 0);
  const sumAppearances = (arr: DailyAITraffic[]) => arr.reduce((s, d) => s + d.appearances, 0);
  const sumEngine = (arr: DailyAITraffic[], key: keyof DailyAITraffic) =>
    arr.reduce((s, d) => s + (d[key] as number), 0);

  const curCitations = sumCitations(current);
  const prevCitations = sumCitations(previous);
  const curAppearances = sumAppearances(current);
  const prevAppearances = sumAppearances(previous);

  return {
    totalCitations: curCitations,
    citationsChange: prevCitations > 0 ? Math.round(((curCitations - prevCitations) / prevCitations) * 100) : null,
    previousCitations: prevCitations,
    totalAppearances: curAppearances,
    appearancesChange: prevAppearances > 0 ? Math.round(((curAppearances - prevAppearances) / prevAppearances) * 100) : null,
    previousAppearances: prevAppearances,
    engineBreakdown: AI_ENGINES.map((eng) => ({
      name: eng.name,
      value: sumEngine(current, eng.key as keyof DailyAITraffic),
      color: eng.color,
    })),
  };
}
