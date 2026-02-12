'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type PresetKey = '7d' | '28d' | '3m' | 'custom';

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

interface DateRangeState {
  preset: PresetKey;
  startDate: string;
  endDate: string;
  compareEnabled: boolean;
  compareStartDate: string;
  compareEndDate: string;
}

interface DateRangeContextValue extends DateRangeState {
  setPreset: (key: PresetKey) => void;
  setCustomRange: (start: string, end: string) => void;
  setCompareEnabled: (enabled: boolean) => void;
  presetLabel: string;
}

const DateRangeContext = createContext<DateRangeContextValue | null>(null);

function formatISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function computePresetRange(key: PresetKey): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();

  switch (key) {
    case '7d':
      start.setDate(end.getDate() - 6);
      break;
    case '28d':
      start.setDate(end.getDate() - 27);
      break;
    case '3m':
      start.setDate(end.getDate() - 89);
      break;
    default:
      start.setDate(end.getDate() - 27);
  }

  return { startDate: formatISODate(start), endDate: formatISODate(end) };
}

function computeCompareRange(startDate: string, endDate: string): { compareStartDate: string; compareEndDate: string } {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();
  const dayCount = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;

  const compareEnd = new Date(start);
  compareEnd.setDate(compareEnd.getDate() - 1);
  const compareStart = new Date(compareEnd);
  compareStart.setDate(compareStart.getDate() - dayCount + 1);

  return {
    compareStartDate: formatISODate(compareStart),
    compareEndDate: formatISODate(compareEnd),
  };
}

const PRESET_LABELS: Record<PresetKey, string> = {
  '7d': 'Last 7 days',
  '28d': 'Last 28 days',
  '3m': 'Last 3 months',
  custom: 'Custom',
};

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const defaultRange = computePresetRange('28d');
  const defaultCompare = computeCompareRange(defaultRange.startDate, defaultRange.endDate);

  const [state, setState] = useState<DateRangeState>({
    preset: '28d',
    ...defaultRange,
    compareEnabled: false,
    ...defaultCompare,
  });

  const setPreset = useCallback((key: PresetKey) => {
    const range = computePresetRange(key);
    const compare = computeCompareRange(range.startDate, range.endDate);
    setState((prev) => ({
      ...prev,
      preset: key,
      ...range,
      ...compare,
    }));
  }, []);

  const setCustomRange = useCallback((start: string, end: string) => {
    const compare = computeCompareRange(start, end);
    setState((prev) => ({
      ...prev,
      preset: 'custom' as PresetKey,
      startDate: start,
      endDate: end,
      ...compare,
    }));
  }, []);

  const setCompareEnabled = useCallback((enabled: boolean) => {
    setState((prev) => ({ ...prev, compareEnabled: enabled }));
  }, []);

  const presetLabel = PRESET_LABELS[state.preset];

  return (
    <DateRangeContext.Provider
      value={{ ...state, setPreset, setCustomRange, setCompareEnabled, presetLabel }}
    >
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange(): DateRangeContextValue {
  const ctx = useContext(DateRangeContext);
  if (!ctx) throw new Error('useDateRange must be used within a DateRangeProvider');
  return ctx;
}
