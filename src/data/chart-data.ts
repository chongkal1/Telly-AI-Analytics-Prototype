import { dailyTraffic, getPageMetrics } from './traffic';
import { pages } from './pages';
import { leads } from './leads';
import { DailyTraffic, Lead } from '@/types';
import {
  dailyAITraffic,
  aiPageCitations,
  aiCompetitors,
  filterAITrafficByDate,
  getAIMetrics,
} from './ai-analytics';
import {
  dailyCtaClicks,
  filterCtaClicksByDate,
  getCtaMetrics,
  pageCtaClicks,
} from './cta-clicks';

function filterByDateRange(data: DailyTraffic[], startDate?: string, endDate?: string): DailyTraffic[] {
  if (!startDate || !endDate) return data.slice(-30);
  return data.filter((d) => d.date >= startDate && d.date <= endDate);
}

export function getChartData(dataKey: string, startDate?: string, endDate?: string) {
  switch (dataKey) {
    case 'dailyTraffic':
      return filterByDateRange(dailyTraffic, startDate, endDate);

    case 'topPages': {
      const pageMetrics = pages.map((p) => {
        const m = getPageMetrics(p.id, startDate, endDate);
        return { name: p.title.length > 35 ? p.title.slice(0, 35) + '...' : p.title, clicks: m.current.clicks, impressions: m.current.impressions };
      });
      return pageMetrics.sort((a, b) => b.clicks - a.clicks).slice(0, 8);
    }

    case 'leadsByStatus': {
      const counts: Record<string, number> = {};
      leads.forEach((l) => { counts[l.status] = (counts[l.status] || 0) + 1; });
      return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
    }

    case 'roiBreakdown':
      return [
        { name: 'Content Spend', value: 3500 },
        { name: 'Pipeline Value', value: 480000 },
        { name: 'Converted ARR', value: 266000 },
        { name: 'Cost per Lead', value: 250 },
      ];

    case 'categoryPerformance': {
      const catClicks: Record<string, { clicks: number; count: number }> = {};
      pages.forEach((p) => {
        const m = getPageMetrics(p.id, startDate, endDate);
        if (!catClicks[p.category]) catClicks[p.category] = { clicks: 0, count: 0 };
        catClicks[p.category].clicks += m.current.clicks;
        catClicks[p.category].count += 1;
      });
      return Object.entries(catClicks)
        .map(([name, { clicks, count }]) => ({ name, clicks, avgClicks: Math.round(clicks / count) }))
        .sort((a, b) => b.avgClicks - a.avgClicks);
    }

    case 'recentLeads':
      return leads.slice(-10).reverse();

    case 'leadsTable':
      return leads;

    case 'contentTable':
      return pages.map((p) => {
        const m = getPageMetrics(p.id, startDate, endDate);
        return {
          id: p.id,
          title: p.title,
          url: p.url,
          category: p.category,
          publishDate: p.publishDate,
          clicks: m.current.clicks,
          impressions: m.current.impressions,
          ctr: m.current.avgCtr,
          position: m.current.avgPosition,
        };
      });

    // AI Analytics data keys
    case 'dailyAITraffic':
      return filterAITrafficByDate(dailyAITraffic, startDate, endDate);

    case 'aiEngineBreakdown': {
      const metrics = getAIMetrics(startDate, endDate);
      return metrics.engineBreakdown;
    }

    case 'aiEngineTimeline': {
      const aiData = filterAITrafficByDate(dailyAITraffic, startDate, endDate);
      return aiData.map((d) => ({
        date: d.date,
        ChatGPT: d.chatgpt,
        Perplexity: d.perplexity,
        Gemini: d.gemini,
        Claude: d.claude,
        Copilot: d.copilot,
        'Meta AI': d.metaAi,
      }));
    }

    case 'aiCompetitorVisibility':
      return aiCompetitors.map((c) => ({ name: c.name, visibility: c.visibility }));

    case 'aiCompetitorSOV':
      return aiCompetitors.map((c) => ({ name: c.name, shareOfVoice: c.shareOfVoice }));

    case 'aiPageCitations':
      return aiPageCitations;

    case 'leadsByIndustry': {
      const industryCounts: Record<string, number> = {};
      leads.forEach((l) => { industryCounts[l.industry] = (industryCounts[l.industry] || 0) + 1; });
      return Object.entries(industryCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    }

    case 'industryByValue': {
      const industryValues: Record<string, number> = {};
      leads.forEach((l) => { industryValues[l.industry] = (industryValues[l.industry] || 0) + l.value; });
      return Object.entries(industryValues)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    }

    case 'contentIntelligence':
      return getContentIntelligence();

    // CTA Click data keys
    case 'dailyCtaClicks':
      return filterCtaClicksByDate(dailyCtaClicks, startDate, endDate);

    case 'ctaByLandingPage': {
      const ctaMetrics = getCtaMetrics(startDate, endDate);
      return ctaMetrics.topLandingPages.map((lp) => ({
        name: lp.title,
        clicks: lp.clicks,
        share: Math.round(lp.share * 100),
      }));
    }

    default:
      return [];
  }
}

export function getMetricValue(
  dataKey: string,
  startDate?: string,
  endDate?: string,
  compareStartDate?: string,
  compareEndDate?: string,
): { value: string; change: number | null; previousValue?: string } {
  const current = filterByDateRange(dailyTraffic, startDate, endDate);
  const previous = (compareStartDate && compareEndDate)
    ? filterByDateRange(dailyTraffic, compareStartDate, compareEndDate)
    : (() => {
        // Default: auto-compute previous period of equal length
        if (startDate && endDate) {
          const s = new Date(startDate);
          const e = new Date(endDate);
          const days = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          const prevEnd = new Date(s);
          prevEnd.setDate(prevEnd.getDate() - 1);
          const prevStart = new Date(prevEnd);
          prevStart.setDate(prevStart.getDate() - days + 1);
          return filterByDateRange(dailyTraffic, prevStart.toISOString().split('T')[0], prevEnd.toISOString().split('T')[0]);
        }
        return dailyTraffic.slice(-60, -30);
      })();

  const sumField = (arr: DailyTraffic[], field: 'clicks' | 'impressions') =>
    arr.reduce((s, d) => s + d[field], 0);
  const avgField = (arr: DailyTraffic[], field: 'ctr' | 'position') =>
    arr.length > 0 ? arr.reduce((s, d) => s + d[field], 0) / arr.length : 0;

  switch (dataKey) {
    case 'totalClicks': {
      const cur = sumField(current, 'clicks');
      const prev = sumField(previous, 'clicks');
      return {
        value: cur.toLocaleString(),
        change: prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null,
        previousValue: prev.toLocaleString(),
      };
    }
    case 'totalImpressions': {
      const cur = sumField(current, 'impressions');
      const prev = sumField(previous, 'impressions');
      return {
        value: cur.toLocaleString(),
        change: prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null,
        previousValue: prev.toLocaleString(),
      };
    }
    case 'avgCtr': {
      const cur = avgField(current, 'ctr');
      const prev = avgField(previous, 'ctr');
      return {
        value: `${(cur * 100).toFixed(2)}%`,
        change: prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null,
        previousValue: `${(prev * 100).toFixed(2)}%`,
      };
    }
    case 'leadsGenerated':
      return { value: '14', change: 40, previousValue: '10' };
    case 'totalArticles':
      return { value: '80', change: 12, previousValue: '71' };
    case 'totalContentPieces':
      return { value: '700', change: 18, previousValue: '593' };
    case 'avgClicksPerArticle': {
      const totalClicks = sumField(current, 'clicks');
      return { value: Math.round(totalClicks / 20).toLocaleString(), change: 15, previousValue: Math.round(sumField(previous, 'clicks') / 20).toLocaleString() };
    }
    case 'topCategory':
      return { value: 'AI & Automation', change: null };
    case 'estimatedRevenue':
      return { value: '$480K', change: 25, previousValue: '$384K' };

    // AI Analytics metrics
    case 'aiVisibilityScore':
      return { value: '62%', change: 18, previousValue: '52%' };
    case 'aiCitations': {
      const aiMetrics = getAIMetrics(startDate, endDate);
      return {
        value: aiMetrics.totalCitations.toLocaleString(),
        change: aiMetrics.citationsChange,
        previousValue: aiMetrics.previousCitations.toLocaleString(),
      };
    }
    case 'aiAppearances': {
      const aiMetrics2 = getAIMetrics(startDate, endDate);
      return {
        value: aiMetrics2.totalAppearances.toLocaleString(),
        change: aiMetrics2.appearancesChange,
        previousValue: aiMetrics2.previousAppearances.toLocaleString(),
      };
    }
    case 'aiShareOfVoice':
      return { value: '28%', change: 12, previousValue: '25%' };
    case 'aiSentiment':
      return { value: '82/100', change: 5, previousValue: '78/100' };
    case 'aiAvgPosition':
      return { value: '2.3', change: -8, previousValue: '2.5' };

    case 'identifiedVisitors':
      return { value: leads.length.toString(), change: 34, previousValue: '90' };
    case 'industryCount': {
      const industries = new Set(leads.map((l) => l.industry));
      return { value: industries.size.toString(), change: null };
    }
    case 'topIndustry': {
      const ic: Record<string, number> = {};
      leads.forEach((l) => { ic[l.industry] = (ic[l.industry] || 0) + 1; });
      const top = Object.entries(ic).sort((a, b) => b[1] - a[1])[0];
      return { value: top ? top[0] : '—', change: null };
    }
    case 'contentGaps': {
      const gaps = getContentIntelligence().filter((g) => g.contentCoverage === 'weak');
      return { value: gaps.length.toString(), change: null };
    }

    // CTA Click metrics
    case 'totalCtaClicks': {
      const ctaM = getCtaMetrics(startDate, endDate);
      return {
        value: ctaM.totalCtaClicks.toLocaleString(),
        change: ctaM.ctaClicksChange,
        previousValue: ctaM.previousCtaClicks.toLocaleString(),
      };
    }
    case 'ctaClickRate': {
      const ctaM2 = getCtaMetrics(startDate, endDate);
      return {
        value: `${(ctaM2.ctaRate * 100).toFixed(1)}%`,
        change: ctaM2.ctaRateChange,
      };
    }

    default:
      return { value: '—', change: null };
  }
}

export interface ClusterSummary {
  category: string;
  pageCount: number;
  totalClicks: number;
  totalImpressions: number;
  ctr: number;
  avgClicksPerPage: number;
  leads: number;
  convertedLeads: number;
  pagesWithImpressions: number;
  pagesWithClicks: number;
}

export interface ClusterPageDetail {
  id: string;
  title: string;
  url: string;
  publishDate: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  leads: number;
  prevClicks: number;
  prevImpressions: number;
  clicksChange: number;
  impressionsChange: number;
  status: 'performing' | 'attention' | 'underperforming';
}

export type InsightType = 'success' | 'warning' | 'danger';

export interface ClusterInsight {
  type: InsightType;
  title: string;
  description: string;
  pages: string[];
}

/** Returns aggregated metrics for each topical cluster (category) */
export function getClusterData(startDate?: string, endDate?: string): ClusterSummary[] {
  // Build a lookup: page url -> category
  const urlToCategory: Record<string, string> = {};
  pages.forEach((p) => { urlToCategory[p.url] = p.category; });

  // Count leads per category
  const leadsPerCategory: Record<string, { total: number; converted: number }> = {};
  leads.forEach((l) => {
    const cat = urlToCategory[l.sourceUrl];
    if (!cat) return;
    if (!leadsPerCategory[cat]) leadsPerCategory[cat] = { total: 0, converted: 0 };
    leadsPerCategory[cat].total += 1;
    if (l.status === 'converted') leadsPerCategory[cat].converted += 1;
  });

  // Group pages by category and aggregate traffic
  const clusters: Record<string, { pages: number; clicks: number; impressions: number; withImpressions: number; withClicks: number }> = {};
  pages.forEach((p) => {
    const m = getPageMetrics(p.id, startDate, endDate);
    if (!clusters[p.category]) clusters[p.category] = { pages: 0, clicks: 0, impressions: 0, withImpressions: 0, withClicks: 0 };
    clusters[p.category].pages += 1;
    clusters[p.category].clicks += m.current.clicks;
    clusters[p.category].impressions += m.current.impressions;
    if (m.current.impressions > 0) clusters[p.category].withImpressions += 1;
    if (m.current.clicks > 0) clusters[p.category].withClicks += 1;
  });

  return Object.entries(clusters)
    .map(([category, data]) => ({
      category,
      pageCount: data.pages,
      totalClicks: data.clicks,
      totalImpressions: data.impressions,
      ctr: data.impressions > 0 ? data.clicks / data.impressions : 0,
      avgClicksPerPage: data.pages > 0 ? Math.round(data.clicks / data.pages) : 0,
      leads: leadsPerCategory[category]?.total ?? 0,
      convertedLeads: leadsPerCategory[category]?.converted ?? 0,
      pagesWithImpressions: data.withImpressions,
      pagesWithClicks: data.withClicks,
    }))
    .sort((a, b) => b.totalClicks - a.totalClicks);
}

/** Returns individual page metrics within a specific cluster/category */
export function getClusterPages(category: string, startDate?: string, endDate?: string): ClusterPageDetail[] {
  const urlToCategory: Record<string, string> = {};
  pages.forEach((p) => { urlToCategory[p.url] = p.category; });

  // Count leads per page URL
  const leadsPerUrl: Record<string, number> = {};
  leads.forEach((l) => {
    leadsPerUrl[l.sourceUrl] = (leadsPerUrl[l.sourceUrl] || 0) + 1;
  });

  const pagesInCategory = pages
    .filter((p) => p.category === category)
    .map((p) => {
      const m = getPageMetrics(p.id, startDate, endDate);
      const clicksChange = m.previous.clicks > 0
        ? Math.round(((m.current.clicks - m.previous.clicks) / m.previous.clicks) * 100)
        : m.current.clicks > 0 ? 100 : 0;
      const impressionsChange = m.previous.impressions > 0
        ? Math.round(((m.current.impressions - m.previous.impressions) / m.previous.impressions) * 100)
        : m.current.impressions > 0 ? 100 : 0;
      return {
        id: p.id,
        title: p.title,
        url: p.url,
        publishDate: p.publishDate,
        clicks: m.current.clicks,
        impressions: m.current.impressions,
        ctr: m.current.avgCtr,
        position: m.current.avgPosition,
        leads: leadsPerUrl[p.url] ?? 0,
        prevClicks: m.previous.clicks,
        prevImpressions: m.previous.impressions,
        clicksChange,
        impressionsChange,
        status: 'performing' as 'performing' | 'attention' | 'underperforming',
      };
    });

  // Compute average metrics to classify performance
  const avgCtr = pagesInCategory.length > 0
    ? pagesInCategory.reduce((s, p) => s + p.ctr, 0) / pagesInCategory.length
    : 0;
  const avgClicks = pagesInCategory.length > 0
    ? pagesInCategory.reduce((s, p) => s + p.clicks, 0) / pagesInCategory.length
    : 0;

  // Classify each page
  pagesInCategory.forEach((p) => {
    const highImpressions = p.impressions > 0;
    const lowCtr = p.ctr < avgCtr * 0.7;
    const declining = p.clicksChange < -10;
    const lowClicks = p.clicks < avgClicks * 0.4;
    const goodCtr = p.ctr >= avgCtr;
    const growing = p.clicksChange > 5;

    if (lowClicks && highImpressions && lowCtr) {
      p.status = 'underperforming';
    } else if (declining || (highImpressions && lowCtr)) {
      p.status = 'attention';
    } else if (goodCtr && growing) {
      p.status = 'performing';
    } else if (lowClicks) {
      p.status = 'underperforming';
    } else {
      p.status = 'performing';
    }
  });

  return pagesInCategory.sort((a, b) => b.clicks - a.clicks);
}

/** Generates actionable insights for a cluster based on page performance */
export function getClusterInsights(clusterPages: ClusterPageDetail[]): ClusterInsight[] {
  const insights: ClusterInsight[] = [];

  const performing = clusterPages.filter((p) => p.status === 'performing');
  const underperforming = clusterPages.filter((p) => p.status === 'underperforming');

  // Top performers
  if (performing.length > 0) {
    const topByClicks = [...performing].sort((a, b) => b.clicks - a.clicks).slice(0, 3);
    insights.push({
      type: 'success',
      title: `${performing.length} page${performing.length > 1 ? 's' : ''} performing well`,
      description: `Strong CTR and growing traffic. "${topByClicks[0].title}" leads with ${topByClicks[0].clicks.toLocaleString()} clicks.`,
      pages: performing.map((p) => p.id),
    });
  }

  // High impressions, low CTR → needs better titles/meta
  const highImpLowCtr = clusterPages.filter((p) => p.impressions > 0 && p.status === 'attention' && p.ctr < 0.05);
  if (highImpLowCtr.length > 0) {
    insights.push({
      type: 'warning',
      title: `${highImpLowCtr.length} page${highImpLowCtr.length > 1 ? 's' : ''} with low CTR despite visibility`,
      description: `These pages get impressions but few clicks. Consider improving meta titles and descriptions to boost CTR.`,
      pages: highImpLowCtr.map((p) => p.id),
    });
  }

  // Declining traffic
  const declining = clusterPages.filter((p) => p.clicksChange < -10);
  if (declining.length > 0) {
    insights.push({
      type: 'warning',
      title: `${declining.length} page${declining.length > 1 ? 's' : ''} with declining traffic`,
      description: `Traffic dropped over ${Math.abs(Math.min(...declining.map((p) => p.clicksChange)))}% vs previous period. Review content freshness and keyword rankings.`,
      pages: declining.map((p) => p.id),
    });
  }

  // Underperforming
  if (underperforming.length > 0) {
    insights.push({
      type: 'danger',
      title: `${underperforming.length} page${underperforming.length > 1 ? 's' : ''} underperforming`,
      description: `Very low click volume compared to cluster average. Consider updating content, improving internal linking, or consolidating with better-performing pages.`,
      pages: underperforming.map((p) => p.id),
    });
  }

  // Pages with traffic but no leads
  const noLeads = clusterPages.filter((p) => p.clicks > 50 && p.leads === 0);
  if (noLeads.length > 0) {
    insights.push({
      type: 'warning',
      title: `${noLeads.length} page${noLeads.length > 1 ? 's' : ''} getting traffic but no leads`,
      description: `These pages drive clicks but haven't converted visitors. Add or improve CTAs and lead capture forms.`,
      pages: noLeads.map((p) => p.id),
    });
  }

  return insights;
}

/** Returns comparison chart data with both series aligned by index for overlay */
export function getComparisonChartData(
  dataKey: string,
  startDate: string,
  endDate: string,
  compareStartDate: string,
  compareEndDate: string,
) {
  const currentData = getChartData(dataKey, startDate, endDate) as DailyTraffic[];
  const previousData = getChartData(dataKey, compareStartDate, compareEndDate) as DailyTraffic[];

  // Align by index — each entry gets both current and previous values
  const maxLen = Math.max(currentData.length, previousData.length);
  const merged = [];

  for (let i = 0; i < maxLen; i++) {
    const cur = currentData[i];
    const prev = previousData[i];
    merged.push({
      date: cur?.date || '',
      clicks: cur?.clicks ?? null,
      impressions: cur?.impressions ?? null,
      prev_clicks: prev?.clicks ?? null,
      prev_impressions: prev?.impressions ?? null,
    });
  }

  return merged;
}

/* ── Content Intelligence ── */

export interface ContentSuggestion {
  title: string;
  targetCategory: string;
  rationale: string;
  estimatedImpact: 'high' | 'medium' | 'low';
  keywords: string[];
}

export interface IndustryContentGap {
  industry: string;
  leadCount: number;
  leadPercentage: number;
  pipelineValue: number;
  conversionRate: number;
  topPages: string[];
  matchingCategories: string[];
  contentCoverage: 'strong' | 'moderate' | 'weak';
  suggestedTopics: ContentSuggestion[];
}

const INDUSTRY_CONTENT_MAP: Record<string, { categories: string[]; coverage: 'strong' | 'moderate' | 'weak' }> = {
  SaaS: { categories: ['SEO', 'Content Marketing', 'Case Studies'], coverage: 'strong' },
  MarTech: { categories: ['Analytics', 'Content Marketing'], coverage: 'strong' },
  FinTech: { categories: ['Case Studies'], coverage: 'moderate' },
  DevTools: { categories: ['Technical SEO', 'AI & Automation'], coverage: 'moderate' },
  Healthcare: { categories: [], coverage: 'weak' },
  'E-Commerce': { categories: [], coverage: 'weak' },
  Cybersecurity: { categories: [], coverage: 'weak' },
  'HR Tech': { categories: [], coverage: 'weak' },
  Consulting: { categories: ['Content Marketing'], coverage: 'moderate' },
  EdTech: { categories: [], coverage: 'weak' },
  'Real Estate': { categories: [], coverage: 'weak' },
};

const INDUSTRY_SUGGESTIONS: Record<string, ContentSuggestion[]> = {
  Healthcare: [
    { title: 'Healthcare Content Marketing Playbook', targetCategory: 'Content Marketing', rationale: 'Healthcare leads represent 10% of visitors but you have zero healthcare-specific content. Major opportunity to create a Healthcare topical cluster.', estimatedImpact: 'high', keywords: ['healthcare marketing', 'HIPAA compliant content', 'health tech SEO', 'patient acquisition'] },
    { title: 'Case Study: How Health Tech Companies Scale Content', targetCategory: 'Case Studies', rationale: 'Healthcare companies converting at high deal sizes ($35K+ avg) but no case study speaks to their vertical.', estimatedImpact: 'high', keywords: ['health tech case study', 'healthcare SaaS growth', 'digital health marketing'] },
  ],
  'E-Commerce': [
    { title: 'E-Commerce SEO: The Complete Guide', targetCategory: 'SEO', rationale: 'E-Commerce visitors are 8% of identified traffic with zero industry-specific content. Product page SEO is a natural content fit.', estimatedImpact: 'high', keywords: ['ecommerce SEO', 'product page optimization', 'shopping search', 'retail content strategy'] },
    { title: 'Content Strategy for D2C and E-Commerce Brands', targetCategory: 'Content Marketing', rationale: 'E-Commerce leads read your content marketing articles — give them an industry-specific version.', estimatedImpact: 'medium', keywords: ['D2C marketing', 'ecommerce content', 'retail content marketing', 'product content'] },
  ],
  Cybersecurity: [
    { title: 'SEO for Cybersecurity Companies', targetCategory: 'SEO', rationale: 'Cybersecurity represents 7% of visitors with high deal values but zero tailored content. Trust-building content is critical in this space.', estimatedImpact: 'high', keywords: ['cybersecurity marketing', 'infosec content', 'security company SEO', 'B2B security'] },
    { title: 'Building Thought Leadership in Cybersecurity', targetCategory: 'Content Marketing', rationale: 'Security companies need trust-focused content marketing — a guide on thought leadership would resonate.', estimatedImpact: 'medium', keywords: ['security thought leadership', 'cybersecurity blog strategy', 'trust content', 'security brand'] },
  ],
  'HR Tech': [
    { title: 'Content Marketing for HR Tech Companies', targetCategory: 'Content Marketing', rationale: 'HR Tech is 5% of visitors. The people/hiring space has unique content challenges around employer branding.', estimatedImpact: 'medium', keywords: ['HR tech marketing', 'recruiting content', 'employer brand SEO', 'talent acquisition content'] },
    { title: 'How HR Tech Companies Generate Leads with Content', targetCategory: 'Case Studies', rationale: 'Create a targeted case study showing how content drives leads in the HR/recruiting vertical.', estimatedImpact: 'medium', keywords: ['HR tech lead gen', 'recruiting marketing', 'HR SaaS growth'] },
  ],
  EdTech: [
    { title: 'SEO Strategy for Education Technology', targetCategory: 'SEO', rationale: 'EdTech visitors are emerging (2.5%) but this fast-growing vertical has no tailored content yet.', estimatedImpact: 'medium', keywords: ['edtech SEO', 'education marketing', 'online learning content', 'LMS marketing'] },
    { title: 'Content Marketing in the Education Sector', targetCategory: 'Content Marketing', rationale: 'Education companies have unique buyer journeys — a dedicated guide would capture this growing segment.', estimatedImpact: 'low', keywords: ['education content strategy', 'edtech blog', 'learning platform marketing'] },
  ],
  'Real Estate': [
    { title: 'Digital Marketing for PropTech Companies', targetCategory: 'Content Marketing', rationale: 'Minimal traffic from Real Estate (1 visitor) but could be a proactive play in this growing B2B vertical.', estimatedImpact: 'low', keywords: ['proptech marketing', 'real estate SaaS', 'property tech content'] },
  ],
};

/* ── Content Production Intelligence ── */

export type ProductionPriority = 'double-down' | 'optimize-first' | 'expand' | 'monitor';

export type AgentStatus = 'in-progress' | 'planned' | 'monitoring' | 'needs-review';

export interface ContentProductionInsight {
  category: string;
  priority: ProductionPriority;
  priorityLabel: string;
  agentStatus: AgentStatus;
  agentStatusLabel: string;
  agentActivity: string;
  headline: string;
  rationale: string;
  keyMetrics: {
    totalClicks: number;
    totalImpressions: number;
    ctr: number;
    avgClicksPerPage: number;
    leads: number;
    convertedLeads: number;
    pageCount: number;
    clusterGrowth: number;
  };
  actions: string[];
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

const PRIORITY_ORDER: Record<ProductionPriority, number> = {
  'double-down': 0,
  'expand': 1,
  'optimize-first': 2,
  'monitor': 3,
};

export function getContentProductionInsights(
  clusters: ClusterSummary[],
  startDate?: string,
  endDate?: string,
): ContentProductionInsight[] {
  // Compute growth for each cluster by averaging clicksChange across pages
  const clusterGrowths: Record<string, number> = {};
  clusters.forEach((c) => {
    const pages = getClusterPages(c.category, startDate, endDate);
    const changes = pages.map((p) => p.clicksChange);
    clusterGrowths[c.category] = changes.length > 0
      ? Math.round(changes.reduce((s, v) => s + v, 0) / changes.length)
      : 0;
  });

  // Compute medians for relative comparison
  const medianClicks = median(clusters.map((c) => c.totalClicks));
  const medianImpressions = median(clusters.map((c) => c.totalImpressions));
  const medianAvgClicksPerPage = median(clusters.map((c) => c.avgClicksPerPage));
  const medianCtr = median(clusters.map((c) => c.ctr));

  return clusters.map((c) => {
    const growth = clusterGrowths[c.category] ?? 0;
    const highVolume = c.totalClicks >= medianClicks;
    const highEfficiency = c.avgClicksPerPage >= medianAvgClicksPerPage;
    const highImpressions = c.totalImpressions >= medianImpressions;
    const lowCtr = c.ctr < medianCtr;
    const hasLeads = c.leads > 0;
    const smallCluster = c.pageCount <= 3;

    let priority: ProductionPriority;
    let priorityLabel: string;
    let agentStatus: AgentStatus;
    let agentStatusLabel: string;
    let agentActivity: string;
    let headline: string;
    let rationale: string;
    let actions: string[];

    if (highVolume && highEfficiency && hasLeads) {
      priority = 'double-down';
      priorityLabel = 'Double Down';
      agentStatus = 'in-progress';
      agentStatusLabel = 'In Progress';
      agentActivity = `Scaling content production across ${c.pageCount} pages`;
      headline = `Scaling ${c.category} — high-volume production underway`;
      rationale = `This cluster drives ${c.totalClicks.toLocaleString()} clicks across ${c.pageCount} pages with ${c.leads} leads. High volume and strong per-page efficiency support automated scaling of content production.`;
      actions = [
        `Creating ${Math.max(2, Math.ceil(c.pageCount * 0.3))} new pages targeting adjacent subtopics`,
        `Planned: Repurpose top-performing pages into video and infographic formats`,
        `Building internal links from new content back to this cluster's top pages`,
      ];
    } else if (highImpressions && (lowCtr || (highVolume && !hasLeads))) {
      priority = 'optimize-first';
      priorityLabel = 'Optimize First';
      agentStatus = 'needs-review';
      agentStatusLabel = 'Needs Review';
      agentActivity = `Auditing titles and CTAs before scaling`;
      const issue = lowCtr
        ? `CTR of ${(c.ctr * 100).toFixed(2)}% is below the median — titles and meta descriptions may need work`
        : `Strong traffic (${c.totalClicks.toLocaleString()} clicks) but zero leads — conversion paths are missing`;
      headline = `Optimizing ${c.category} cluster — auditing titles and CTAs before scaling`;
      rationale = `${issue}. With ${c.totalImpressions.toLocaleString()} impressions, there's clear demand — optimizing existing content before expanding.`;
      actions = lowCtr
        ? [
            `Auditing meta titles and descriptions for lowest-CTR pages`,
            `Planned: A/B test headline variations on top 3 pages`,
            `Adding FAQ schema to capture more SERP real estate`,
          ]
        : [
            `Adding clear CTAs and lead capture forms to high-traffic pages`,
            `Planned: Create a gated resource (checklist, template) specific to ${c.category}`,
            `Setting up retargeting audiences from this cluster's traffic`,
          ];
    } else if (smallCluster && highEfficiency) {
      priority = 'expand';
      priorityLabel = 'Expand';
      agentStatus = 'planned';
      agentStatusLabel = 'Planned';
      agentActivity = `Building out subtopic cluster for ${c.category}`;
      headline = `Expanding ${c.category} coverage — building out subtopic cluster`;
      rationale = `Only ${c.pageCount} page${c.pageCount > 1 ? 's' : ''} but averaging ${c.avgClicksPerPage.toLocaleString()} clicks per page. This cluster punches above its weight and is queued for content expansion.`;
      actions = [
        `Planned: Research 5–10 subtopics in ${c.category} to build out a full content cluster`,
        `Planned: Create a pillar page that links to all pages in this cluster`,
        `Planned: Target long-tail keywords related to existing high-performing pages`,
      ];
    } else {
      priority = 'monitor';
      priorityLabel = 'Monitor';
      agentStatus = 'monitoring';
      agentStatusLabel = 'Monitoring';
      agentActivity = `Passively tracking performance metrics`;
      headline = `Monitoring ${c.category} — no active changes`;
      rationale = `This cluster shows ${c.totalClicks.toLocaleString()} clicks across ${c.pageCount} pages with limited efficiency. Resources allocated to higher-performing clusters; revisiting if metrics improve.`;
      actions = [
        `Consolidating underperforming pages and merging thin content`,
        `Updating existing pages with fresh data and keywords`,
        `Scheduled: 90-day performance review`,
      ];
    }

    return {
      category: c.category,
      priority,
      priorityLabel,
      agentStatus,
      agentStatusLabel,
      agentActivity,
      headline,
      rationale,
      keyMetrics: {
        totalClicks: c.totalClicks,
        totalImpressions: c.totalImpressions,
        ctr: c.ctr,
        avgClicksPerPage: c.avgClicksPerPage,
        leads: c.leads,
        convertedLeads: c.convertedLeads,
        pageCount: c.pageCount,
        clusterGrowth: growth,
      },
      actions,
    };
  }).sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
}

export function getContentIntelligence(): IndustryContentGap[] {
  const totalLeads = leads.length;

  // Group leads by industry
  const byIndustry: Record<string, Lead[]> = {};
  leads.forEach((l) => {
    if (!byIndustry[l.industry]) byIndustry[l.industry] = [];
    byIndustry[l.industry].push(l);
  });

  return Object.entries(byIndustry)
    .map(([industry, industryLeads]) => {
      const converted = industryLeads.filter((l) => l.status === 'converted').length;
      const conversionRate = industryLeads.length > 0 ? converted / industryLeads.length : 0;
      const pipelineValue = industryLeads.reduce((s, l) => s + l.value, 0);

      // Top visited pages
      const pageCounts: Record<string, number> = {};
      industryLeads.forEach((l) => {
        pageCounts[l.sourceUrl] = (pageCounts[l.sourceUrl] || 0) + 1;
      });
      const topPages = Object.entries(pageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([url]) => url);

      const mapping = INDUSTRY_CONTENT_MAP[industry] || { categories: [], coverage: 'weak' as const };

      return {
        industry,
        leadCount: industryLeads.length,
        leadPercentage: Math.round((industryLeads.length / totalLeads) * 100),
        pipelineValue,
        conversionRate,
        topPages,
        matchingCategories: mapping.categories,
        contentCoverage: mapping.coverage,
        suggestedTopics: INDUSTRY_SUGGESTIONS[industry] || [],
      };
    })
    .sort((a, b) => b.leadCount - a.leadCount);
}

/* ── Content Funnel ── */

export interface FunnelClusterBreakdown {
  cluster: string;
  pagesInStage: number;
  clicks: number;
  impressions: number;
  ctaClicks: number;
  leads: number;
  conversionRate: number;
  impressionShare: number;
  clickShare: number;
  ctaClickShare: number;
  ctr: number;
  ctaRate: number;
  leadShare: number;
  priority?: ProductionPriority;
  priorityLabel?: string;
}

export interface FunnelStageData {
  stage: string;
  count: number;
  percentage: number;
  clusterBreakdown: FunnelClusterBreakdown[];
}

const SCALE_FACTOR = 50;

export function getContentFunnelData(startDate?: string, endDate?: string, productionInsights?: ContentProductionInsight[]): FunnelStageData[] {
  // Build priority map from production insights
  const priorityMap: Record<string, { priority: ProductionPriority; label: string }> = {};
  if (productionInsights) {
    productionInsights.forEach((i) => {
      priorityMap[i.category] = { priority: i.priority, label: i.priorityLabel };
    });
  }

  // Count leads per page URL
  const leadsPerUrl: Record<string, number> = {};
  leads.forEach((l) => {
    leadsPerUrl[l.sourceUrl] = (leadsPerUrl[l.sourceUrl] || 0) + 1;
  });

  // Compute metrics for each page (including CTA clicks)
  const pageData = pages.map((p) => {
    const m = getPageMetrics(p.id, startDate, endDate);
    const ctaData = pageCtaClicks[p.id];
    return {
      ...p,
      clicks: m.current.clicks,
      impressions: m.current.impressions,
      ctaClicks: ctaData?.totalCtaClicks ?? 0,
      leads: leadsPerUrl[p.url] ?? 0,
    };
  });

  const totalImpressions = pageData.reduce((s, p) => s + p.impressions, 0) * SCALE_FACTOR;
  const totalClicks = pageData.reduce((s, p) => s + p.clicks, 0) * SCALE_FACTOR;
  const totalCtaClicks = pageData.reduce((s, p) => s + p.ctaClicks, 0) * SCALE_FACTOR;
  const totalLeads = pageData.reduce((s, p) => s + p.leads, 0) * SCALE_FACTOR;

  function buildBreakdown(pagesInStage: typeof pageData): FunnelClusterBreakdown[] {
    const byCluster: Record<string, { count: number; clicks: number; impressions: number; ctaClicks: number; leads: number }> = {};
    pagesInStage.forEach((p) => {
      if (!byCluster[p.category]) byCluster[p.category] = { count: 0, clicks: 0, impressions: 0, ctaClicks: 0, leads: 0 };
      byCluster[p.category].count += 1;
      byCluster[p.category].clicks += p.clicks;
      byCluster[p.category].impressions += p.impressions;
      byCluster[p.category].ctaClicks += p.ctaClicks;
      byCluster[p.category].leads += p.leads;
    });

    const stageTotalImpressions = Object.values(byCluster).reduce((s, d) => s + d.impressions, 0);
    const stageTotalClicks = Object.values(byCluster).reduce((s, d) => s + d.clicks, 0);
    const stageTotalCtaClicks = Object.values(byCluster).reduce((s, d) => s + d.ctaClicks, 0);
    const stageTotalLeads = Object.values(byCluster).reduce((s, d) => s + d.leads, 0);

    return Object.entries(byCluster)
      .map(([cluster, d]) => ({
        cluster,
        pagesInStage: d.count * SCALE_FACTOR,
        clicks: d.clicks * SCALE_FACTOR,
        impressions: d.impressions * SCALE_FACTOR,
        ctaClicks: d.ctaClicks * SCALE_FACTOR,
        leads: d.leads * SCALE_FACTOR,
        conversionRate: d.ctaClicks > 0 ? (d.leads / d.ctaClicks) * 100 : 0,
        impressionShare: stageTotalImpressions > 0 ? Math.round((d.impressions / stageTotalImpressions) * 1000) / 10 : 0,
        clickShare: stageTotalClicks > 0 ? Math.round((d.clicks / stageTotalClicks) * 1000) / 10 : 0,
        ctaClickShare: stageTotalCtaClicks > 0 ? Math.round((d.ctaClicks / stageTotalCtaClicks) * 1000) / 10 : 0,
        ctr: d.impressions > 0 ? Math.round((d.clicks / d.impressions) * 10000) / 100 : 0,
        ctaRate: d.clicks > 0 ? Math.round((d.ctaClicks / d.clicks) * 10000) / 100 : 0,
        leadShare: stageTotalLeads > 0 ? Math.round((d.leads / stageTotalLeads) * 1000) / 10 : 0,
        priority: priorityMap[cluster]?.priority,
        priorityLabel: priorityMap[cluster]?.label,
      }))
      .sort((a, b) => b.clicks - a.clicks);
  }

  const withImpressions = pageData.filter((p) => p.impressions > 0);
  const withClicks = pageData.filter((p) => p.clicks > 0);
  const withCtaClicks = pageData.filter((p) => p.ctaClicks > 0);
  const withLeads = pageData.filter((p) => p.leads > 0);

  return [
    { stage: 'Impressions', count: totalImpressions, percentage: 100, clusterBreakdown: buildBreakdown(withImpressions) },
    { stage: 'Clicks', count: totalClicks, percentage: totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 1000) / 10 : 0, clusterBreakdown: buildBreakdown(withClicks) },
    { stage: 'CTA Clicks', count: totalCtaClicks, percentage: totalClicks > 0 ? Math.round((totalCtaClicks / totalClicks) * 1000) / 10 : 0, clusterBreakdown: buildBreakdown(withCtaClicks) },
    { stage: 'Captured Leads', count: totalLeads, percentage: totalCtaClicks > 0 ? Math.round((totalLeads / totalCtaClicks) * 10000) / 100 : 0, clusterBreakdown: buildBreakdown(withLeads) },
  ];
}

/* ── Top Movers ── */

export interface TopMover {
  id: string;
  title: string;
  url: string;
  category: string;
  clicks: number;
  clicksChange: number;
}

export function getTopMovers(startDate?: string, endDate?: string): { rising: TopMover[]; falling: TopMover[] } {
  const categories = Array.from(new Set(pages.map((p) => p.category)));
  const allPages: TopMover[] = [];

  categories.forEach((cat) => {
    const clusterPagesData = getClusterPages(cat, startDate, endDate);
    clusterPagesData.forEach((p) => {
      allPages.push({
        id: p.id,
        title: p.title,
        url: p.url,
        category: cat,
        clicks: p.clicks,
        clicksChange: p.clicksChange,
      });
    });
  });

  const sorted = [...allPages].sort((a, b) => b.clicksChange - a.clicksChange);

  return {
    rising: sorted.filter((p) => p.clicksChange > 0).slice(0, 5),
    falling: sorted.filter((p) => p.clicksChange < 0).sort((a, b) => a.clicksChange - b.clicksChange).slice(0, 5),
  };
}

/* ── Content Freshness ── */

export interface ContentFreshnessEntry {
  bucket: string;
  pageCount: number;
  totalClicks: number;
  totalImpressions: number;
  clicksPercentage: number;
}

export function getContentFreshnessData(startDate?: string, endDate?: string): ContentFreshnessEntry[] {
  const now = new Date();
  const buckets: Record<string, { pageCount: number; totalClicks: number; totalImpressions: number }> = {
    '< 1 month': { pageCount: 0, totalClicks: 0, totalImpressions: 0 },
    '1–3 months': { pageCount: 0, totalClicks: 0, totalImpressions: 0 },
    '3–6 months': { pageCount: 0, totalClicks: 0, totalImpressions: 0 },
    '6+ months': { pageCount: 0, totalClicks: 0, totalImpressions: 0 },
  };

  pages.forEach((p) => {
    const m = getPageMetrics(p.id, startDate, endDate);
    const pub = new Date(p.publishDate);
    const monthsOld = (now.getFullYear() - pub.getFullYear()) * 12 + (now.getMonth() - pub.getMonth());

    let bucket: string;
    if (monthsOld < 1) bucket = '< 1 month';
    else if (monthsOld < 3) bucket = '1–3 months';
    else if (monthsOld < 6) bucket = '3–6 months';
    else bucket = '6+ months';

    buckets[bucket].pageCount += 1;
    buckets[bucket].totalClicks += m.current.clicks;
    buckets[bucket].totalImpressions += m.current.impressions;
  });

  const totalClicks = Object.values(buckets).reduce((s, b) => s + b.totalClicks, 0);

  return Object.entries(buckets).map(([bucket, data]) => ({
    bucket,
    ...data,
    clicksPercentage: totalClicks > 0 ? Math.round((data.totalClicks / totalClicks) * 1000) / 10 : 0,
  }));
}
