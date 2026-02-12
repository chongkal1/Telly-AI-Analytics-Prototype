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
    const growthFactor = 1 + (dayIndex / days) * 1.8;
    const weekendDip = [0, 6].includes(date.getDay()) ? 0.7 : 1;
    const noise = Math.sin(dayIndex * 0.4) * 0.15 + Math.cos(dayIndex * 0.7) * 0.1;

    // ChatGPT dominates, Perplexity second, rest follow
    const baseChatGPT = Math.round((28 + dayIndex * 0.8) * growthFactor * weekendDip * (1 + noise));
    const basePerplexity = Math.round((18 + dayIndex * 0.6) * growthFactor * weekendDip * (1 + noise * 0.8));
    const baseGemini = Math.round((12 + dayIndex * 0.5) * growthFactor * weekendDip * (1 - noise * 0.5));
    const baseClaude = Math.round((8 + dayIndex * 0.35) * growthFactor * weekendDip * (1 + noise * 0.6));
    const baseCopilot = Math.round((6 + dayIndex * 0.25) * growthFactor * weekendDip * (1 - noise * 0.3));
    const baseMetaAi = Math.round((4 + dayIndex * 0.2) * growthFactor * weekendDip * (1 + noise * 0.4));

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
  const pageData: { id: string; title: string; url: string; weight: number }[] = [
    { id: 'p1', title: 'The Complete Guide to AI Content Marketing in 2024', url: '/blog/ai-content-marketing-guide', weight: 2.8 },
    { id: 'p6', title: 'How AI is Transforming SEO Automation', url: '/blog/ai-seo-automation', weight: 2.5 },
    { id: 'p12', title: 'Maintaining Content Quality with AI-Generated Articles', url: '/blog/ai-content-quality', weight: 2.3 },
    { id: 'p20', title: 'Scaling Content Production with AI: Lessons from 500+ Articles', url: '/blog/ai-content-scaling', weight: 2.1 },
    { id: 'p3', title: 'Technical SEO Checklist for B2B SaaS Companies', url: '/blog/technical-seo-checklist', weight: 1.9 },
    { id: 'p8', title: 'Keyword Research for B2B: Finding High-Intent Keywords', url: '/blog/keyword-research-guide', weight: 1.7 },
    { id: 'p2', title: 'How to Calculate SEO ROI: A Step-by-Step Framework', url: '/blog/seo-roi-calculator', weight: 1.5 },
    { id: 'p9', title: 'Case Study: How TechCorp Grew Organic Traffic 340%', url: '/blog/case-study-saas-growth', weight: 1.4 },
    { id: 'p7', title: 'B2B Content Strategy: From Zero to 100K Monthly Visitors', url: '/blog/b2b-content-strategy', weight: 1.3 },
    { id: 'p13', title: 'Product-Led SEO: Turning Your Product into a Traffic Engine', url: '/blog/product-led-seo', weight: 1.1 },
    { id: 'p5', title: 'Content Marketing Metrics Every CMO Should Track', url: '/blog/content-marketing-metrics', weight: 1.0 },
    { id: 'p4', title: '10 Link Building Strategies That Actually Work', url: '/blog/link-building-strategies', weight: 0.9 },
    { id: 'p11', title: 'SEO for Startups: Building Organic Growth from Day One', url: '/blog/seo-for-startups', weight: 0.85 },
    { id: 'p17', title: 'Case Study: FinTech Startup Generates 200+ Leads with Content', url: '/blog/case-study-fintech-leads', weight: 0.8 },
    { id: 'p15', title: 'Site Speed Optimization: Impact on Rankings and Conversions', url: '/blog/site-speed-optimization', weight: 0.7 },
    { id: 'p10', title: 'Content Distribution: Getting Your Articles in Front of Decision Makers', url: '/blog/content-distribution', weight: 0.65 },
    { id: 'p14', title: 'Competitor Analysis for Content Marketing Teams', url: '/blog/competitor-analysis', weight: 0.55 },
    { id: 'p18', title: 'Internal Linking Strategy for Maximum SEO Impact', url: '/blog/internal-linking-strategy', weight: 0.45 },
    { id: 'p19', title: 'Content Marketing Budget Guide: ROI-Based Allocation', url: '/blog/content-marketing-budget', weight: 0.35 },
    { id: 'p16', title: 'Tely AI Product Update: Q2 2024 Features', url: '/blog/tely-product-update-q2', weight: 0.2 },
  ];

  return pageData.map((p) => {
    const base = Math.round(p.weight * 40);
    // Distribute across engines: ChatGPT ~35%, Perplexity ~25%, Gemini ~18%, Claude ~10%, Copilot ~7%, Meta ~5%
    const chatgpt = Math.round(base * (0.33 + Math.random() * 0.04));
    const perplexity = Math.round(base * (0.23 + Math.random() * 0.04));
    const gemini = Math.round(base * (0.16 + Math.random() * 0.04));
    const claude = Math.round(base * (0.09 + Math.random() * 0.03));
    const copilot = Math.round(base * (0.06 + Math.random() * 0.03));
    const metaAi = Math.max(0, base - chatgpt - perplexity - gemini - claude - copilot);

    return {
      pageId: p.id,
      title: p.title.length > 50 ? p.title.slice(0, 50) + '...' : p.title,
      url: p.url,
      totalCitations: chatgpt + perplexity + gemini + claude + copilot + metaAi,
      chatgpt,
      perplexity,
      gemini,
      claude,
      copilot,
      metaAi,
      sentiment: Math.round(65 + p.weight * 10 + Math.random() * 8),
      avgPosition: Math.round((1.5 + (1 / p.weight) * 0.8) * 10) / 10,
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

export const dailyAITraffic: DailyAITraffic[] = generateDailyAITraffic(90);
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
