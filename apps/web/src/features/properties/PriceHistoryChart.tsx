import React from 'react';
import { PropertySnapshot } from '@koti-scout/shared';
import { formatEuro } from '../../lib/utils';
import { TrendingDown, Calendar } from 'lucide-react';

export interface PriceHistoryChartProps {
  currentPrice: number;
  snapshots: PropertySnapshot[];
}

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ currentPrice, snapshots }) => {
  if (snapshots.length <= 1) {
    return (
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>Price History</span>
        </div>
        <p>No price changes recorded since listing. Current asking price: {formatEuro(currentPrice)}.</p>
      </div>
    );
  }

  const sorted = [...snapshots].sort(
    (a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime()
  );

  const firstPrice = sorted[0].price;
  const latestPrice = sorted[sorted.length - 1].price;
  const totalDiff = latestPrice - firstPrice;
  const totalPercent = Math.round((totalDiff / firstPrice) * 1000) / 10;

  return (
    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <TrendingDown className="w-4 h-4 text-emerald-600" />
          <h4 className="text-sm font-bold text-slate-900">Price History</h4>
        </div>
        {totalDiff < 0 && (
          <div className="text-right">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
              Total reduction: {formatEuro(Math.abs(totalDiff))} ({totalPercent}%)
            </span>
          </div>
        )}
      </div>

      <div className="relative pl-4 border-l-2 border-emerald-500/40 space-y-4">
        {sorted.map((snap, idx) => {
          const dateStr = new Date(snap.capturedAt).toLocaleDateString('fi-FI');
          const isLatest = idx === sorted.length - 1;
          const isInitial = idx === 0;

          return (
            <div key={snap.id} className="relative">
              <div
                className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 bg-white ${
                  isLatest ? 'border-emerald-600 ring-2 ring-emerald-200' : 'border-slate-400'
                }`}
              />
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-900">{formatEuro(snap.price)}</span>
                  <span className="text-[11px] text-slate-500 ml-2">
                    {isInitial ? 'Original asking price' : isLatest ? 'Current price' : 'Updated price'}
                  </span>
                </div>
                <span className="text-slate-400">{dateStr}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
