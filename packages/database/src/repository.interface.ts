import {
  Property,
  PropertyFilters,
  SavedSearch,
  SearchRun,
  AppNotification,
  Favorite,
  PropertySnapshot,
  PropertyEvent,
  UserPreferences,
  DashboardStats
} from '@koti-scout/shared';

export interface PropertyRepository {
  // Properties
  getProperties(filters: PropertyFilters): Promise<{ properties: Property[]; total: number }>;
  getPropertyById(id: string): Promise<Property | null>;
  getPropertyByExternalId(provider: string, externalId: string): Promise<Property | null>;
  upsertProperty(property: Property): Promise<Property>;

  // Property Snapshots & History
  createSnapshot(snapshot: PropertySnapshot): Promise<PropertySnapshot>;
  getPropertySnapshots(propertyId: string): Promise<PropertySnapshot[]>;

  // Property Events (Diffs)
  addPropertyEvents(events: PropertyEvent[]): Promise<void>;
  getPropertyEvents(propertyId: string): Promise<PropertyEvent[]>;

  // Saved Searches
  getSavedSearches(userId: string): Promise<SavedSearch[]>;
  getSavedSearchById(id: string): Promise<SavedSearch | null>;
  getAllDueSavedSearches(): Promise<SavedSearch[]>;
  createSavedSearch(search: SavedSearch): Promise<SavedSearch>;
  updateSavedSearch(id: string, updates: Partial<SavedSearch>): Promise<SavedSearch | null>;
  deleteSavedSearch(id: string, userId?: string): Promise<boolean>;

  // Search Runs
  recordSearchRun(run: SearchRun): Promise<SearchRun>;
  getSearchRuns(savedSearchId: string): Promise<SearchRun[]>;

  // Favorites
  getFavorites(userId: string): Promise<Favorite[]>;
  addFavorite(userId: string, propertyId: string, notes?: string): Promise<Favorite>;
  updateFavorite(userId: string, propertyId: string, notes: string): Promise<Favorite | null>;
  removeFavorite(userId: string, propertyId: string): Promise<boolean>;
  isFavorite(userId: string, propertyId: string): Promise<boolean>;

  // Notifications
  getNotifications(userId: string): Promise<AppNotification[]>;
  createNotification(notif: AppNotification): Promise<AppNotification>;
  markNotificationAsRead(id: string, userId?: string): Promise<boolean>;
  markAllNotificationsAsRead(userId: string): Promise<number>;

  // User Preferences
  getUserPreferences(userId: string): Promise<UserPreferences>;
  updateUserPreferences(userId: string, updates: Partial<UserPreferences>): Promise<UserPreferences>;

  // Dashboard Stats
  getDashboardStats(userId: string): Promise<DashboardStats>;

  // Dev state reset
  resetDefaults?(): Promise<void>;
}
