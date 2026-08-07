import React from 'react';
import { Search, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import { SORT_OPTIONS, SortByOption } from '@koti-scout/shared';

export interface SearchBarProps {
  keyword: string;
  onKeywordChange: (kw: string) => void;
  resultCount: number;
  sortBy: SortByOption;
  onSortChange: (sort: SortByOption) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onOpenMobileFilters?: () => void;
  onSaveCurrentSearch?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  keyword,
  onKeywordChange,
  resultCount,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onOpenMobileFilters,
  onSaveCurrentSearch
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
      {/* Search Input Bar */}
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder="Search by address, district (e.g. Kallio, Töölö, Pasila)..."
          className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900"
        />
      </div>

      {/* Result Count, Sorting, and Toggles */}
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
        <div className="text-xs font-semibold text-slate-600 px-2.5 py-1 rounded-lg bg-slate-100">
          <span className="text-emerald-700 font-bold">{resultCount}</span> properties
        </div>

        {/* Mobile Filter Sheet Button */}
        <button
          onClick={onOpenMobileFilters}
          className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
          <span>Filters</span>
        </button>

        {/* Sort Selector */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortByOption)}
          aria-label="Sort properties"
          className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Grid / List view toggle */}
        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 ${viewMode === 'grid' ? 'bg-white shadow-xs text-emerald-600' : 'text-slate-400'}`}
            title="Grid view"
            aria-label="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 ${viewMode === 'list' ? 'bg-white shadow-xs text-emerald-600' : 'text-slate-400'}`}
            title="List view"
            aria-label="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
