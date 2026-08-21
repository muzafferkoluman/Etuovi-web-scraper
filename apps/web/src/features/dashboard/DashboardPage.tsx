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
  ShieldCheck,
  Heart,
  Scale,
  SlidersHorizontal
} from "lucide-react";
import { FINNISH_CITIES } from "@koti-scout/shared";
import { useTranslation } from "../../contexts/LanguageContext";

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
  const { t } = useTranslation();
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
    <div className="space-y-8 pb-10">
      
      {/* 1. Executive Welcome & Command Center Header */}
      <div className="hero-mesh p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {t("nav.liveFeed")} {t("nav.radarActive")}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                • Helsinki (EET)
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {t("dash.welcome")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium max-w-xl">
              {t("dash.welcomeSub")}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <Link to="/search">
              <Button
                variant="primary"
                size="md"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold hover:from-emerald-400 hover:to-teal-400 text-xs shadow-lg shadow-emerald-500/20"
              >
                <Search className="w-3.5 h-3.5 mr-1.5" />
                <span>{t("dash.searchBtn")}</span>
              </Button>
            </Link>

            <Link to="/saved-searches">
              <Button
                variant="outline"
                size="md"
                className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                <span>{t("dash.manageRadars")}</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 2. Primary KPI Executive Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-white/80 dark:bg-slate-900/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t("dash.statListings")}</span>
            </div>
            <div className="text-xl sm:text-2xl font-black mt-1 text-slate-900 dark:text-white font-mono">
              {stats?.checkedToday ?? properties.length} <span className="text-xs font-normal text-slate-400">{t("dash.unitListings")}</span>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
              <span>{t("dash.statDrops")}</span>
            </div>
            <div className="text-xl sm:text-2xl font-black mt-1 text-rose-400 font-mono">
              {stats?.priceDrops ?? priceDrops.length} <span className="text-xs font-normal text-rose-300">{t("dash.unitDrops")}</span>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span>{t("dash.statRadars")}</span>
            </div>
            <div className="text-xl sm:text-2xl font-black mt-1 text-amber-400 font-mono">
              {savedSearches.length} <span className="text-xs font-normal text-slate-400">{t("dash.unitActive")}</span>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>{t("dash.statFavorites")}</span>
            </div>
            <div className="text-xl sm:text-2xl font-black mt-1 text-slate-900 dark:text-white font-mono">
              {favorites.length} <span className="text-xs font-normal text-slate-400">{t("dash.unitSaved")}</span>
            </div>
          </div>
        </div>

        {/* 3. Fast City Jump Bar */}
        <form onSubmit={handleHeroSearch} className="mt-6 p-2 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center gap-2 shadow-xs">
          <div className="flex-1 flex items-center gap-2 px-3 w-full">
            <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <select
              value={heroCity}
              onChange={(e) => setHeroCity(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              {FINNISH_CITIES.map((city) => (
                <option key={city} value={city} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {city} {t("dash.citySelectSuffix")}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="w-full sm:w-auto text-xs font-bold px-5 bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all"
          >
            <span>{heroCity} - {t("dash.cityJumpBtn")}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </form>
      </div>

      {/* Live Run Feedback Alert */}
      {runFeedback && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/30 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs">
              ✓
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-300">{t("dash.radarCompleted")}</p>
              <p className="text-xs text-emerald-400">{runFeedback.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Two-Column Dashboard Command Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Property Feeds (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Top Bargains Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Flame className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">{t("dash.topBargains")}</h2>
              </div>
              <Link to="/search" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                <span>{t("dash.viewAll")} ({properties.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {(bestMatches.length > 0 ? bestMatches.slice(0, 4) : properties.slice(0, 4)).map((property) => (
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
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">{t("dash.priceDrops")}</h2>
                </div>
                <Link to="/search" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                  <span>{t("dash.viewAllDrops")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {priceDrops.slice(0, 4).map((property) => (
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
        </div>

        {/* RIGHT COLUMN: Control Widgets (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active Saved Search Radars Widget */}
          <div className="bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t("dash.activeRadars")}</h3>
              </div>
              <Link to="/saved-searches" className="text-xs text-emerald-400 hover:underline font-semibold">
                {t("dash.manage")}
              </Link>
            </div>

            {savedSearches.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                {t("dash.noRadars")}
              </div>
            ) : (
              <div className="space-y-3">
                {savedSearches.slice(0, 4).map((search) => {
                  const isRunning = runningSearchId === search.id;
                  return (
                    <div key={search.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                          {search.name}
                        </span>
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {search.scheduleType}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>{search.filters.cities?.join(", ") || "All Cities"}</span>
                        {search.filters.maxPrice && (
                          <span>Max €{search.filters.maxPrice.toLocaleString("fi-FI")}</span>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-800/50 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">
                          {t("dash.minScore")}: {search.minimumScore}
                        </span>
                        <button
                          type="button"
                          disabled={isRunning}
                          onClick={() => onRunSearchNow(search.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-[11px] font-bold transition-colors flex items-center gap-1"
                        >
                          <Play className="w-2.5 h-2.5" />
                          <span>{isRunning ? t("dash.running") : t("dash.runNow")}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Compare Dock Widget */}
          {comparedProperties.length > 0 && (
            <div className="bg-white dark:bg-slate-900/90 p-5 rounded-2xl border border-emerald-500/30 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white text-xs font-bold">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  <span>{t("dash.compareDock")} ({comparedProperties.length}/4)</span>
                </div>
                <Link to="/compare" className="text-xs text-emerald-400 hover:underline font-bold">
                  {t("dash.compareNow")}
                </Link>
              </div>

              <div className="space-y-2">
                {comparedProperties.map((p) => (
                  <div key={p.id} className="text-xs text-slate-300 flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="truncate max-w-[170px]">{p.address}</span>
                    <span className="font-bold text-white">€{p.price.toLocaleString("fi-FI")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lina Quick Security & System Note */}
          <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>{t("dash.personalRadar")}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t("dash.personalRadarDesc")}
            </p>
          </div>

        </div>
      </div>

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
