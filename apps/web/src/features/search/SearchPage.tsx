import React, { useState } from 'react';
import { Property, PropertyFilters, SortByOption } from '@koti-scout/shared';
import { FilterSidebar } from './FilterSidebar';
import { SearchBar } from './SearchBar';
import { PropertyCard } from '../properties/PropertyCard';
import { PropertyDetailModal } from '../properties/PropertyDetailModal';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Bookmark, Sparkles, AlertCircle, RotateCcw } from 'lucide-react';

export interface SearchPageProps {
  properties: Property[];
  total: number;
  isLoading: boolean;
  filters: PropertyFilters;
  onFilterChange: (filters: PropertyFilters) => void;
  favorites: string[];
  comparedProperties: Property[];
  onToggleFavorite: (propertyId: string) => void;
  onToggleCompare: (property: Property) => void;
  onSaveSearchModalOpen: () => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  properties,
  total,
  isLoading,
  filters,
  onFilterChange,
  favorites,
  comparedProperties,
  onToggleFavorite,
  onToggleCompare,
  onSaveSearchModalOpen
}) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const resetFilters = () => {
    onFilterChange({
      cities: ['Helsinki'],
      sortBy: 'newest'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header bar with Save Search action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Finnish Property Search & Intelligence
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Search active listings with automated Match Scoring (0-100), Deal Finder metrics, and price drop detection.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onSaveSearchModalOpen}
          className="self-start sm:self-auto border-emerald-300 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100/70"
        >
          <Bookmark className="w-4 h-4 text-emerald-600 mr-1.5" />
          <span>Save this Search</span>
        </Button>
      </div>

      {/* Main Layout: Left Sidebar + Center Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Sidebar (Left) */}
        <aside className="hidden lg:block lg:col-span-1 sticky top-24">
          <FilterSidebar
            filters={filters}
            onChange={onFilterChange}
            onReset={resetFilters}
          />
        </aside>

        {/* Center Content Column */}
        <main className="lg:col-span-3 space-y-4">
          <SearchBar
            keyword={filters.keyword || ''}
            onKeywordChange={(kw) => onFilterChange({ ...filters, keyword: kw })}
            resultCount={total}
            sortBy={filters.sortBy || 'newest'}
            onSortChange={(sort) => onFilterChange({ ...filters, sortBy: sort })}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onOpenMobileFilters={() => setMobileFiltersOpen(true)}
            onSaveCurrentSearch={onSaveSearchModalOpen}
          />

          {/* Results Grid / List */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 py-12">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 animate-pulse space-y-3">
                  <div className="aspect-[16/10] bg-slate-200 rounded-xl" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-6 bg-slate-200 rounded w-1/3 mt-2" />
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            /* High quality Empty State */
            <div className="bg-slate-900/90 p-8 sm:p-12 rounded-2xl border border-slate-800 text-center max-w-lg mx-auto my-8 space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  No properties match these filters
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Try adjusting your criteria to discover properties across Finnish regions:
                </p>
              </div>

              <div className="text-left bg-slate-950/80 p-4 rounded-xl text-xs space-y-2 text-slate-200 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Increasing maximum budget or price</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Reducing minimum living area (m²)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Removing optional features like private sauna or elevator</span>
                </div>
              </div>

              <Button variant="primary" size="sm" onClick={resetFilters} className="mx-auto">
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                <span>Reset to default filters</span>
              </Button>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
                  : 'space-y-4'
              }
            >
              {properties.map((property) => (
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
          )}
        </main>
      </div>

      {/* Mobile Filters Modal Drawer */}
      <Modal
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        title="Filter Properties"
        maxWidth="md"
      >
        <FilterSidebar
          filters={filters}
          onChange={onFilterChange}
          onReset={resetFilters}
          onApply={() => setMobileFiltersOpen(false)}
          isMobile
        />
      </Modal>

      {/* Property Detail Modal */}
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
