'use client';

import { useState, useCallback } from 'react';
import { Message, MessageAction } from '@/types';
import { getMetricValue, getChartData, getClusterData, getContentFunnelData, getContentIntelligence, getTopMovers, getAllPagesOverview, getContentFreshnessData } from '@/data/chart-data';
import { getAIMetrics, aiPageCitations, aiCompetitors } from '@/data/ai-analytics';
import { leads } from '@/data/leads';
import { getCtaMetrics } from '@/data/cta-clicks';
import { getLatestReport } from '@/data/reports';

interface MockResponse {
  content: string;
  actions?: MessageAction[];
}

interface Subagent {
  match: RegExp;
  handler: (input: string) => MockResponse;
}

// ── Helpers ──

const fmt = (n: number) => n.toLocaleString();
const fmtUsd = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;
const changeStr = (n: number | null) => n == null ? '' : n >= 0 ? ` (+${n}%)` : ` (${n}%)`;

// ── Cluster creation (preserved) ──

const INDUSTRY_CLUSTER_PROPOSALS: Record<string, { name: string; description: string }> = {
  Healthcare: { name: 'AI SEO for Healthcare Brands', description: 'Help healthcare companies improve organic visibility with AI-driven content strategies, covering patient acquisition, HIPAA-compliant marketing, and medical content optimization.' },
  'E-Commerce': { name: 'AI-Powered E-Commerce Growth', description: 'Drive online store traffic through AI content optimization, product page SEO, and conversion-focused content strategies for e-commerce brands.' },
  Cybersecurity: { name: 'Content Marketing for Cybersecurity', description: 'Build thought leadership and generate leads for cybersecurity companies through technical content, threat landscape guides, and compliance-focused articles.' },
  'HR Tech': { name: 'SEO Strategy for HR Tech Platforms', description: 'Attract HR decision-makers with content covering talent acquisition technology, employee experience, and workforce analytics.' },
  FinTech: { name: 'AI Content for FinTech Companies', description: 'Generate qualified leads for FinTech products with content on digital payments, compliance automation, and financial AI solutions.' },
  DevTools: { name: 'Developer-Focused Content Strategy', description: 'Reach engineering teams with technical content on developer tools, API documentation best practices, and DevOps workflows.' },
};

let pendingCluster: { industry: string; name: string; description: string } | null = null;

function getClusterProposal(input: string): { industry: string; name: string; description: string } {
  const match = input.match(/create a (.+?) topical cluster/i);
  const industry = match ? match[1] : 'Healthcare';
  const proposal = INDUSTRY_CLUSTER_PROPOSALS[industry] || {
    name: `AI SEO for ${industry} Brands`,
    description: `Drive organic growth for ${industry} companies with AI-powered content strategies, industry-specific guides, and conversion-focused content.`,
  };
  return { industry, name: proposal.name, description: proposal.description };
}

// ── Subagent handlers ──

// --- Traffic ---

function handleTrafficOverview(): MockResponse {
  const clicks = getMetricValue('totalClicks');
  const impressions = getMetricValue('totalImpressions');
  const ctr = getMetricValue('avgCtr');
  return {
    content: `**Traffic Overview** (last 30 days)\n\n| Metric | Value | Change |\n|---|---|---|\n| Clicks | ${clicks.value} | ${changeStr(clicks.change)} |\n| Impressions | ${impressions.value} | ${changeStr(impressions.change)} |\n| Avg. CTR | ${ctr.value} | ${changeStr(ctr.change)} |\n\nOverall traffic is trending upward — your content strategy is gaining momentum.`,
    actions: [
      { label: 'View top pages', message: '/traffic top-pages' },
      { label: 'View top movers', message: '/traffic movers' },
    ],
  };
}

function handleTrafficTopPages(): MockResponse {
  const topPages = getChartData('topPages') as { name: string; clicks: number; impressions: number }[];
  const top5 = topPages.slice(0, 5);
  const rows = top5.map((p, i) => `${i + 1}. **${p.name}** — ${fmt(p.clicks)} clicks (${fmt(p.impressions)} impr.)`).join('\n');
  return {
    content: `**Top 5 Pages by Clicks**\n\n${rows}`,
    actions: [
      { label: 'View traffic overview', message: '/traffic overview' },
      { label: 'View top movers', message: '/traffic movers' },
    ],
  };
}

function handleTrafficMovers(): MockResponse {
  const { rising, falling } = getTopMovers();
  const risingRows = rising.slice(0, 3).map((p, i) => `${i + 1}. **${p.title}** — ${fmt(p.clicks)} clicks (+${p.clicksChange}%)`).join('\n');
  const fallingRows = falling.slice(0, 3).map((p, i) => `${i + 1}. **${p.title}** — ${fmt(p.clicks)} clicks (${p.clicksChange}%)`).join('\n');
  return {
    content: `**Top Movers** (last 30 days)\n\n📈 **Rising**\n${risingRows}\n\n📉 **Falling**\n${fallingRows}`,
    actions: [
      { label: 'View top pages', message: '/traffic top-pages' },
      { label: 'View traffic overview', message: '/traffic overview' },
    ],
  };
}

function handleTrafficGeo(): MockResponse {
  // Mock geographic data — prototype only
  const geoData = [
    { country: 'United States', sessions: 12480 },
    { country: 'United Kingdom', sessions: 3210 },
    { country: 'Canada', sessions: 2140 },
    { country: 'Germany', sessions: 1560 },
    { country: 'Australia', sessions: 1120 },
  ];
  const rows = geoData.map((g, i) => `${i + 1}. **${g.country}** — ${fmt(g.sessions)} sessions`).join('\n');
  return {
    content: `**Traffic by Country** (top 5)\n\n${rows}\n\nThe US drives ${Math.round((geoData[0].sessions / geoData.reduce((s, g) => s + g.sessions, 0)) * 100)}% of total sessions.`,
    actions: [
      { label: 'View traffic overview', message: '/traffic overview' },
    ],
  };
}

function handleTrafficCta(): MockResponse {
  const ctaMetrics = getCtaMetrics();
  const ctaRate = getMetricValue('ctaClickRate');
  const top3 = ctaMetrics.topLandingPages.slice(0, 3);
  const rows = top3.map((lp, i) => `${i + 1}. **${lp.title}** — ${fmt(lp.clicks)} CTA clicks (${Math.round(lp.share * 100)}% share)`).join('\n');
  return {
    content: `**CTA Performance**\n\n- **CTA Click Rate:** ${ctaRate.value}${changeStr(ctaRate.change)}\n- **Total CTA Clicks:** ${fmt(ctaMetrics.totalCtaClicks)}${changeStr(ctaMetrics.ctaClicksChange)}\n\n**Top Landing Pages:**\n${rows}`,
    actions: [
      { label: 'View content funnel', message: '/topics funnel' },
    ],
  };
}

// --- Leads ---

function handleLeadsPipeline(): MockResponse {
  const statusData = getChartData('leadsByStatus') as { name: string; value: number }[];
  const pipelineVal = getMetricValue('totalPipelineValue');
  const rows = statusData.map((s) => `- **${s.name}:** ${s.value} leads`).join('\n');
  return {
    content: `**Lead Pipeline**\n\n${rows}\n\n**Total pipeline value:** ${pipelineVal.value}${changeStr(pipelineVal.change)}`,
    actions: [
      { label: 'View by industry', message: '/leads by-industry' },
      { label: 'View recent leads', message: '/leads recent' },
    ],
  };
}

function handleLeadsByIndustry(): MockResponse {
  const industryData = getChartData('leadsByIndustry') as { name: string; value: number }[];
  const rows = industryData.map((d, i) => `${i + 1}. **${d.name}** — ${d.value} visitors`).join('\n');
  return {
    content: `**Leads by Industry**\n\n${rows}`,
    actions: [
      { label: 'View pipeline value', message: '/leads value' },
      { label: 'View lead pipeline', message: '/leads pipeline' },
    ],
  };
}

function handleLeadsValue(): MockResponse {
  const pipelineVal = getMetricValue('totalPipelineValue');
  const industryValues = getChartData('industryByValue') as { name: string; value: number }[];
  const top3 = industryValues.slice(0, 3);
  const rows = top3.map((d, i) => `${i + 1}. **${d.name}** — ${fmtUsd(d.value)}`).join('\n');
  return {
    content: `**Pipeline Value**\n\n**Total:** ${pipelineVal.value}${changeStr(pipelineVal.change)}\n\n**Top industries by $:**\n${rows}`,
    actions: [
      { label: 'View lead pipeline', message: '/leads pipeline' },
      { label: 'View ROAS', message: '/summary' },
    ],
  };
}

function handleLeadsRecent(): MockResponse {
  const recentLeads = [...leads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const rows = recentLeads.map((l, i) => `${i + 1}. **${l.name}** (${l.company}) — ${fmtUsd(l.value)} — _${l.status}_`).join('\n');
  return {
    content: `**Recent Leads** (last 5)\n\n${rows}`,
    actions: [
      { label: 'View lead pipeline', message: '/leads pipeline' },
      { label: 'View qualified leads', message: '/leads qualified' },
    ],
  };
}

function handleLeadsQualified(): MockResponse {
  const qualifiedLeads = leads.filter((l) => l.status === 'qualified' || l.status === 'converted');
  const qualified = qualifiedLeads.filter((l) => l.status === 'qualified');
  const converted = qualifiedLeads.filter((l) => l.status === 'converted');
  const topQualified = qualifiedLeads.sort((a, b) => b.value - a.value).slice(0, 5);
  const rows = topQualified.map((l, i) => `${i + 1}. **${l.name}** (${l.company}) — ${fmtUsd(l.value)} — _${l.status}_`).join('\n');
  return {
    content: `**Qualified & Converted Leads**\n\n- **Qualified:** ${qualified.length}\n- **Converted:** ${converted.length}\n- **Total:** ${qualifiedLeads.length}\n\n**Top by value:**\n${rows}`,
    actions: [
      { label: 'View pipeline value', message: '/leads value' },
      { label: 'View lead pipeline', message: '/leads pipeline' },
    ],
  };
}

// --- AI Analytics ---

function handleAIVisibility(): MockResponse {
  const visibility = getMetricValue('aiVisibilityScore');
  const citations = getMetricValue('aiCitations');
  const appearances = getMetricValue('aiAppearances');
  const sentiment = getMetricValue('aiSentiment');
  return {
    content: `**AI Visibility Overview**\n\n| Metric | Value | Change |\n|---|---|---|\n| Visibility Score | ${visibility.value} | ${changeStr(visibility.change)} |\n| Citations | ${citations.value} | ${changeStr(citations.change)} |\n| Appearances | ${appearances.value} | ${changeStr(appearances.change)} |\n| Sentiment | ${sentiment.value} | ${changeStr(sentiment.change)} |\n\nYour brand is increasingly referenced across AI engines, with strong positive sentiment.`,
    actions: [
      { label: 'View by engine', message: '/ai engines' },
      { label: 'View competitors', message: '/ai competitors' },
    ],
  };
}

function handleAIEngines(): MockResponse {
  const aiMetrics = getAIMetrics();
  const rows = aiMetrics.engineBreakdown.map((e) => `- **${e.name}:** ${fmt(e.value)} citations`).join('\n');
  return {
    content: `**AI Citations by Engine**\n\n${rows}\n\n**Total citations:** ${fmt(aiMetrics.totalCitations)}${changeStr(aiMetrics.citationsChange)}`,
    actions: [
      { label: 'View AI visibility', message: '/ai visibility' },
      { label: 'View most cited pages', message: '/ai pages' },
    ],
  };
}

function handleAICompetitors(): MockResponse {
  const sorted = [...aiCompetitors].sort((a, b) => b.visibility - a.visibility);
  const rows = sorted.map((c, i) => `${i + 1}. **${c.name}** — Visibility: ${c.visibility}% | Share of Voice: ${c.shareOfVoice}% | Sentiment: ${c.sentiment}/100`).join('\n');
  return {
    content: `**Competitor AI Visibility**\n\n${rows}`,
    actions: [
      { label: 'View AI visibility', message: '/ai visibility' },
      { label: 'View by engine', message: '/ai engines' },
    ],
  };
}

function handleAIPages(): MockResponse {
  const sorted = [...aiPageCitations].sort((a, b) => b.totalCitations - a.totalCitations).slice(0, 5);
  const rows = sorted.map((p, i) => `${i + 1}. **${p.title}** — ${fmt(p.totalCitations)} citations (sentiment: ${p.sentiment}/100)${changeStr(p.change)}`).join('\n');
  return {
    content: `**Most Cited Pages in AI Responses**\n\n${rows}`,
    actions: [
      { label: 'View AI visibility', message: '/ai visibility' },
      { label: 'View by engine', message: '/ai engines' },
    ],
  };
}

// --- Topics & Clusters ---

function handleTopicsClusters(): MockResponse {
  const clusters = getClusterData();
  const rows = clusters.map((c, i) => `${i + 1}. **${c.category}** — ${fmt(c.totalClicks)} clicks | ${c.pageCount} pages | ${c.leads} leads | CTR ${fmtPct(c.ctr)}`).join('\n');
  return {
    content: `**Cluster Performance**\n\n${rows}`,
    actions: [
      { label: 'View content funnel', message: '/topics funnel' },
      { label: 'View content gaps', message: '/topics gaps' },
    ],
  };
}

function handleTopicsFunnel(): MockResponse {
  const funnel = getContentFunnelData();
  const rows = funnel.map((stage) => `- **${stage.stage}:** ${fmt(stage.count)} (${stage.percentage}%)`).join('\n');
  const clickRate = funnel[1]?.percentage ?? 0;
  const ctaRate = funnel[2]?.percentage ?? 0;
  const leadRate = funnel[3]?.percentage ?? 0;
  return {
    content: `**Content Funnel**\n\n${rows}\n\n**Conversion rates:** Impressions→Clicks: ${clickRate}% | Clicks→CTA: ${ctaRate}% | CTA→Leads: ${leadRate}%`,
    actions: [
      { label: 'View cluster performance', message: '/topics clusters' },
      { label: 'View CTA performance', message: '/traffic cta' },
    ],
  };
}

function handleTopicsGaps(): MockResponse {
  const intelligence = getContentIntelligence();
  const weak = intelligence.filter((g) => g.contentCoverage === 'weak');
  const rows = weak.map((g) => {
    const suggestion = g.suggestedTopics.length > 0 ? ` → Suggestion: _${g.suggestedTopics[0].title}_` : '';
    return `- **${g.industry}** — ${g.leadCount} leads, ${fmtUsd(g.pipelineValue)} pipeline, no dedicated content${suggestion}`;
  }).join('\n');
  return {
    content: `**Content Gaps** (${weak.length} industries with weak coverage)\n\n${rows}\n\nThese industries generate leads but lack tailored content. Creating dedicated clusters could boost conversions.`,
    actions: weak.slice(0, 2).map((g) => ({
      label: `Create ${g.industry} cluster`,
      message: `I'm planning to create a ${g.industry} topical cluster`,
    })),
  };
}

// --- Content Performance ---

function handleContentCategories(): MockResponse {
  const catPerf = getChartData('categoryPerformance') as { name: string; clicks: number; avgClicks: number }[];
  const rows = catPerf.map((c, i) => `${i + 1}. **${c.name}** — Avg. ${fmt(c.avgClicks)} clicks/article (${fmt(c.clicks)} total)`).join('\n');
  return {
    content: `**Category Performance** (avg. clicks per article)\n\n${rows}`,
    actions: [
      { label: 'View content freshness', message: '/content freshness' },
      { label: 'View underperforming', message: '/content underperforming' },
    ],
  };
}

function handleContentFreshness(): MockResponse {
  const freshness = getContentFreshnessData();
  const rows = freshness.map((f) => `- **${f.bucket}:** ${f.pageCount} pages — ${fmt(f.totalClicks)} clicks (${f.clicksPercentage}% of traffic)`).join('\n');
  return {
    content: `**Content Freshness**\n\n${rows}`,
    actions: [
      { label: 'View category performance', message: '/content categories' },
      { label: 'View underperforming', message: '/content underperforming' },
    ],
  };
}

function handleContentUnderperforming(): MockResponse {
  const allPages = getAllPagesOverview();
  const underperforming = allPages
    .filter((p) => p.impressions > 500 && p.ctr < 0.03)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 5);
  if (underperforming.length === 0) {
    return { content: '**Underperforming Pages**\n\nNo pages with high impressions and low CTR found. Your content is performing well across the board.' };
  }
  const rows = underperforming.map((p, i) => `${i + 1}. **${p.title}** — ${fmt(p.impressions)} impr. | ${fmt(p.clicks)} clicks | CTR ${fmtPct(p.ctr)}`).join('\n');
  return {
    content: `**Underperforming Pages** (high impressions, low CTR)\n\n${rows}\n\nThese pages get visibility but few clicks. Improving titles and meta descriptions could unlock more traffic.`,
    actions: [
      { label: 'View content freshness', message: '/content freshness' },
      { label: 'View category performance', message: '/content categories' },
    ],
  };
}

// --- Summary & Compare ---

function handleSummary(): MockResponse {
  const pipelineVal = getMetricValue('totalPipelineValue');
  const clicks = getMetricValue('totalClicks');
  const captured = getMetricValue('organicLeadsCaptured');
  const contentSpend = 3500;
  const pipelineRaw = leads.reduce((s, l) => s + l.value, 0);
  const convertedArr = leads.filter((l) => l.status === 'converted').reduce((s, l) => s + l.value, 0);
  const roas = Math.round(pipelineRaw / contentSpend);
  const costPerLead = Math.round(contentSpend / parseInt(captured.value));
  return {
    content: `**Content ROAS Summary**\n\n| Metric | Value |\n|---|---|\n| Monthly Content Spend | ${fmtUsd(contentSpend)} |\n| Pipeline Generated | ${pipelineVal.value} |\n| Converted ARR | ${fmtUsd(convertedArr)} |\n| ROAS | ${roas}x |\n| Cost per Lead | ${fmtUsd(costPerLead)} |\n| Total Clicks | ${clicks.value} |\n| Leads Captured | ${captured.value} |\n\nYour content investment delivers a **${roas}x return** — significantly outperforming paid channels.`,
    actions: [
      { label: 'View lead pipeline', message: '/leads pipeline' },
      { label: 'View traffic overview', message: '/traffic overview' },
    ],
  };
}

function handleCompare(): MockResponse {
  const clicks = getMetricValue('totalClicks');
  const impressions = getMetricValue('totalImpressions');
  const ctr = getMetricValue('avgCtr');
  const aiCitations = getMetricValue('aiCitations');
  const pipelineVal = getMetricValue('totalPipelineValue');
  return {
    content: `**Period Comparison** (current vs. previous 30 days)\n\n| Metric | Current | Previous | Change |\n|---|---|---|---|\n| Clicks | ${clicks.value} | ${clicks.previousValue ?? '—'} | ${changeStr(clicks.change)} |\n| Impressions | ${impressions.value} | ${impressions.previousValue ?? '—'} | ${changeStr(impressions.change)} |\n| CTR | ${ctr.value} | ${ctr.previousValue ?? '—'} | ${changeStr(ctr.change)} |\n| AI Citations | ${aiCitations.value} | ${aiCitations.previousValue ?? '—'} | ${changeStr(aiCitations.change)} |\n| Pipeline | ${pipelineVal.value} | ${pipelineVal.previousValue ?? '—'} | ${changeStr(pipelineVal.change)} |`,
    actions: [
      { label: 'View traffic overview', message: '/traffic overview' },
      { label: 'View ROAS', message: '/summary' },
    ],
  };
}

function handleReport(): MockResponse {
  const report = getLatestReport();
  const summary = report.narrative.executiveSummary.split('\n\n')[0];
  return {
    content: `**${report.title}**\n\n${summary}\n\n**Key metrics:** ${report.snapshot.totalClicks.toLocaleString()} clicks (${report.comparison.clicks >= 0 ? '+' : ''}${report.comparison.clicks}%) | ${report.snapshot.capturedLeads} leads (${report.comparison.leads >= 0 ? '+' : ''}${report.comparison.leads}%) | ${fmtUsd(report.snapshot.pipelineValue)} pipeline`,
    actions: [
      { label: 'View full report', message: 'Navigate to Reports tab' },
      { label: 'View recommendations', message: '/report recommendations' },
    ],
  };
}

function handleReportRecommendations(): MockResponse {
  const report = getLatestReport();
  const recs = report.narrative.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n');
  return {
    content: `**Strategic Recommendations** (${report.periodLabel})\n\n${recs}`,
    actions: [
      { label: 'View full report', message: 'Navigate to Reports tab' },
      { label: 'View report summary', message: '/report' },
    ],
  };
}

function handleHelp(): MockResponse {
  return {
    content: `**Available Commands**\n\n**Traffic**\n- \`/traffic overview\` — Clicks, impressions, CTR summary\n- \`/traffic top-pages\` — Top pages by clicks\n- \`/traffic movers\` — Rising & falling pages\n- \`/traffic geo\` — Traffic by country\n- \`/traffic cta\` — CTA click performance\n\n**Leads**\n- \`/leads pipeline\` — Lead status breakdown\n- \`/leads by-industry\` — Leads by industry\n- \`/leads value\` — Pipeline value by industry\n- \`/leads recent\` — Last 5 captured leads\n- \`/leads qualified\` — Qualified & converted leads\n\n**AI Analytics**\n- \`/ai visibility\` — AI visibility score & metrics\n- \`/ai engines\` — Citations by AI engine\n- \`/ai competitors\` — Competitor AI visibility\n- \`/ai pages\` — Most cited pages\n\n**Topics & Clusters**\n- \`/topics clusters\` — Cluster performance\n- \`/topics funnel\` — Content funnel analysis\n- \`/topics gaps\` — Content coverage gaps\n- \`/topics create [industry]\` — Create a new cluster\n\n**Content**\n- \`/content categories\` — Category performance\n- \`/content freshness\` — Content age vs. traffic\n- \`/content underperforming\` — Pages needing attention\n\n**Reports**\n- \`/report\` — Latest monthly report summary\n- \`/report recommendations\` — Strategic recommendations\n\n**Other**\n- \`/summary\` — ROAS & ROI overview\n- \`/compare\` — Period-over-period comparison\n\nYou can also ask in plain English, e.g. "show me leads by industry" or "what are my top pages?"`,
  };
}

// ── Subagent registry (first match wins) ──

const subagents: Subagent[] = [
  // --- Cluster creation flows (highest priority, preserved) ---
  {
    match: /(confirm.*topic|looks good)/i,
    handler: () => {
      const cluster = pendingCluster;
      pendingCluster = null;
      if (cluster) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('cluster-created', {
            detail: { industry: cluster.industry, name: cluster.name, description: cluster.description },
          }));
        }, 500);
        return {
          content: `Done! I've created the "${cluster.name}" topical cluster. You'll see it in your Topics view now.\n\nI'm starting content production — the first articles will be drafted shortly.`,
        };
      }
      return { content: 'No pending cluster to confirm. Try creating one first with `/topics gaps`.' };
    },
  },
  {
    match: /i'm planning to create.*cluster/i,
    handler: (input) => {
      const proposal = getClusterProposal(input);
      pendingCluster = proposal;
      return {
        content: `I'll create a new topical cluster for the ${proposal.industry} industry:\n\n**${proposal.name}**\n${proposal.description}\n\nWould you like to go with this topic, or do you have any changes in mind?`,
        actions: [
          { label: 'Confirm topic', message: 'Confirm topic — let\'s create this cluster.' },
        ],
      };
    },
  },

  // --- /traffic ---
  { match: /\/traffic\s+overview|show\s+traffic\s+overview/i, handler: handleTrafficOverview },
  { match: /\/traffic\s+top-?pages|what are my top pages|top\s+performing\s+pages/i, handler: handleTrafficTopPages },
  { match: /\/traffic\s+movers|show\s+top\s+movers|top\s+movers/i, handler: handleTrafficMovers },
  { match: /\/traffic\s+geo|traffic\s+by\s+country|show\s+geographic|by\s+country/i, handler: handleTrafficGeo },
  { match: /\/traffic\s+cta|show\s+cta\s+performance|cta\s+performance/i, handler: handleTrafficCta },

  // --- /leads ---
  { match: /\/leads\s+pipeline|show\s+lead\s+pipeline|lead\s+pipeline/i, handler: handleLeadsPipeline },
  { match: /\/leads\s+by-?industry|leads?\s+by\s+industry/i, handler: handleLeadsByIndustry },
  { match: /\/leads\s+value|show\s+pipeline\s+value|pipeline\s+value/i, handler: handleLeadsValue },
  { match: /\/leads\s+recent|show\s+recent\s+leads|recent\s+leads|latest\s+leads/i, handler: handleLeadsRecent },
  { match: /\/leads\s+qualified|show\s+qualified\s+leads|qualified\s+leads/i, handler: handleLeadsQualified },

  // --- /ai ---
  { match: /\/ai\s+visibility|show\s+ai\s+visibility|ai\s+visibility/i, handler: handleAIVisibility },
  { match: /\/ai\s+engines?|ai\s+citations?\s+by\s+engine|citations?\s+by\s+engine/i, handler: handleAIEngines },
  { match: /\/ai\s+competitors?|show\s+ai\s+competitors?|ai\s+competitors?/i, handler: handleAICompetitors },
  { match: /\/ai\s+pages?|most\s+cited\s+pages|show\s+cited\s+pages|ai\s+cited/i, handler: handleAIPages },

  // --- /topics ---
  { match: /\/topics\s+clusters?|show\s+cluster\s+performance|cluster\s+performance/i, handler: handleTopicsClusters },
  { match: /\/topics\s+funnel|show\s+content\s+funnel|content\s+funnel/i, handler: handleTopicsFunnel },
  { match: /\/topics\s+gaps?|show\s+content\s+gaps?|content\s+gaps?/i, handler: handleTopicsGaps },
  {
    match: /\/topics\s+create\s+(.+)/i,
    handler: (input) => {
      const nameMatch = input.match(/\/topics\s+create\s+(.+)/i);
      const industry = nameMatch ? nameMatch[1].trim() : 'Healthcare';
      const fakeInput = `I'm planning to create a ${industry} topical cluster`;
      const proposal = getClusterProposal(fakeInput);
      pendingCluster = proposal;
      return {
        content: `I'll create a new topical cluster for the ${proposal.industry} industry:\n\n**${proposal.name}**\n${proposal.description}\n\nWould you like to go with this topic, or do you have any changes in mind?`,
        actions: [
          { label: 'Confirm topic', message: 'Confirm topic — let\'s create this cluster.' },
        ],
      };
    },
  },

  // --- /content ---
  { match: /\/content\s+categor|show\s+category\s+performance|category\s+performance/i, handler: handleContentCategories },
  { match: /\/content\s+freshness|show\s+content\s+freshness|content\s+freshness|content\s+age/i, handler: handleContentFreshness },
  { match: /\/content\s+underperform|show\s+underperforming|underperforming\s+pages/i, handler: handleContentUnderperforming },

  // --- /report ---
  { match: /\/report\s+recommend|report\s+recommend/i, handler: handleReportRecommendations },
  { match: /\/report|latest\s+report|monthly\s+report|show\s+report/i, handler: handleReport },

  // --- /summary, /compare, /help ---
  { match: /\/summary|show\s+roas|show\s+roi|content\s+roi|content\s+roas/i, handler: handleSummary },
  { match: /\/compare|compare\s+periods?/i, handler: handleCompare },
  { match: /\/help|^help$|what can you do|what commands/i, handler: handleHelp },

  // --- Broad fallback matchers for natural language ---
  { match: /report/i, handler: handleReport },
  { match: /traffic.*(overview|trend|show|summary)/i, handler: handleTrafficOverview },
  { match: /top.*(page|article|content)/i, handler: handleTrafficTopPages },
  { match: /lead.*(status|breakdown|how many|pipeline)/i, handler: handleLeadsPipeline },
  { match: /(roi|return|revenue)/i, handler: handleSummary },
  { match: /categor.*(perform|best)/i, handler: handleContentCategories },
  { match: /lead.*(table|list|all|recent)/i, handler: handleLeadsRecent },
  { match: /traffic/i, handler: handleTrafficOverview },
  { match: /lead/i, handler: handleLeadsPipeline },
  { match: /ai\b/i, handler: handleAIVisibility },
  { match: /cluster|topic/i, handler: handleTopicsClusters },
  { match: /content/i, handler: handleContentCategories },
];

// ── Main router ──

function generateMockResponse(input: string): MockResponse {
  // Special case: only match cluster confirm if there's a pending cluster
  if (pendingCluster && /(confirm.*topic|looks good)/i.test(input)) {
    return subagents[0].handler(input);
  }

  // Skip the confirm subagent (index 0) during normal routing — it's handled above
  for (let i = 1; i < subagents.length; i++) {
    if (subagents[i].match.test(input)) {
      return subagents[i].handler(input);
    }
  }

  return handleHelp();
}

// ── Hook ──

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(
    (content: string) => {
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);

      setIsTyping(true);
      setTimeout(() => {
        const response = generateMockResponse(content);
        const aiMessage: Message = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: response.content,
          timestamp: new Date().toISOString(),
          actions: response.actions,
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1200);
    },
    []
  );

  return {
    messages,
    isTyping,
    sendMessage,
  };
}
