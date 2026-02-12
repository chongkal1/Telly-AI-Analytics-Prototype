import { Conversation } from '@/types';

export const conversations: Conversation[] = [
  {
    id: 'c1',
    title: 'Traffic Overview',
    createdAt: '2024-06-18T10:30:00Z',
    messages: [
      {
        id: 'm1',
        role: 'user',
        content: 'Show me the traffic overview for the last 30 days',
        timestamp: '2024-06-18T10:30:00Z',
      },
      {
        id: 'm2',
        role: 'assistant',
        content: 'Here\'s your traffic overview for the last 30 days. Total clicks are up 18% compared to the previous period, with impressions growing 14%. Your average CTR improved to 7.5%, and average position moved up to 12.1. The growth trend is consistent across all metrics.',
        timestamp: '2024-06-18T10:30:05Z',
        chartMeta: { type: 'line', dataKey: 'dailyTraffic', title: 'Daily Traffic (Last 30 Days)' },
      },
      {
        id: 'm3',
        role: 'user',
        content: 'Which pages are driving the most clicks?',
        timestamp: '2024-06-18T10:31:00Z',
      },
      {
        id: 'm4',
        role: 'assistant',
        content: 'Your top performing pages by clicks are led by "The Complete Guide to AI Content Marketing" with 2,340 clicks, followed by "Case Study: How TechCorp Grew Organic Traffic 340%" with 1,890 clicks. Content marketing and case study articles consistently outperform other categories.',
        timestamp: '2024-06-18T10:31:05Z',
        chartMeta: { type: 'bar', dataKey: 'topPages', title: 'Top Pages by Clicks' },
      },
    ],
  },
  {
    id: 'c2',
    title: 'Lead Analysis',
    createdAt: '2024-06-17T14:00:00Z',
    messages: [
      {
        id: 'm5',
        role: 'user',
        content: 'How many leads did we generate this month?',
        timestamp: '2024-06-17T14:00:00Z',
      },
      {
        id: 'm6',
        role: 'assistant',
        content: 'This month you\'ve generated 14 leads from content, with an estimated pipeline value of $480,000. 8 leads came from your top 5 performing articles. The conversion rate from blog visitor to lead is 0.19%, which is above the B2B SaaS benchmark of 0.12%.',
        timestamp: '2024-06-17T14:00:05Z',
        chartMeta: { type: 'pie', dataKey: 'leadsByStatus', title: 'Leads by Status' },
      },
      {
        id: 'm7',
        role: 'user',
        content: 'Show me the ROI breakdown',
        timestamp: '2024-06-17T14:01:00Z',
      },
      {
        id: 'm8',
        role: 'assistant',
        content: 'Your content marketing ROI is strong. With a monthly content investment of approximately $3,500, you\'ve generated $480,000 in pipeline value — a 137x return. Converted deals total $266,000 in ARR, representing a 76x return on content spend. The average cost per lead from content is $250, compared to $1,200 from paid channels.',
        timestamp: '2024-06-17T14:01:05Z',
        chartMeta: { type: 'bar', dataKey: 'roiBreakdown', title: 'ROI Breakdown' },
      },
    ],
  },
  {
    id: 'c3',
    title: 'Content Strategy',
    createdAt: '2024-06-16T09:15:00Z',
    messages: [
      {
        id: 'm9',
        role: 'user',
        content: 'Which content categories perform best?',
        timestamp: '2024-06-16T09:15:00Z',
      },
      {
        id: 'm10',
        role: 'assistant',
        content: 'AI & Automation articles lead with an average of 1,560 clicks per article, followed by Case Studies at 1,420 clicks. Content Marketing pieces average 1,180 clicks. Technical SEO and Link Building articles tend to have lower traffic but higher conversion rates to leads.',
        timestamp: '2024-06-16T09:15:05Z',
        chartMeta: { type: 'bar', dataKey: 'categoryPerformance', title: 'Performance by Category' },
      },
      {
        id: 'm11',
        role: 'user',
        content: 'Show me the leads table',
        timestamp: '2024-06-16T09:16:00Z',
      },
      {
        id: 'm12',
        role: 'assistant',
        content: 'Here\'s the full leads table showing all 30 leads generated through content. You can sort by company, status, or value. Your highest-value converted lead is LogicWare at $55,000 ARR, sourced from the AI Content Marketing Guide.',
        timestamp: '2024-06-16T09:16:05Z',
        chartMeta: { type: 'table', dataKey: 'leadsTable', title: 'All Leads' },
      },
    ],
  },
];
