import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Property, SavedSearch, DashboardStats } from "@koti-scout/shared";
import { PropertyCard } from "../properties/PropertyCard";
import { PropertyDetailModal } from "../properties/PropertyDetailModal";
import { Button } from "../../components/ui/Button";
import {
  Sparkles,
  TrendingDown,
  Search,
  Building,
  CheckCircle2,
  Play,
  ArrowRight,
  Clock,
  MapPin,
  Flame,
  ShieldCheck
} from "lucide-react";
import { FINNISH_CITIES } from "@koti-scout/shared";

export interface DashboardPageProps {
  stats: DashboardStats | null;
  savedSearches: SavedSearch[];
  properties: Property[];
  favorites: string[];
  comparedProperties: Property[];
  onToggleFavorite: (propertyId: string) => void;
  onToggleCompare: (property: Property) => void;
  onRunSearchNow: (savedSearchId: string) => void;
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
  const [heroCity, setHeroCity] = useState("Helsinki");
  const navigate = useNavigate();

  const priceDrops = properties.filter(
    (p) => p.smartTags?.includes("PRICE DROP") || (p.priceChangePercent && p.priceChangePercent < 0)
  );

  const bestMatches = properties
    .filter((p) => (p.score ?? 0) >= 75 || p.smartTags?.includes("GREAT MATCH"))
    .slice(0, 6);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?cities=${encodeURIComponent(heroCity)}`);
  };

  return (
    <div className="space-y-10">
      {/* Sleek Hero Banner Section */}
      <div className="hero-mesh p-6 sm:p-10 lg:p-12 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        
        {/* Glowing Decorative Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          {/* Top Live Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-4 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Live Etuovi.com Real Estate Radar</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none font-mono">
            FINNISH PROPERTY <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              INTELLIGENCE
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed max-w-2xl font-medium">
            Track live asking price reductions, automated market alerts, and AI bargain scores across Helsinki, Espoo, Tampere and all Finnish municipalities.
          </p>

          {/* Hero Quick Search Form */}
          <form onSubmit={handleHeroSearch} className="mt-8 p-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center gap-3 backdrop-blur-md max-w-2xl">
            <div className="flex-1 flex items-center gap-2 px-3 w-full">
              <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <select
                value={heroCity}
                onChange={(e) => setHeroCity(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer"
              >
                {FINNISH_CITIES.map((city) => (
                  <option key={city} value={city} className="bg-slate-900 text-white">
                    {city} Municipality
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full sm:w-auto text-xs font-black px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 transition-all shadow-md shadow-emerald-500/20"
            >
              <Search className="w-4 h-4 mr-2" />
              <span>Explore {heroCity} Listings</span>
            </Button>
          </form>
        </div>

        {/* Live Metrics Cards Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-8 border-t border-slate-800/80">
          <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
            <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              <span>Active Radar Monitors</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black mt-1 text-white">
              {stats?.activeSearches ?? savedSearches.length}
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
            <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Checked Today</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black mt-1 text-white">
              {stats?.checkedToday ?? 164}
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
            <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-amber-400" />
              <span>New Today</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black mt-1 text-amber-400">
              {stats?.newListings ?? properties.length}
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
            <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
              <span>Price Drops</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black mt-1 text-rose-400">
              {stats?.priceDrops ?? priceDrops.length}
            </div>
          </div>
        </div>
      </div>

      {/* Live Run Feedback Alert */}
      {runFeedback && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/30 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
              ✓
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-300">Live Search Execution Completed</p>
              <p className="text-xs text-emerald-400">{runFeedback.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Best New Matches Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Flame className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">Top Bargains & High Match Scores</h2>
          </div>
          <Link to="/search" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
            <span>Explore all properties</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(bestMatches.length > 0 ? bestMatches : properties.slice(0, 6)).map((property) => (
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
        <section className="space-y-4 pt-4 border-t border-slate-800/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <TrendingDown className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">Recent Price Reductions</h2>
            </div>
            <Link to="/search" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              <span>View all price drops</span>
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
      <section className="space-y-4 pt-4 border-t border-slate-800/60">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-white">Active Saved Search Monitors</h2>
          <Link to="/saved-searches" className="text-xs font-bold text-emerald-400 hover:text-emerald-300">
            Manage monitors →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedSearches.slice(0, 3).map((search) => {
            const isRunning = runningSearchId === search.id;
            return (
              <div key={search.id} className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                      {search.enabled ? "ACTIVE RADAR" : "PAUSED"}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      {search.scheduleType}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white line-clamp-1">{search.name}</h3>

                  <div className="text-xs text-slate-400 space-y-1 my-3">
                    <div>{search.filters.cities?.join(", ") || "All Cities"}</div>
                    {search.filters.maxPrice && (
                      <div>Max €{search.filters.maxPrice.toLocaleString("fi-FI")}</div>
                    )}
                    {search.filters.minArea && <div>Min {search.filters.minArea} m²</div>}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Min Score: {search.minimumScore}/100
                  </span>

                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={isRunning}
                    onClick={() => onRunSearchNow(search.id)}
                    className="bg-emerald-500 text-slate-950 font-black hover:bg-emerald-400 transition-all text-xs"
                  >
                    <Play className="w-3 h-3 mr-1 fill-slate-950" />
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
