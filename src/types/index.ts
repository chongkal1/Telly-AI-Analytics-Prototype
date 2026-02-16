export interface Page {
  id: string;
  url: string;
  title: string;
  category: string;
  publishDate: string;
  author: string;
}

export interface TrafficMetric {
  date: string;
  pageId: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface DailyTraffic {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

export type LeadIndustry =
  | 'SaaS' | 'FinTech' | 'Healthcare' | 'E-Commerce'
  | 'MarTech' | 'DevTools' | 'Cybersecurity' | 'HR Tech'
  | 'Consulting' | 'EdTech' | 'Real Estate';

export interface Lead {
  id: string;
  // RB2B identification fields
  name: string;
  email: string;
  linkedinUrl: string;
  title: string;
  company: string;
  industry: LeadIndustry;
  employeeCount: string;
  estimatedRevenue: string;
  // Visit context
  source: string;
  sourceUrl: string;
  referrer: string;
  // Pipeline
  status: LeadStatus;
  value: number;
  createdAt: string;
  isRepeatVisit: boolean;
}

export interface MonthlyReportSnapshot {
  totalClicks: number;
  totalImpressions: number;
  avgCtr: number;
  identifiedVisitors: number;
  capturedLeads: number;
  pipelineValue: number;
  monthlyCost: number;
  roas: number;
  costPerLead: number;
  aiCitations: number;
  aiAppearances: number;
  aiVisibilityScore: number;
  aiSentiment: number;
  clusterCount: number;
  topCluster: string;
  leadsByStatus: { name: string; value: number }[];
  leadsByIndustry: { name: string; value: number }[];
  clusterPerformance: {
    category: string;
    pages: number;
    clicks: number;
    impressions: number;
    ctr: number;
    leads: number;
    growth: number;
  }[];
  topLeads: {
    name: string;
    company: string;
    industry: string;
    value: number;
    status: string;
  }[];
  aiEngineBreakdown: { name: string; value: number }[];
}

export interface MonthlyReportComparison {
  clicks: number;
  impressions: number;
  ctr: number;
  visitors: number;
  leads: number;
  pipeline: number;
  roas: number;
  aiCitations: number;
  aiVisibility: number;
}

export interface MonthlyReportNarrative {
  executiveSummary: string;
  trafficAnalysis: string;
  aiVisibilityAnalysis: string;
  clusterAnalysis: string;
  leadsAnalysis: string;
  recommendations: string[];
}

export interface MonthlyReport {
  id: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  periodLabel: string;
  generatedAt: string;
  snapshot: MonthlyReportSnapshot;
  comparison: MonthlyReportComparison;
  narrative: MonthlyReportNarrative;
  dailyTraffic: { date: string; clicks: number; impressions: number }[];
}

export type MessageRole = 'user' | 'assistant';

export interface ChartMeta {
  type: 'line' | 'bar' | 'pie' | 'table' | 'metric' | 'section';
  dataKey: string;
  title: string;
}

export interface MessageAction {
  label: string;
  message: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  chartMeta?: ChartMeta;
  actions?: MessageAction[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

export interface LandingPage {
  id: string;
  url: string;
  title: string;
  type: 'pricing' | 'demo' | 'product' | 'signup' | 'contact';
}

export interface DailyCtaClicks {
  date: string;
  totalClicks: number;
  byLandingPage: Record<string, number>;
}

export type WidgetType = 'metric' | 'line' | 'bar' | 'pie' | 'table' | 'section';

export interface Widget {
  id: string;
  title: string;
  type: WidgetType;
  colSpan: number;
  rowSpan: number;
  dataKey: string;
}

export interface Dashboard {
  id: string;
  name: string;
  widgets: Widget[];
}
