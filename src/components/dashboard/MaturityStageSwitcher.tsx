'use client';

import { useMaturityStage, MATURITY_STAGES, STAGE_CONFIGS } from '@/hooks/useMaturityStage';

export function MaturityStageSwitcher() {
  const { stage, config, setStage } = useMaturityStage();

  return (
    <div className="mb-4 -mt-2 rounded-xl border border-dashed border-amber-300 bg-amber-50/60 px-4 py-2.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-200/60 text-amber-700">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.385-5.386a1.5 1.5 0 010-2.12l.708-.707a1.5 1.5 0 012.12 0l3.557 3.557 3.557-3.557a1.5 1.5 0 012.12 0l.707.707a1.5 1.5 0 010 2.12L13.58 15.17a1.5 1.5 0 01-2.16 0z" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-wider">Demo Mode</span>
        </div>
        <span className="text-xs text-amber-700/70">Client Journey Simulator</span>
        <span className="text-[10px] text-amber-600/50 hidden lg:inline">— {config.description}</span>
      </div>
      <div className="flex items-center gap-1 bg-white/80 rounded-lg p-0.5 border border-amber-200/80">
        {MATURITY_STAGES.map((s) => (
          <button
            key={s}
            onClick={() => setStage(s)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              s === stage
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-surface-500 hover:text-amber-700 hover:bg-amber-50'
            }`}
          >
            {STAGE_CONFIGS[s].label}
          </button>
        ))}
      </div>
    </div>
  );
}
