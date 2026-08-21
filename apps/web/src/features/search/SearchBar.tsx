import React from "react";
import { Search, LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { SORT_OPTIONS, SortByOption } from "@koti-scout/shared";

export interface SearchBarProps {
  keyword: string;
  onKeywordChange: (kw: string) => void;
  resultCount: number;
  sortBy: SortByOption;
  onSortChange: (sort: SortByOption) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
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
  onOpenMobileFilters
}) => {
  return (
    <div className="bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
      {/* Search Input Bar */}
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder="Search by address, district (e.g. Kallio, Töölö, Pasila)..."
          className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
        />
      </div>

      {/* Result Count, Sorting, and Toggles */}
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{resultCount}</span> properties
        </div>

        {/* Mobile Filter Sheet Button */}
        <button
          type="button"
          onClick={onOpenMobileFilters}
          className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Filters</span>
        </button>

        {/* Sort Selector */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortByOption)}
          aria-label="Sort properties"
          className="text-xs font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              {opt.label}
            </option>
          ))}
        </select>

        {/* Grid / List view toggle */}
        <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 p-0.5">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-white dark:bg-emerald-500 text-emerald-700 dark:text-slate-950 font-bold shadow-xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
            title="Grid view"
            aria-label="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={`p-1.5 rounded-lg transition-colors ${viewMode === "list" ? "bg-white dark:bg-emerald-500 text-emerald-700 dark:text-slate-950 font-bold shadow-xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
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
