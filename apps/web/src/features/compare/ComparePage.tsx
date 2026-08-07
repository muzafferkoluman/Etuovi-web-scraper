import React from 'react';
import { Property } from '@koti-scout/shared';
import { formatEuro, formatSqmPrice } from '../../lib/utils';
import { Scale, Trash2, Sparkles, Check, X, Building, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export interface ComparePageProps {
  properties: Property[];
  onRemoveFromCompare: (id: string) => void;
  onClearCompare: () => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({
  properties,
  onRemoveFromCompare,
  onClearCompare
}) => {
  if (properties.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-md mx-auto shadow-sm space-y-4">
        <Scale className="w-10 h-10 text-slate-300 mx-auto" />
        <h2 className="text-base font-bold text-slate-900">No properties selected for comparison</h2>
        <p className="text-xs text-slate-500">
          Select between 2 and 4 properties from Search or Dashboard to compare them side-by-side.
        </p>
        <Link to="/search">
          <Button variant="primary" size="sm">
            <span>Explore Properties</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate lowest price, lowest €/m², highest score to highlight favorable values gently
  const minPrice = Math.min(...properties.map((p) => p.price));
  const minSqmPrice = Math.min(...properties.map((p) => p.pricePerSquareMeter));
  const maxScore = Math.max(...properties.map((p) => p.score ?? 0));
  const maxArea = Math.max(...properties.map((p) => p.area));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Property Comparison Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Side-by-side analysis of asking price, €/m², maintenance fees, and Finnish property attributes.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={onClearCompare}>
          <Trash2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
          <span>Clear comparison ({properties.length})</span>
        </Button>
      </div>

      {/* Comparison Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70">
              <th className="p-4 font-bold text-slate-700 w-44">Attribute</th>
              {properties.map((p) => (
                <th key={p.id} className="p-4 min-w-[220px] max-w-[260px] align-top">
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-2 bg-slate-100">
                    <img src={p.thumbnailUrl} alt={p.title} className="w-full h-full object-cover" />
                    <button
                      onClick={() => onRemoveFromCompare(p.id)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/70 text-white hover:bg-rose-600 transition-colors"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">{p.address}</div>
                  <div className="text-[11px] text-slate-500">{p.district}, {p.city}</div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {/* Match Score */}
            <tr className="bg-emerald-50/40">
              <td className="p-4 font-bold text-emerald-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Match Score</span>
              </td>
              {properties.map((p) => {
                const isBest = (p.score ?? 0) === maxScore && properties.length > 1;
                return (
                  <td key={p.id} className="p-4">
                    <span
                      className={`inline-block px-2 py-1 rounded-lg font-black text-sm ${
                        isBest ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {p.score ?? 80} / 100
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* Asking Price */}
            <tr>
              <td className="p-4 font-semibold text-slate-700">Asking Price</td>
              {properties.map((p) => {
                const isLowest = p.price === minPrice && properties.length > 1;
                return (
                  <td key={p.id} className="p-4 font-bold text-sm text-slate-900">
                    <span className={isLowest ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded' : ''}>
                      {formatEuro(p.price)}
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* Living Area */}
            <tr>
              <td className="p-4 font-semibold text-slate-700">Living Area (m²)</td>
              {properties.map((p) => {
                const isLargest = p.area === maxArea && properties.length > 1;
                return (
                  <td key={p.id} className="p-4 font-semibold text-slate-800">
                    <span className={isLargest ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded' : ''}>
                      {p.area} m²
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* €/m² */}
            <tr>
              <td className="p-4 font-semibold text-slate-700">Price per m²</td>
              {properties.map((p) => {
                const isLowest = p.pricePerSquareMeter === minSqmPrice && properties.length > 1;
                return (
                  <td key={p.id} className="p-4 font-semibold text-slate-800">
                    <span className={isLowest ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded' : ''}>
                      {formatSqmPrice(p.pricePerSquareMeter)}
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* Rooms */}
            <tr>
              <td className="p-4 font-semibold text-slate-700">Rooms & Layout</td>
              {properties.map((p) => (
                <td key={p.id} className="p-4 text-slate-800">
                  {p.rooms} rooms ({p.bedrooms || 1} bedrooms)
                </td>
              ))}
            </tr>

            {/* Property Type */}
            <tr>
              <td className="p-4 font-semibold text-slate-700">Property Type</td>
              {properties.map((p) => (
                <td key={p.id} className="p-4 text-slate-800">
                  {p.propertyType}
                </td>
              ))}
            </tr>

            {/* Build Year */}
            <tr>
              <td className="p-4 font-semibold text-slate-700">Build Year</td>
              {properties.map((p) => (
                <td key={p.id} className="p-4 text-slate-800 font-medium">
                  {p.buildYear || '—'}
                </td>
              ))}
            </tr>

            {/* Monthly Maintenance Fee */}
            <tr>
              <td className="p-4 font-semibold text-slate-700">Maintenance Fee (Hoitovastike)</td>
              {properties.map((p) => (
                <td key={p.id} className="p-4 text-slate-800">
                  {p.maintenanceFee ? `${p.maintenanceFee} € / month` : 'N/A'}
                </td>
              ))}
            </tr>

            {/* Balcony */}
            <tr>
              <td className="p-4 font-semibold text-slate-700">Balcony (Parveke)</td>
              {properties.map((p) => (
                <td key={p.id} className="p-4">
                  {p.hasBalcony ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-4 h-4" /> Yes
                    </span>
                  ) : (
                    <span className="text-slate-400">No</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Sauna */}
            <tr>
              <td className="p-4 font-semibold text-slate-700">Private Sauna (Oma sauna)</td>
              {properties.map((p) => (
                <td key={p.id} className="p-4">
                  {p.hasSauna ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-4 h-4" /> Yes
                    </span>
                  ) : (
                    <span className="text-slate-400">No</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Elevator */}
            <tr>
              <td className="p-4 font-semibold text-slate-700">Elevator (Hissi)</td>
              {properties.map((p) => (
                <td key={p.id} className="p-4">
                  {p.hasElevator ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-4 h-4" /> Yes
                    </span>
                  ) : (
                    <span className="text-slate-400">No</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Energy Class */}
            <tr>
              <td className="p-4 font-semibold text-slate-700">Energy Class</td>
              {properties.map((p) => (
                <td key={p.id} className="p-4 font-mono text-slate-800">
                  {p.energyClass || 'E2018'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
