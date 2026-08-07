import React from 'react';
import { ShieldCheck, Database, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white/70 backdrop-blur-sm py-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">KotiScout</span>
            <span>— AI Assisted Finnish Property Intelligence Assistant</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Provider: MockPropertyProvider (Finnish Demo Data)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Scheduler: Europe/Helsinki</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ethical Data & RLS Protected</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400">
          Disclaimer: Estimated deal indicators and scoring metrics are calculated relative to district asking medians and user criteria. They represent analytical indicators, not investment guarantees.
        </div>
      </div>
    </footer>
  );
};
