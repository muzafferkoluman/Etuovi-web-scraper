import React from 'react';
import { ScoreBreakdown } from '@koti-scout/shared';

export interface ScoreBreakdownWidgetProps {
  score: number;
  breakdown?: ScoreBreakdown;
}

export const ScoreBreakdownWidget: React.FC<ScoreBreakdownWidgetProps> = ({ score, breakdown }) => {
  if (!breakdown) {
    return (
      <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
        <div className="text-2xl font-black text-emerald-800">{score}</div>
        <div className="text-xs text-emerald-700 font-medium">/ 100 Match Score</div>
      </div>
    );
  }

  const items = [
    { label: 'Price vs Budget', value: breakdown.price, max: 25 },
    { label: 'Location & District', value: breakdown.location, max: 20 },
    { label: 'Area & Space', value: breakdown.area, max: 15 },
    { label: 'Building & Year', value: breakdown.buildYear, max: 10 },
    { label: 'Costs & Maintenance', value: breakdown.maintenanceFee, max: 10 },
    { label: '€/m² vs District Median', value: breakdown.pricePerSquareMeter, max: 10 },
    { label: 'Features (Balcony, Sauna, etc.)', value: breakdown.features, max: 10 }
  ];

  return (
    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            KotiScout AI Scoring
          </span>
          <h4 className="text-base font-bold text-slate-900">Match Score</h4>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-emerald-600">{score}</span>
          <span className="text-xs font-semibold text-slate-400">/ 100</span>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        {items.map((item) => {
          const pct = Math.round((item.value / item.max) * 100);
          return (
            <div key={item.label}>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>{item.label}</span>
                <span className="font-semibold text-slate-800">
                  {item.value} <span className="text-slate-400 font-normal">/ {item.max}</span>
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
