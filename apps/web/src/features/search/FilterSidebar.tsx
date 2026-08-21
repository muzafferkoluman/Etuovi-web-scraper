import React from "react";
import { PropertyFilters, FINNISH_CITIES, FINNISH_DISTRICTS } from "@koti-scout/shared";
import { RotateCcw, Filter } from "lucide-react";
import { Button } from "../../components/ui/Button";

export interface FilterSidebarProps {
  filters: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
  onReset: () => void;
  onApply?: () => void;
  isMobile?: boolean;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onChange,
  onReset,
  onApply,
  isMobile = false
}) => {
  const selectedCity = filters.cities?.[0] || "Helsinki";
  const availableDistricts = FINNISH_DISTRICTS[selectedCity] || [];

  const handleCityChange = (city: string) => {
    onChange({
      ...filters,
      cities: city ? [city] : undefined,
      districts: undefined // Reset districts on city switch
    });
  };

  const handleDistrictToggle = (districtName: string) => {
    const current = filters.districts || [];
    const exists = current.includes(districtName);
    const updated = exists ? current.filter((d) => d !== districtName) : [...current, districtName];
    onChange({
      ...filters,
      districts: updated.length > 0 ? updated : undefined
    });
  };

  const handleRoomToggle = (roomCount: number) => {
    const current = filters.rooms || (filters.minRooms ? [filters.minRooms] : []);
    const updated = current.includes(roomCount)
      ? current.filter((r) => r !== roomCount)
      : [...current, roomCount];
    onChange({
      ...filters,
      minRooms: undefined,
      rooms: updated.length > 0 ? updated : undefined
    });
  };

  return (
    <div className={`space-y-6 ${isMobile ? "p-0" : "p-5 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl"}`}>
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Advanced Filters</h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 flex items-center gap-1 font-medium transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Clear all</span>
        </button>
      </div>

      {/* City Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">City / Municipality</label>
        <select
          value={selectedCity}
          onChange={(e) => handleCityChange(e.target.value)}
          aria-label="Filter by City"
          className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
        >
          {FINNISH_CITIES.map((c) => (
            <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* District Selector */}
      {availableDistricts.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Districts in {selectedCity}
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1">
            {availableDistricts.map((d) => {
              const isSelected = (filters.districts || []).includes(d.name);
              return (
                <button
                  key={d.name}
                  type="button"
                  onClick={() => handleDistrictToggle(d.name)}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                    isSelected
                      ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 font-bold"
                      : "bg-slate-100 dark:bg-slate-950/80 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {d.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Price Range (€)</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min €"
            aria-label="Minimum Price"
            value={filters.minPrice ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                minPrice: e.target.value ? Number(e.target.value) : undefined
              })
            }
            className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Max €"
            aria-label="Maximum Price"
            value={filters.maxPrice ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                maxPrice: e.target.value ? Number(e.target.value) : undefined
              })
            }
            className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Area Range */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Living Area (m²)</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min m²"
            aria-label="Minimum Area"
            value={filters.minArea ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                minArea: e.target.value ? Number(e.target.value) : undefined
              })
            }
            className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Max m²"
            aria-label="Maximum Area"
            value={filters.maxArea ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                maxArea: e.target.value ? Number(e.target.value) : undefined
              })
            }
            className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Rooms Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Rooms (Multi-select)</label>
        <div className="grid grid-cols-5 gap-1.5">
          {[1, 2, 3, 4, 5].map((r) => {
            const selectedRooms = filters.rooms || (filters.minRooms ? [filters.minRooms] : []);
            const isSelected = selectedRooms.includes(r);
            return (
              <button
                key={r}
                type="button"
                onClick={() => handleRoomToggle(r)}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  isSelected
                    ? "bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 border-emerald-600 dark:border-emerald-400 shadow-sm"
                    : "bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {r === 5 ? "5+" : `${r}h`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Amenities Checkboxes */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Amenities</label>
        <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
          <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900 dark:hover:text-white">
            <input
              type="checkbox"
              checked={filters.balconyRequired || false}
              onChange={(e) => onChange({ ...filters, balconyRequired: e.target.checked || undefined })}
              className="rounded bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-emerald-600 dark:text-emerald-500 focus:ring-emerald-500"
            />
            <span>Balcony (Parveke)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900 dark:hover:text-white">
            <input
              type="checkbox"
              checked={filters.saunaRequired || false}
              onChange={(e) => onChange({ ...filters, saunaRequired: e.target.checked || undefined })}
              className="rounded bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-emerald-600 dark:text-emerald-500 focus:ring-emerald-500"
            />
            <span>Sauna</span>
          </label>
        </div>
      </div>

      {isMobile && onApply && (
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="primary" size="lg" className="w-full bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-bold" onClick={onApply}>
            Apply Filters
          </Button>
        </div>
      )}
    </div>
  );
};
