import { PropertyFilters } from './property';

export type ScheduleType = 'MANUAL' | 'ONCE_DAILY' | 'TWICE_DAILY' | 'THRICE_DAILY' | 'CUSTOM';

export interface NotificationSettings {
  inApp: boolean;
  email?: boolean;
  telegram?: boolean;
  notifyOnNewProperty: boolean;
  notifyOnPriceDrop: boolean;
  notifyOnHighScore: boolean;
  minScoreForNotification?: number;
}

export interface SavedSearch {
  id: string;
  userId: string;

  name: string;

  filters: PropertyFilters;

  minimumScore: number;

  enabled: boolean;

  scheduleType: ScheduleType;
  customScheduleTimes?: string[]; // e.g. ["08:00", "14:00", "20:00"]
  timezone: string; // e.g. "Europe/Helsinki"

  notificationSettings: NotificationSettings;

  createdAt: string;
  updatedAt: string;

  lastRunAt: string | null;
  nextRunAt: string | null;
}

export type SearchRunStatus = 'SUCCESS' | 'FAILED' | 'PARTIAL';

export interface SearchRun {
  id: string;
  savedSearchId: string;

  startedAt: string;
  completedAt: string | null;

  status: SearchRunStatus;

  totalFound: number;
  newProperties: number;
  priceChanges: number;
  removedProperties: number;
  matchingProperties: number;

  errorMessage?: string | null;
}

export interface SearchRunResult {
  searchRun: SearchRun;
  newPropertyIds: string[];
  priceChangePropertyIds: string[];
  totalScanned: number;
}
