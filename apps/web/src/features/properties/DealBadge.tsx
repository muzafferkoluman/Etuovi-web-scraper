import React from 'react';
import { DealIndicator } from '@koti-scout/shared';
import { TrendingDown, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DealBadgeProps {
  deal?: DealIndicator;
  className?: string;
}

export const DealBadge: React.FC<DealBadgeProps> = ({ deal, className }) => {
  if (!deal) return null;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all',
        deal.isDeal
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-sm'
          : 'bg-slate-50 text-slate-700 border-slate-200',
        className
      )}
    >
      {deal.isDeal ? (
        <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
      ) : (
        <Sparkles className="w-3.5 h-3.5 text-slate-500" />
      )}
      <span>{deal.label}</span>
    </div>
  );
};
