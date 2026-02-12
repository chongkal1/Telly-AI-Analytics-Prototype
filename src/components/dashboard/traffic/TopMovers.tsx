'use client';

import { TopMover } from '@/data/chart-data';
import { TrendIndicator } from '@/components/shared/TrendIndicator';

interface TopMoversProps {
  rising: TopMover[];
  falling: TopMover[];
}

function MoverRow({ mover, type }: { mover: TopMover; type: 'rising' | 'falling' }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 transition-colors">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 truncate">{mover.title}</p>
        <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded mt-0.5 ${
          type === 'rising' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
        }`}>
          {mover.category}
        </span>
      </div>
      <div className="flex items-center gap-3 ml-3 shrink-0">
        <span className="text-sm font-mono text-gray-700">{mover.clicks.toLocaleString()}</span>
        <TrendIndicator change={mover.clicksChange} />
      </div>
    </div>
  );
}

export function TopMovers({ rising, falling }: TopMoversProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Top Movers</h3>
        <p className="text-xs text-gray-500 mt-0.5">Pages with biggest traffic changes vs. previous period</p>
      </div>

      <div className="grid grid-cols-2 divide-x divide-gray-200">
        {/* Rising */}
        <div>
          <div className="px-3 py-2 bg-emerald-50 border-b border-emerald-100">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
              <span className="text-xs font-semibold text-emerald-700">Rising</span>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {rising.length > 0 ? (
              rising.map((m) => <MoverRow key={m.id} mover={m} type="rising" />)
            ) : (
              <p className="px-3 py-4 text-xs text-gray-400 text-center">No rising pages</p>
            )}
          </div>
        </div>

        {/* Falling */}
        <div>
          <div className="px-3 py-2 bg-red-50 border-b border-red-100">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
              </svg>
              <span className="text-xs font-semibold text-red-700">Falling</span>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {falling.length > 0 ? (
              falling.map((m) => <MoverRow key={m.id} mover={m} type="falling" />)
            ) : (
              <p className="px-3 py-4 text-xs text-gray-400 text-center">No falling pages</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
