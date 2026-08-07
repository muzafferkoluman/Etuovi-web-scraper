import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import {
  Terminal,
  TrendingDown,
  PlusCircle,
  Trash2,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Database,
  Cpu,
  Layers
} from 'lucide-react';

interface DevStatus {
  provider: string;
  databaseMode: string;
  apiStatus: string;
  mockPropertiesCount: number;
  savedSearchesCount: number;
  notificationsCount: number;
  favoritesCount: number;
  timezone: string;
  environment: string;
}

export const DevDebugPage: React.FC = () => {
  const [status, setStatus] = useState<DevStatus | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [logMessages, setLogMessages] = useState<Array<{ id: string; time: string; text: string; success: boolean }>>([]);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/dev/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const addLog = (text: string, success = true) => {
    setLogMessages((prev) => [
      {
        id: Math.random().toString(),
        time: new Date().toLocaleTimeString('fi-FI'),
        text,
        success
      },
      ...prev.slice(0, 15)
    ]);
  };

  const handleSimulatePriceDrop = async () => {
    setLoadingAction('price-drop');
    try {
      const res = await fetch('/api/dev/simulate-price-drop', { method: 'POST' });
      const data = await res.json();
      addLog(data.message || 'Price drop simulated on Fleminginkatu 12 B');
      fetchStatus();
    } catch (err: unknown) {
      addLog('Failed to simulate price drop', false);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSimulateNewProperty = async () => {
    setLoadingAction('new-prop');
    try {
      const res = await fetch('/api/dev/simulate-new-property', { method: 'POST' });
      const data = await res.json();
      addLog(data.message || 'New listing simulated in Töölö');
      fetchStatus();
    } catch (err: unknown) {
      addLog('Failed to simulate new property', false);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSimulateRemovedProperty = async () => {
    setLoadingAction('removed-prop');
    try {
      const res = await fetch('/api/dev/simulate-removed-property', { method: 'POST' });
      const data = await res.json();
      addLog(data.message || 'Inactive property simulated');
      fetchStatus();
    } catch (err: unknown) {
      addLog('Failed to simulate removed property', false);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRunScheduledCron = async () => {
    setLoadingAction('cron');
    try {
      const res = await fetch('/internal/jobs/run-scheduled-searches', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer koti_scout_secret_cron_token_change_in_prod'
        }
      });
      const data = await res.json();
      addLog(`Scheduler executed. Processed ${data.processedSearches} searches, ${data.newProperties} new, ${data.priceChanges} price drops.`);
      fetchStatus();
    } catch (err: unknown) {
      addLog('Failed to trigger cron endpoint', false);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReset = async () => {
    setLoadingAction('reset');
    try {
      const res = await fetch('/api/dev/reset-state', { method: 'POST' });
      const data = await res.json();
      addLog(data.message || 'State reset to 40+ Finnish defaults');
      fetchStatus();
    } catch (err: unknown) {
      addLog('Failed to reset state', false);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-bold mb-1">
            <Terminal className="w-3.5 h-3.5" />
            <span>DEVELOPMENT-ONLY CONTROLS</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            KotiScout Intelligence Engine Simulator
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Test price reductions, new listing discoveries, and scheduler executions against the diff and scoring engines.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleReset} isLoading={loadingAction === 'reset'}>
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          <span>Reset Demo State</span>
        </Button>
      </div>

      {/* Engine Status Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            <span>Provider</span>
          </div>
          <div className="text-sm font-bold text-slate-900 mt-1 truncate">
            {status?.provider || 'MockPropertyProvider'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Database Mode</span>
          </div>
          <div className="text-xs font-bold text-slate-900 mt-1 truncate">
            In-Memory / Postgres Ready
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Active Listings</span>
          </div>
          <div className="text-lg font-black text-slate-900 mt-1">
            {status?.mockPropertiesCount ?? 44}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Timezone</span>
          </div>
          <div className="text-xs font-bold text-slate-900 mt-1">
            {status?.timezone || 'Europe/Helsinki'}
          </div>
        </div>
      </div>

      {/* Action Simulator Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Diff Engine & Pipeline Simulation Triggers</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleSimulatePriceDrop}
            disabled={Boolean(loadingAction)}
            className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all group"
          >
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900 group-hover:text-emerald-800">
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              <span>1. Simulate Price Drop (-€20,000)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Reduces asking price on Fleminginkatu 12 B to trigger `PRICE_DECREASED` and generate history snapshots.
            </p>
          </button>

          <button
            onClick={handleSimulateNewProperty}
            disabled={Boolean(loadingAction)}
            className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all group"
          >
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900 group-hover:text-emerald-800">
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>2. Simulate New Property Listing</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Injects a new high-match property in Töölö (Score: 93) to test `NEW_PROPERTY` detection.
            </p>
          </button>

          <button
            onClick={handleRunScheduledCron}
            disabled={Boolean(loadingAction)}
            className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all group"
          >
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900 group-hover:text-emerald-800">
              <Play className="w-4 h-4 text-emerald-600" />
              <span>3. Trigger Scheduled Search Cron</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Hits `POST /internal/jobs/run-scheduled-searches` with `CRON_SECRET` to execute all due saved searches.
            </p>
          </button>

          <button
            onClick={handleSimulateRemovedProperty}
            disabled={Boolean(loadingAction)}
            className="p-4 rounded-xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50/40 text-left transition-all group"
          >
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900 group-hover:text-rose-800">
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>4. Simulate Inactive Property</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Marks an existing active listing as inactive to test removed property detection.
            </p>
          </button>
        </div>
      </div>

      {/* Simulator Event Console */}
      <div className="bg-slate-900 p-5 rounded-2xl text-slate-100 font-mono text-xs space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
          <span>Engine Event Log</span>
          <span>{logMessages.length} events logged</span>
        </div>

        {logMessages.length === 0 ? (
          <div className="py-4 text-slate-500 text-center">
            Click any trigger button above to run simulated events through the diff engine.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {logMessages.map((log) => (
              <div key={log.id} className="flex items-start gap-2">
                <span className="text-slate-500 text-[10px]">{log.time}</span>
                <span className={log.success ? 'text-emerald-400' : 'text-rose-400'}>
                  {log.success ? '✓' : '✗'}
                </span>
                <span className="text-slate-200">{log.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
