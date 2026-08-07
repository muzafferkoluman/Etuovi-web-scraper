import React, { useState } from 'react';
import { SavedSearch, SearchRun } from '@koti-scout/shared';
import { Button } from '../../components/ui/Button';
import { CreateSearchModal } from './CreateSearchModal';
import { RunHistoryModal } from './RunHistoryModal';
import { api } from '../../lib/api-client';
import {
  Bookmark,
  Play,
  Clock,
  History,
  Trash2,
  CheckCircle2,
  Plus,
  BellRing
} from 'lucide-react';

export interface SavedSearchesPageProps {
  savedSearches: SavedSearch[];
  onRefresh: () => void;
  onRunSearchNow: (id: string) => Promise<void>;
  runningSearchId: string | null;
  runFeedback: { id: string; message: string } | null;
}

export const SavedSearchesPage: React.FC<SavedSearchesPageProps> = ({
  savedSearches,
  onRefresh,
  onRunSearchNow,
  runningSearchId,
  runFeedback
}) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedSearchForHistory, setSelectedSearchForHistory] = useState<SavedSearch | null>(null);
  const [runs, setRuns] = useState<SearchRun[]>([]);

  const handleOpenHistory = async (search: SavedSearch) => {
    setSelectedSearchForHistory(search);
    try {
      const historyRuns = await api.getSearchRunHistory(search.id);
      setRuns(historyRuns);
      setHistoryModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this automated saved search?')) {
      await api.deleteSavedSearch(id);
      onRefresh();
    }
  };

  const handleCreate = async (data: unknown) => {
    await api.createSavedSearch(data);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Saved Searches & Automated Scans
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure automated monitoring schedules in Europe/Helsinki timezone. The system scans listings, computes match scores, and alerts you to price drops.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1" />
          <span>New Saved Search</span>
        </Button>
      </div>

      {/* Live Feedback Toast */}
      {runFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <span className="font-bold">Search Run Executed: </span>
            <span>{runFeedback.message}</span>
          </div>
        </div>
      )}

      {/* Saved Searches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {savedSearches.map((search) => {
          const isRunning = runningSearchId === search.id;
          return (
            <div
              key={search.id}
              className="nordic-card p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      search.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {search.enabled ? 'ACTIVE MONITOR' : 'PAUSED'}
                  </span>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{search.timezone || 'Europe/Helsinki'}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900">{search.name}</h3>

                {/* Filters summary */}
                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 my-3 text-xs space-y-1 text-slate-700">
                  <div className="font-semibold text-slate-900">
                    {search.filters.cities?.join(', ') || 'All Finnish Cities'}
                  </div>
                  {search.filters.maxPrice && (
                    <div>Budget: Max €{search.filters.maxPrice.toLocaleString('fi-FI')}</div>
                  )}
                  {search.filters.minArea && <div>Area: Min {search.filters.minArea} m²</div>}
                  {search.filters.minRooms && <div>Rooms: {search.filters.minRooms}+ rooms</div>}
                  {search.filters.minBuildYear && (
                    <div>Building: {search.filters.minBuildYear}+</div>
                  )}
                  <div className="text-[11px] text-emerald-700 pt-1 flex items-center gap-1 font-semibold">
                    <BellRing className="w-3 h-3" />
                    <span>Notify if Match Score ≥ {search.minimumScore}/100</span>
                  </div>
                </div>

                {/* Schedule times */}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                  <span>Schedule: {search.scheduleType}</span>
                  <span>{search.customScheduleTimes?.join(', ') || '08:00, 14:00, 20:00'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenHistory(search)}
                    className="text-xs"
                  >
                    <History className="w-3.5 h-3.5 mr-1" />
                    <span>History</span>
                  </Button>
                  <button
                    onClick={() => handleDelete(search.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors"
                    title="Delete search"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isRunning}
                  onClick={() => onRunSearchNow(search.id)}
                >
                  <Play className="w-3 h-3 mr-1 fill-white" />
                  <span>{isRunning ? 'Running scan...' : 'Run now'}</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <CreateSearchModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleCreate}
      />

      {selectedSearchForHistory && (
        <RunHistoryModal
          isOpen={historyModalOpen}
          onClose={() => setHistoryModalOpen(false)}
          savedSearchName={selectedSearchForHistory.name}
          runs={runs}
        />
      )}
    </div>
  );
};
