import React from 'react';
import { PropertyFilters, FINNISH_CITIES, FINNISH_DISTRICTS, PROPERTY_TYPES } from '@koti-scout/shared';
import { RotateCcw, Search, Filter } from 'lucide-react';
import { Button } from '../../components/ui/Button';

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
  const selectedCity = filters.cities?.[0] || 'Helsinki';
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
    const updated = exists ? current.filter(d => d !== districtName) : [...current, districtName];
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
    <div className={`space-y-6 ${isMobile ? 'p-0' : 'p-5 bg-white rounded-2xl border border-slate-200 shadow-sm'}`}>
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">Advanced Filters</h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 font-medium transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Clear all</span>
        </button>
      </div>

      {/* City Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 block">City</label>
        <select
          value={selectedCity}
          onChange={(e) => handleCityChange(e.target.value)}
          aria-label="Filter by City"
          className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        >
          {FINNISH_CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Districts */}
      {availableDistricts.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">
            Districts in {selectedCity}
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
            {availableDistricts.map((d) => {
              const isSelected = filters.districts?.includes(d.name);
              return (
                <button
                  key={d.name}
                  type="button"
                  onClick={() => handleDistrictToggle(d.name)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {d.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Asking Price Range */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 block">Price Range (€)</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min €"
            aria-label="Minimum Price"
            value={filters.minPrice ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                minPrice: e.target.value ? Number(e.target.value) : undefined
              })
            }
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Max €"
            aria-label="Maximum Price"
            value={filters.maxPrice ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                maxPrice: e.target.value ? Number(e.target.value) : undefined
              })
            }
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Living Area Range */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 block">Living Area (m²)</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min m²"
            aria-label="Minimum Area"
            value={filters.minArea ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                minArea: e.target.value ? Number(e.target.value) : undefined
              })
            }
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Max m²"
            aria-label="Maximum Area"
            value={filters.maxArea ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                maxArea: e.target.value ? Number(e.target.value) : undefined
              })
            }
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Rooms Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 block">Rooms</label>
        <div className="grid grid-cols-5 gap-1.5">
          {[1, 2, 3, 4, 5].map((r) => {
            const selectedRooms = filters.rooms || (filters.minRooms ? [filters.minRooms] : []);
            const isSelected = selectedRooms.includes(r);
            return (
              <button
                key={r}
                type="button"
                onClick={() => handleRoomToggle(r)}
                className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {r === 5 ? '5+' : `${r}h`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Property Type */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 block">Property Type</label>
        <div className="space-y-1.5 text-xs">
          {PROPERTY_TYPES.map((type) => {
            const checked = filters.propertyTypes?.includes(type) ?? false;
            return (
              <label key={type} className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const current = filters.propertyTypes || [];
                    const updated = e.target.checked
                      ? [...current, type]
                      : current.filter((t) => t !== type);
                    onChange({
                      ...filters,
                      propertyTypes: updated.length > 0 ? updated : undefined
                    });
                  }}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span>{type}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Maintenance Fee limit */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 block">
          Max Maintenance Fee (€/mo)
        </label>
        <input
          type="number"
          placeholder="e.g. 350 €"
          aria-label="Maximum Maintenance Fee"
          value={filters.maxMaintenanceFee ?? ''}
          onChange={(e) =>
            onChange({
              ...filters,
              maxMaintenanceFee: e.target.value ? Number(e.target.value) : undefined
            })
          }
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
      </div>

      {/* Amenities Checkboxes */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-700 block">Features & Amenities</label>
        <div className="space-y-1.5 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
            <input
              type="checkbox"
              checked={filters.balconyRequired ?? false}
              onChange={(e) => onChange({ ...filters, balconyRequired: e.target.checked || undefined })}
              className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <span>Balcony (Parveke)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
            <input
              type="checkbox"
              checked={filters.saunaRequired ?? false}
              onChange={(e) => onChange({ ...filters, saunaRequired: e.target.checked || undefined })}
              className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <span>Private Sauna (Oma sauna)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
            <input
              type="checkbox"
              checked={filters.elevatorRequired ?? false}
              onChange={(e) => onChange({ ...filters, elevatorRequired: e.target.checked || undefined })}
              className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <span>Elevator in building (Hissi)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
            <input
              type="checkbox"
              checked={filters.newBuildingOnly ?? false}
              onChange={(e) => onChange({ ...filters, newBuildingOnly: e.target.checked || undefined })}
              className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <span>New construction (&lt; 3 yrs)</span>
          </label>
        </div>
      </div>

      {/* Search Button */}
      <div className="pt-2">
        <Button
          variant="primary"
          className="w-full text-xs font-bold"
          onClick={onApply}
        >
          <Search className="w-3.5 h-3.5 mr-1" />
          <span>Apply Filters</span>
        </Button>
      </div>
    </div>
  );
};
