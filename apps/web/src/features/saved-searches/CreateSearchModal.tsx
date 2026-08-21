import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { PropertyFilters, ScheduleType, FINNISH_CITIES } from '@koti-scout/shared';

export interface CreateSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    filters: PropertyFilters;
    minimumScore: number;
    scheduleType: ScheduleType;
    timezone: string;
    notificationSettings: {
      inApp: boolean;
      notifyOnNewProperty: boolean;
      notifyOnPriceDrop: boolean;
      notifyOnHighScore: boolean;
      minScoreForNotification: number;
    };
  }) => Promise<void>;
  initialFilters?: PropertyFilters;
}

export const CreateSearchModal: React.FC<CreateSearchModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialFilters
}) => {
  const [name, setName] = useState('Helsinki Opportunity Finder');
  const [city, setCity] = useState(initialFilters?.cities?.[0] || 'Helsinki');
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initialFilters?.maxPrice || 280000);
  const [minArea, setMinArea] = useState<number | undefined>(initialFilters?.minArea || 45);
  const [minRooms, setMinRooms] = useState<number | undefined>(initialFilters?.minRooms || 2);
  const [minBuildYear, setMinBuildYear] = useState<number | undefined>(initialFilters?.minBuildYear || 1990);
  const [maxMaintenanceFee, setMaxMaintenanceFee] = useState<number | undefined>(initialFilters?.maxMaintenanceFee || 350);
  const [scheduleType, setScheduleType] = useState<ScheduleType>('THRICE_DAILY');
  const [minimumScore, setMinimumScore] = useState(75);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        name,
        filters: {
          cities: [city],
          maxPrice,
          minArea,
          minRooms,
          minBuildYear,
          maxMaintenanceFee
        },
        minimumScore,
        scheduleType,
        timezone: 'Europe/Helsinki',
        notificationSettings: {
          inApp: true,
          notifyOnNewProperty: true,
          notifyOnPriceDrop: true,
          notifyOnHighScore: true,
          minScoreForNotification: minimumScore
        }
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Save & Schedule Property Search" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Search Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder="e.g. Helsinki Investment Opportunities"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
            >
              {FINNISH_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Max Price (€)</label>
            <input
              type="number"
              value={maxPrice ?? ''}
              onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
              placeholder="e.g. 260000"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Min Area (m²)</label>
            <input
              type="number"
              value={minArea ?? ''}
              onChange={(e) => setMinArea(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Min Rooms</label>
            <input
              type="number"
              value={minRooms ?? ''}
              onChange={(e) => setMinRooms(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Min Build Year</label>
            <input
              type="number"
              value={minBuildYear ?? ''}
              onChange={(e) => setMinBuildYear(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Schedule Interval selector */}
        <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-2">
          <label className="font-bold text-emerald-950 block">
            Scan Schedule (Timezone: Europe/Helsinki)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '3x daily (08:00, 14:00, 20:00)', value: 'THRICE_DAILY' },
              { label: '2x daily (08:00, 20:00)', value: 'TWICE_DAILY' },
              { label: 'Once daily (08:00)', value: 'ONCE_DAILY' },
              { label: 'Manual Only', value: 'MANUAL' }
            ].map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setScheduleType(s.value as ScheduleType)}
                className={`p-2 rounded-lg text-left font-medium border transition-all ${
                  scheduleType === s.value
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 dark:text-slate-300 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Minimum Match Score Threshold */}
        <div>
          <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
            <span>Minimum Match Score for Alerts:</span>
            <span className="text-emerald-700">{minimumScore} / 100</span>
          </div>
          <input
            type="range"
            min={50}
            max={95}
            value={minimumScore}
            onChange={(e) => setMinimumScore(Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            Save & Schedule
          </Button>
        </div>
      </form>
    </Modal>
  );
};
