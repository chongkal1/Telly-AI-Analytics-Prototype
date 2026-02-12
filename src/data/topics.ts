export interface Topic {
  id: string;
  title: string;
  keywordCount: number;
  source: string;
  keywords: string[];
  status: 'approved' | 'rejected';
}

export const topics: Topic[] = [
  {
    id: 't1',
    title: 'Content Marketing Strategy',
    keywordCount: 34,
    source: 'hubspot.com',
    keywords: [
      'content marketing strategy',
      'content strategy framework',
      'content marketing plan',
      'how to create content strategy',
      'content calendar template',
      'content marketing ROI',
    ],
    status: 'approved',
  },
  {
    id: 't2',
    title: 'SEO Fundamentals',
    keywordCount: 28,
    source: 'moz.com',
    keywords: [
      'seo basics',
      'on-page seo checklist',
      'seo for beginners',
      'technical seo guide',
      'seo audit',
      'keyword research',
    ],
    status: 'approved',
  },
  {
    id: 't3',
    title: 'Email Marketing',
    keywordCount: 22,
    source: 'hubspot.com',
    keywords: [
      'email marketing best practices',
      'email automation',
      'email subject lines',
      'drip campaign examples',
      'email segmentation',
    ],
    status: 'approved',
  },
  {
    id: 't4',
    title: 'Link Building',
    keywordCount: 19,
    source: 'moz.com',
    keywords: [
      'link building strategies',
      'backlink analysis',
      'guest posting outreach',
      'broken link building',
      'link building tools',
    ],
    status: 'approved',
  },
  {
    id: 't5',
    title: 'Social Media Marketing',
    keywordCount: 26,
    source: 'hubspot.com',
    keywords: [
      'social media strategy',
      'instagram marketing',
      'linkedin content strategy',
      'social media content ideas',
      'social media analytics',
    ],
    status: 'approved',
  },
  {
    id: 't6',
    title: 'Local SEO \u2014 Miami',
    keywordCount: 15,
    source: 'semrush.com',
    keywords: [
      'local seo miami',
      'miami digital marketing',
      'local business seo',
    ],
    status: 'rejected',
  },
  {
    id: 't7',
    title: 'Local SEO \u2014 New York',
    keywordCount: 12,
    source: 'semrush.com',
    keywords: [
      'local seo new york',
      'nyc digital marketing',
      'local business listings',
    ],
    status: 'rejected',
  },
  {
    id: 't8',
    title: 'Keyword Research',
    keywordCount: 20,
    source: 'moz.com',
    keywords: [
      'keyword research tools',
      'long tail keywords',
      'keyword difficulty',
      'search volume analysis',
      'competitor keyword analysis',
    ],
    status: 'approved',
  },
  {
    id: 't9',
    title: 'AI Content Creation',
    keywordCount: 18,
    source: 'hubspot.com',
    keywords: [
      'ai content writing',
      'ai marketing tools',
      'chatgpt for marketing',
      'ai seo optimization',
      'automated content generation',
    ],
    status: 'approved',
  },
  {
    id: 't10',
    title: 'B2B Lead Generation',
    keywordCount: 24,
    source: 'semrush.com',
    keywords: [
      'b2b lead generation',
      'lead nurturing strategies',
      'marketing qualified leads',
      'sales funnel optimization',
      'lead scoring models',
    ],
    status: 'approved',
  },
];

export const topicStats = {
  totalTopics: 10,
  totalKeywords: 199,
  approvedTopics: 8,
  rejectedTopics: 2,
};
