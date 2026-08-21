import React from "react";
import { ShieldCheck, Database, Clock, Sparkles } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="font-black text-white font-mono tracking-wider">KOTISCOUT</span>
            <span className="text-slate-400">— AI Finnish Real Estate Intelligence & Price Radar</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Provider: EtuoviLivePropertyProvider</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Timezone: Europe/Helsinki (EET)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Row Level Security (RLS) Protected</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-900 text-center text-[10px] text-slate-500">
          Analytical Intelligence Notice: Deal scores and price reduction history are computed relative to district asking medians and registered search rules.
        </div>
      </div>
    </footer>
  );
};
