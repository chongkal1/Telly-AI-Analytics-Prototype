'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { MaturityStage } from '@/types';

export interface StageConfig {
  label: string;
  description: string;
  goal: string;
  traffic: number;
  impr: number;
  identified: number;
  contacted: number;
  leads: number;
  cta: number;
  clusters: number;
}

export const STAGE_CONFIGS: Record<MaturityStage, StageConfig> = {
  '1mo': { label: '1 mo', description: 'New site - publishing & indexing', goal: 'Organic Traffic Growth', traffic: 0, impr: 0.01, identified: 0, contacted: 0, leads: 0, cta: 0, clusters: 3 },
  '3mo': { label: '3 mo', description: 'Impressions growing, tracking positions', goal: 'Organic Traffic Growth', traffic: 0.012, impr: 0.12, identified: 0.012, contacted: 0, leads: 0, cta: 0.012, clusters: 5 },
  '6mo': { label: '6 mo', description: 'Clicks arriving, optimizing content', goal: 'Organic Traffic Growth', traffic: 0.08, impr: 0.35, identified: 0.08, contacted: 0.08, leads: 0.08, cta: 0.08, clusters: 6 },
  '9mo': { label: '9 mo', description: 'Lead capture & conversion focus', goal: 'Lead Generation', traffic: 0.4, impr: 0.60, identified: 0.4, contacted: 0.4, leads: 0.4, cta: 0.4, clusters: 7 },
  '12mo': { label: '12 mo', description: 'Lead quality & A/B optimization', goal: 'Lead Generation', traffic: 0.6, impr: 0.80, identified: 0.6, contacted: 0.6, leads: 0.6, cta: 0.6, clusters: 8 },
  '18mo': { label: '18 mo', description: 'Full operations - mature state', goal: 'Lead Generation', traffic: 1.0, impr: 1.0, identified: 1.0, contacted: 1.0, leads: 1.0, cta: 1.0, clusters: 8 },
};

export const MATURITY_STAGES: MaturityStage[] = ['1mo', '3mo', '6mo', '9mo', '12mo', '18mo'];

interface MaturityStageContextValue {
  stage: MaturityStage;
  config: StageConfig;
  setStage: (stage: MaturityStage) => void;
}

const MaturityStageContext = createContext<MaturityStageContextValue | null>(null);

export function MaturityStageProvider({ children }: { children: ReactNode }) {
  const [stage, setStageRaw] = useState<MaturityStage>('18mo');

  const setStage = useCallback((s: MaturityStage) => {
    setStageRaw(s);
  }, []);

  const config = STAGE_CONFIGS[stage];

  return (
    <MaturityStageContext.Provider value={{ stage, config, setStage }}>
      {children}
    </MaturityStageContext.Provider>
  );
}

export function useMaturityStage(): MaturityStageContextValue {
  const ctx = useContext(MaturityStageContext);
  if (!ctx) throw new Error('useMaturityStage must be used within a MaturityStageProvider');
  return ctx;
}
