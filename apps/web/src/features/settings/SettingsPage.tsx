import React, { useState } from 'react';
import { UserPreferences, FINNISH_CITIES } from '@koti-scout/shared';
import { Button } from '../../components/ui/Button';
import { SlidersHorizontal, MapPin, Globe, Check, Shield } from 'lucide-react';
import { api } from '../../lib/api-client';

export interface SettingsPageProps {
  preferences: UserPreferences | null;
  onRefresh: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ preferences, onRefresh }) => {
  const [defaultCity, setDefaultCity] = useState(preferences?.defaultCity || 'Helsinki');
  const [timezone] = useState('Europe/Helsinki');
  const [weights, setWeights] = useState(
    preferences?.criteriaWeights || {
      price: 25,
      area: 15,
      location: 20,
      buildYear: 10,
      maintenanceFee: 10,
      pricePerSquareMeter: 10,
      features: 10
    }
  );
  const [isSaved, setIsSaved] = useState(false);

  const totalPoints = Object.values(weights).reduce((a, b) => a + b, 0);

  const handleSave = async () => {
    await api.updateUserPreferences({
      defaultCity,
      defaultTimezone: timezone,
      criteriaWeights: weights
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
    onRefresh();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          System Preferences & Scoring Criteria
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure default Finnish region, scheduler timezone, and personalize your 100-point AI Match Scoring weights.
        </p>
      </div>

      {isSaved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Preferences updated successfully!</span>
        </div>
      )}

      {/* General Settings */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-emerald-600" />
          <span>General Locale</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Default Market City</label>
            <select
              value={defaultCity}
              onChange={(e) => setDefaultCity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none"
            >
              {FINNISH_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Scheduler Timezone</label>
            <input
              type="text"
              readOnly
              value={timezone}
              className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Custom AI Match Scoring Criteria Weights */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 text-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <span>AI Scoring Engine Weights</span>
          </h3>
          <span
            className={`font-black text-xs px-2.5 py-1 rounded-lg ${
              totalPoints === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}
          >
            Total Points: {totalPoints} / 100
          </span>
        </div>

        <p className="text-slate-500">
          Adjust the importance of each property factor. KotiScout uses these weights to rank properties from 0 to 100.
        </p>

        <div className="space-y-4">
          {[
            { key: 'price', label: 'Price vs Budget Limit', max: 40 },
            { key: 'location', label: 'Location & Prime District', max: 30 },
            { key: 'area', label: 'Living Area & Layout', max: 30 },
            { key: 'buildYear', label: 'Building Age & Epoch', max: 20 },
            { key: 'maintenanceFee', label: 'Maintenance Fee (Hoitovastike)', max: 20 },
            { key: 'pricePerSquareMeter', label: '€/m² vs District Median', max: 20 },
            { key: 'features', label: 'Sauna, Balcony, Elevator', max: 20 }
          ].map((c) => {
            const val = weights[c.key as keyof typeof weights];
            return (
              <div key={c.key} className="space-y-1">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>{c.label}</span>
                  <span className="text-emerald-700">{val} pts</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={c.max}
                  value={val}
                  onChange={(e) =>
                    setWeights({
                      ...weights,
                      [c.key]: Number(e.target.value)
                    })
                  }
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button variant="primary" size="md" onClick={handleSave}>
          <Check className="w-4 h-4 mr-1.5" />
          <span>Save Preferences</span>
        </Button>
      </div>
    </div>
  );
};
