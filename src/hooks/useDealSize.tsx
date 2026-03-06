'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

const DEFAULT_DEAL_SIZE = 500;

interface DealSizeContextValue {
  dealSize: number;
  setDealSize: (size: number) => void;
}

const DealSizeContext = createContext<DealSizeContextValue | null>(null);

export function DealSizeProvider({ children }: { children: ReactNode }) {
  const [dealSize, setDealSizeRaw] = useState(DEFAULT_DEAL_SIZE);
  const setDealSize = useCallback((s: number) => setDealSizeRaw(s), []);

  return (
    <DealSizeContext.Provider value={{ dealSize, setDealSize }}>
      {children}
    </DealSizeContext.Provider>
  );
}

export function useDealSize(): DealSizeContextValue {
  const ctx = useContext(DealSizeContext);
  if (!ctx) throw new Error('useDealSize must be used within a DealSizeProvider');
  return ctx;
}
