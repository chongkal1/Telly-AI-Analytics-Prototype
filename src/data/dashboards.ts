import { Dashboard } from '@/types';

export const dashboards: Dashboard[] = [
  {
    id: 'd1',
    name: 'Traffic',
    widgets: [
      // Organic traffic metrics
      { id: 'w1', title: 'Articles Published', type: 'metric', colSpan: 2, rowSpan: 1, dataKey: 'totalArticles' },
      { id: 'w2', title: 'Total Content Pieces', type: 'metric', colSpan: 2, rowSpan: 1, dataKey: 'totalContentPieces' },
      { id: 'w3', title: 'Total Organic Clicks', type: 'metric', colSpan: 2, rowSpan: 1, dataKey: 'totalClicks' },
      { id: 'w4', title: 'Total Impressions', type: 'metric', colSpan: 2, rowSpan: 1, dataKey: 'totalImpressions' },
      { id: 'w5', title: 'Avg. CTR', type: 'metric', colSpan: 2, rowSpan: 1, dataKey: 'avgCtr' },
      { id: 'w6', title: 'Leads Generated', type: 'metric', colSpan: 2, rowSpan: 1, dataKey: 'leadsGenerated' },
      { id: 'w7', title: 'Organic Traffic Trend', type: 'line', colSpan: 12, rowSpan: 2, dataKey: 'dailyTraffic' },

      // AI Analytics section header
      { id: 'w29', title: 'AI Analytics', type: 'section', colSpan: 12, rowSpan: 1, dataKey: '' },
      { id: 'w30', title: 'AI Visibility Score', type: 'metric', colSpan: 2, rowSpan: 1, dataKey: 'aiVisibilityScore' },
      { id: 'w31', title: 'AI Citations', type: 'metric', colSpan: 2, rowSpan: 1, dataKey: 'aiCitations' },
      { id: 'w32', title: 'AI Appearances', type: 'metric', colSpan: 2, rowSpan: 1, dataKey: 'aiAppearances' },
      { id: 'w33', title: 'AI Share of Voice', type: 'metric', colSpan: 2, rowSpan: 1, dataKey: 'aiShareOfVoice' },
      { id: 'w34', title: 'AI Sentiment', type: 'metric', colSpan: 4, rowSpan: 1, dataKey: 'aiSentiment' },
      { id: 'w36', title: 'AI Citations Trend', type: 'line', colSpan: 8, rowSpan: 2, dataKey: 'dailyAITraffic' },
      { id: 'w37', title: 'Citations by AI Engine', type: 'pie', colSpan: 4, rowSpan: 2, dataKey: 'aiEngineBreakdown' },
      { id: 'w38', title: 'AI Visibility by Engine', type: 'line', colSpan: 12, rowSpan: 2, dataKey: 'aiEngineTimeline' },
      { id: 'w39', title: 'Competitor AI Visibility', type: 'bar', colSpan: 6, rowSpan: 2, dataKey: 'aiCompetitorVisibility' },
      { id: 'w40', title: 'Competitor AI Share of Voice', type: 'bar', colSpan: 6, rowSpan: 2, dataKey: 'aiCompetitorSOV' },
    ],
  },
  {
    id: 'd3',
    name: 'Content Performance',
    widgets: [
      { id: 'w20', title: 'Published Articles', type: 'metric', colSpan: 3, rowSpan: 1, dataKey: 'totalArticles' },
      { id: 'w21', title: 'Avg. Clicks/Article', type: 'metric', colSpan: 3, rowSpan: 1, dataKey: 'avgClicksPerArticle' },
      { id: 'w22', title: 'Top Category', type: 'metric', colSpan: 3, rowSpan: 1, dataKey: 'topCategory' },
      { id: 'w23', title: 'Est. Revenue', type: 'metric', colSpan: 3, rowSpan: 1, dataKey: 'estimatedRevenue' },
      { id: 'w24', title: 'Clicks Over Time', type: 'line', colSpan: 12, rowSpan: 2, dataKey: 'dailyTraffic' },
      { id: 'w25', title: 'Content Performance Table', type: 'table', colSpan: 12, rowSpan: 3, dataKey: 'contentTable' },
    ],
  },
];
