'use client';

import { useState, useRef, useEffect } from 'react';
import { useDateRange, PresetKey } from '@/hooks/useDateRange';
import { formatDateShort } from '@/lib/utils';

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: '7d', label: 'Last 7 days' },
  { key: '28d', label: 'Last 28 days' },
  { key: '3m', label: 'Last 3 months' },
];

export function DateRangePicker() {
  const {
    preset,
    startDate,
    endDate,
    compareEnabled,
    setPreset,
    setCustomRange,
    setCompareEnabled,
    presetLabel,
  } = useDateRange();

  const [open, setOpen] = useState(false);
  const [customStart, setCustomStart] = useState(startDate);
  const [customEnd, setCustomEnd] = useState(endDate);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Sync local custom inputs when context changes
  useEffect(() => {
    setCustomStart(startDate);
    setCustomEnd(endDate);
  }, [startDate, endDate]);

  const rangeLabel = `${formatDateShort(startDate)} – ${formatDateShort(endDate)}`;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-surface-700 bg-white border border-surface-300 rounded-lg shadow-sm hover:bg-surface-50 transition-colors"
      >
        <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{presetLabel}:</span>
        <span className="text-surface-500">{rangeLabel}</span>
        <svg className={`w-3.5 h-3.5 text-surface-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Compare badge */}
      {compareEnabled && (
        <span className="ml-2 inline-flex items-center px-2 py-0.5 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-full border border-indigo-200">
          vs Previous period
        </span>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 left-0 w-72 bg-white rounded-lg shadow-lg border border-surface-200 p-4">
          {/* Presets */}
          <div className="mb-3">
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wide mb-2">Period</p>
            <div className="flex gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => { setPreset(p.key); setOpen(false); }}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    preset === p.key
                      ? 'bg-indigo-600 text-white'
                      : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom range */}
          <div className="mb-3 border-t border-surface-100 pt-3">
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wide mb-2">Custom range</p>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="flex-1 text-xs border border-surface-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-surface-400 text-xs">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="flex-1 text-xs border border-surface-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={() => {
                if (customStart && customEnd && customStart <= customEnd) {
                  setCustomRange(customStart, customEnd);
                  setOpen(false);
                }
              }}
              className="mt-2 w-full text-xs font-medium py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Apply
            </button>
          </div>

          {/* Compare toggle */}
          <div className="border-t border-surface-100 pt-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-medium text-surface-700">Compare to previous period</span>
              <button
                role="switch"
                aria-checked={compareEnabled}
                onClick={() => setCompareEnabled(!compareEnabled)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  compareEnabled ? 'bg-indigo-600' : 'bg-surface-200'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
                    compareEnabled ? 'translate-x-[18px]' : 'translate-x-[3px]'
                  }`}
                />
              </button>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
