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
  SlidersHorizontal,
  ChevronRight
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
    <div className="space-y-8 pb-10">
      
      {/* 1. Executive Welcome & Command Center Header */}
      <div className="hero-mesh p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Property Radar Active
              </span>
              <span className="text-xs text-slate-400 font-medium">
                • Helsinki EET
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white font-mono tracking-tight">
              Tervetuloa, <span className="text-emerald-400">Lina!</span> 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium max-w-xl">
              Canlı Etuovi emlak piyasası izleme ve fiyat düşüş tespit kontrol paneliniz.
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
                <span>İlan Ara</span>
              </Button>
            </Link>

            <Link to="/saved-searches">
              <Button
                variant="outline"
                size="md"
                className="border-slate-700 bg-slate-900/80 text-slate-200 hover:text-white hover:bg-slate-800 text-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                <span>Radarları Yönet</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 2. Primary KPI Executive Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-emerald-400" />
              <span>İzlenen İlan Havuzu</span>
            </div>
            <div className="text-xl sm:text-2xl font-black mt-1 text-white font-mono">
              {stats?.checkedToday ?? properties.length} <span className="text-xs font-normal text-slate-400">ilan</span>
            </div>
          </div>

          <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
              <span>Yakalanan Fiyat Düşüşü</span>
            </div>
            <div className="text-xl sm:text-2xl font-black mt-1 text-rose-400 font-mono">
              {stats?.priceDrops ?? priceDrops.length} <span className="text-xs font-normal text-rose-300">fırsat</span>
            </div>
          </div>

          <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span>Otomatik Radar Araması</span>
            </div>
            <div className="text-xl sm:text-2xl font-black mt-1 text-amber-400 font-mono">
              {savedSearches.length} <span className="text-xs font-normal text-slate-400">aktif</span>
            </div>
          </div>

          <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Favori Evlerim</span>
            </div>
            <div className="text-xl sm:text-2xl font-black mt-1 text-white font-mono">
              {favorites.length} <span className="text-xs font-normal text-slate-400">kayıtlı</span>
            </div>
          </div>
        </div>

        {/* 3. Fast City Jump Bar */}
        <form onSubmit={handleHeroSearch} className="mt-6 p-2 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 w-full">
            <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <select
              value={heroCity}
              onChange={(e) => setHeroCity(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              {FINNISH_CITIES.map((city) => (
                <option key={city} value={city} className="bg-slate-900 text-white">
                  {city} Bölgesindeki İlanları İncele
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
            <span>{heroCity} İlanlarına Git</span>
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
              <p className="text-xs font-bold text-emerald-300">Radar Araması Tamamlandı</p>
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
                <h2 className="text-lg font-black text-white">Günün En İyi Fırsatları & Yüksek Skorlu Evler</h2>
              </div>
              <Link to="/search" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                <span>Tümünü gör ({properties.length})</span>
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
                  <h2 className="text-lg font-black text-white">Son Fiyat İndirimleri</h2>
                </div>
                <Link to="/search" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                  <span>Tüm indirimleri gör</span>
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
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Aktif Arama Radarları</h3>
              </div>
              <Link to="/saved-searches" className="text-xs text-emerald-400 hover:underline font-semibold">
                Yönet →
              </Link>
            </div>

            {savedSearches.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Henüz kayıtlı radarınız yok. İlan arama sayfasından filtrelerinizi radar olarak kaydedebilirsiniz.
              </div>
            ) : (
              <div className="space-y-3">
                {savedSearches.slice(0, 4).map((search) => {
                  const isRunning = runningSearchId === search.id;
                  return (
                    <div key={search.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate max-w-[140px]">
                          {search.name}
                        </span>
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {search.scheduleType}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>{search.filters.cities?.join(", ") || "Tüm Şehirler"}</span>
                        {search.filters.maxPrice && (
                          <span>Maks €{search.filters.maxPrice.toLocaleString("fi-FI")}</span>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-800/50 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">
                          Min Skor: {search.minimumScore}
                        </span>
                        <button
                          type="button"
                          disabled={isRunning}
                          onClick={() => onRunSearchNow(search.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-[11px] font-bold transition-colors flex items-center gap-1"
                        >
                          <Play className="w-2.5 h-2.5" />
                          <span>{isRunning ? "Taranıyor..." : "Şimdi Tara"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Compare Dock Widget (if properties are being compared) */}
          {comparedProperties.length > 0 && (
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-emerald-500/30 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white text-xs font-bold">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  <span>Karşılaştırma Listesi ({comparedProperties.length}/4)</span>
                </div>
                <Link to="/compare" className="text-xs text-emerald-400 hover:underline font-bold">
                  Kıyasla →
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
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Kişisel Veri Radarı</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Tüm arama kriterleriniz ve indirim takipleriniz doğrudan bu panel üzerinden otomatik güncellenir.
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
