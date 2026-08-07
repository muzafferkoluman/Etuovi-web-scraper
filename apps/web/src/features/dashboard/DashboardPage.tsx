import React, { useState } from 'react';
import { Property, SavedSearch, DashboardStats } from '@koti-scout/shared';
import { PropertyCard } from '../properties/PropertyCard';
import { PropertyDetailModal } from '../properties/PropertyDetailModal';
import { formatEuro } from '../../lib/utils';
import {
  TrendingDown,
  Sparkles,
  Building,
  CheckCircle2,
  Play,
  Clock,
  ArrowRight,
  ShieldCheck,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export interface DashboardPageProps {
  stats: DashboardStats | null;
  savedSearches: SavedSearch[];
  properties: Property[];
  favorites: string[];
  comparedProperties: Property[];
  onToggleFavorite: (id: string) => void;
  onToggleCompare: (prop: Property) => void;
  onRunSearchNow: (id: string) => Promise<void>;
  runningSearchId: string | null;
  runFeedback: { id: string; message: string } | null;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  savedSearches,
  properties,
  favorites,
  comparedProperties,
  onToggleFavorite,
  onToggleCompare,
  onRunSearchNow,
  runningSearchId,
  runFeedback
}) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Top high match properties (score >= 85)
  const bestMatches = properties
    .filter((p) => (p.score ?? 0) >= 85)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 3);

  // Recent price drops
  const priceDrops = properties
    .filter((p) => p.smartTags?.includes('PRICE DROP') || (p.priceChangePercent && p.priceChangePercent < 0))
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Top Banner Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Automated Market Monitor Active</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Finnish Property Intelligence
          </h1>
          <p className="text-sm text-slate-300">
            KotiScout tracks listings, detects price changes, and scores properties based on your personal criteria across Helsinki, Espoo, Vantaa, and Tampere.
          </p>
        </div>

        {/* 4 Overview Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-700/60 text-slate-100">
          <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              <span>Active Searches</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black mt-1 text-white">
              {stats?.activeSearches ?? savedSearches.length}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Checked Today</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black mt-1 text-white">
              {stats?.checkedToday ?? 164}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-emerald-400" />
              <span>New Listings</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black mt-1 text-emerald-400">
              {stats?.newListings ?? 7}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
              <span>Price Drops</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black mt-1 text-emerald-400">
              {stats?.priceDrops ?? 3}
            </div>
          </div>
        </div>
      </div>

      {/* Live Run Feedback Alert */}
      {runFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-950">Search Execution Completed</p>
              <p className="text-xs text-emerald-800">{runFeedback.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Best New Matches Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-black text-slate-900">Best New Matches</h2>
          </div>
          <Link to="/search" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            <span>Explore all properties</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {bestMatches.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isFavorite={favorites.includes(property.id)}
              isCompared={comparedProperties.some((p) => p.id === property.id)}
              onToggleFavorite={onToggleFavorite}
              onToggleCompare={onToggleCompare}
              onViewDetails={setSelectedProperty}
            />
          ))}
        </div>
      </section>

      {/* Recent Price Drops Section */}
      {priceDrops.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-black text-slate-900">Recent Price Drops</h2>
            </div>
            <Link to="/search" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              <span>View all drops</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {priceDrops.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isFavorite={favorites.includes(property.id)}
                isCompared={comparedProperties.some((p) => p.id === property.id)}
                onToggleFavorite={onToggleFavorite}
                onToggleCompare={onToggleCompare}
                onViewDetails={setSelectedProperty}
              />
            ))}
          </div>
        </section>
      )}

      {/* Saved Searches Quick Runner Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900">Active Saved Searches</h2>
          <Link to="/saved-searches" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
            Manage searches →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedSearches.slice(0, 3).map((search) => {
            const isRunning = runningSearchId === search.id;
            return (
              <div key={search.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {search.enabled ? 'ACTIVE MONITOR' : 'PAUSED'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {search.scheduleType}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{search.name}</h3>

                  <div className="text-xs text-slate-500 space-y-1 my-3">
                    <div>{search.filters.cities?.join(', ') || 'All Cities'}</div>
                    {search.filters.maxPrice && (
                      <div>Max €{search.filters.maxPrice.toLocaleString('fi-FI')}</div>
                    )}
                    {search.filters.minArea && <div>Min {search.filters.minArea} m²</div>}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Min Score: {search.minimumScore}/100
                  </span>

                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={isRunning}
                    onClick={() => onRunSearchNow(search.id)}
                  >
                    <Play className="w-3 h-3 mr-1 fill-white" />
                    <span>Run now</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Property Details Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        isOpen={Boolean(selectedProperty)}
        onClose={() => setSelectedProperty(null)}
        isFavorite={selectedProperty ? favorites.includes(selectedProperty.id) : false}
        onToggleFavorite={onToggleFavorite}
      />
    </div>
  );
};
