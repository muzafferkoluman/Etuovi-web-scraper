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
import { MOCK_PROPERTIES, MOCK_SNAPSHOTS, MOCK_SAVED_SEARCHES, MOCK_NOTIFICATIONS } from './seed-data';
import { PropertyScoringEngine } from '@koti-scout/property-engine';
import { PropertyMatchingEngine } from '@koti-scout/property-engine';
import { DealFinderEngine } from '@koti-scout/property-engine';
import { SmartTagsEngine } from '@koti-scout/property-engine';

export class PropertyDatabase {
  private properties: Map<string, Property> = new Map();
  private snapshots: PropertySnapshot[] = [];
  private savedSearches: Map<string, SavedSearch> = new Map();
  private searchRuns: SearchRun[] = [];
  private favorites: Map<string, Favorite> = new Map();
  private notifications: AppNotification[] = [];
  private propertyEvents: PropertyEvent[] = [];
  private preferences: Map<string, UserPreferences> = new Map();

  private scoringEngine = new PropertyScoringEngine();
  private matchingEngine = new PropertyMatchingEngine();
  private dealFinder = new DealFinderEngine();
  private smartTagsEngine = new SmartTagsEngine();

  constructor() {
    this.seedDefaults();
  }

  public seedDefaults() {
    this.properties.clear();
    this.snapshots = [...MOCK_SNAPSHOTS];
    this.savedSearches.clear();
    this.favorites.clear();
    this.notifications = [...MOCK_NOTIFICATIONS];
    this.searchRuns = [];
    this.propertyEvents = [];

    // Seed properties with score and deal calculation
    for (const rawProp of MOCK_PROPERTIES) {
      const deal = this.dealFinder.evaluateDeal(rawProp);
      const { total, breakdown } = this.scoringEngine.calculateScore(rawProp);
      const tags = this.smartTagsEngine.generateTags(rawProp, { dealIndicator: deal, score: total });

      const enriched: Property = {
        ...rawProp,
        score: total,
        scoreBreakdown: breakdown,
        dealIndicator: deal,
        smartTags: tags
      };
      this.properties.set(enriched.id, enriched);
    }

    // Seed saved searches
    for (const search of MOCK_SAVED_SEARCHES) {
      this.savedSearches.set(search.id, search);
    }

    // Seed initial search runs
    this.searchRuns.push(
      {
        id: 'run-01',
        savedSearchId: 'search-hel-invest-01',
        startedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 2 * 3600 * 1000 + 400).toISOString(),
        status: 'SUCCESS',
        totalFound: 94,
        newProperties: 3,
        priceChanges: 2,
        removedProperties: 0,
        matchingProperties: 12
      },
      {
        id: 'run-02',
        savedSearchId: 'search-esp-family-02',
        startedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 8 * 3600 * 1000 + 350).toISOString(),
        status: 'SUCCESS',
        totalFound: 48,
        newProperties: 1,
        priceChanges: 1,
        removedProperties: 0,
        matchingProperties: 6
      }
    );

    // Seed demo favorite
    const favProp = this.properties.get('prop-hel-kallio-01');
    if (favProp) {
      this.favorites.set('fav-01', {
        id: 'fav-01',
        userId: 'user-demo-01',
        propertyId: 'prop-hel-kallio-01',
        notes: 'Hyvä sijainti Karhupuiston lähellä. Putkiremppa tehty 2018.',
        createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        property: favProp
      });
    }

    // Default user preferences
    this.preferences.set('user-demo-01', {
      userId: 'user-demo-01',
      defaultCity: 'Helsinki',
      defaultTimezone: 'Europe/Helsinki',
      defaultCurrency: 'EUR',
      criteriaWeights: {
        price: 25,
        area: 15,
        location: 20,
        buildYear: 10,
        maintenanceFee: 10,
        pricePerSquareMeter: 10,
        features: 10
      },
      updatedAt: new Date().toISOString()
    });
  }

  // --- Properties ---

  public async getProperties(filters: PropertyFilters): Promise<{ properties: Property[]; total: number }> {
    const all = Array.from(this.properties.values());
    const matched = all.filter(p => this.matchingEngine.matches(p, filters));
    const sorted = this.matchingEngine.sortProperties(matched, filters.sortBy);

    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;
    const paginated = sorted.slice(offset, offset + limit);

    return {
      properties: paginated,
      total: matched.length
    };
  }

  public async getPropertyById(id: string): Promise<Property | null> {
    return this.properties.get(id) || null;
  }

  public async upsertProperty(property: Property): Promise<Property> {
    const existing = this.properties.get(property.id);
    this.properties.set(property.id, property);

    // Save snapshot on price or score change
    if (!existing || existing.price !== property.price || existing.score !== property.score) {
      this.snapshots.push({
        id: `snap-${property.id}-${Date.now()}`,
        propertyId: property.id,
        price: property.price,
        pricePerSquareMeter: property.pricePerSquareMeter,
        maintenanceFee: property.maintenanceFee,
        score: property.score ?? null,
        capturedAt: new Date().toISOString()
      });
    }

    return property;
  }

  public async getPropertySnapshots(propertyId: string): Promise<PropertySnapshot[]> {
    return this.snapshots
      .filter(s => s.propertyId === propertyId)
      .sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime());
  }

  public async getPropertyEvents(propertyId: string): Promise<PropertyEvent[]> {
    return this.propertyEvents
      .filter(e => e.propertyId === propertyId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async addPropertyEvents(events: PropertyEvent[]): Promise<void> {
    this.propertyEvents.push(...events);
  }

  // --- Saved Searches ---

  public async getSavedSearches(userId: string): Promise<SavedSearch[]> {
    return Array.from(this.savedSearches.values())
      .filter(s => s.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getSavedSearchById(id: string): Promise<SavedSearch | null> {
    return this.savedSearches.get(id) || null;
  }

  public async getAllDueSavedSearches(): Promise<SavedSearch[]> {
    return Array.from(this.savedSearches.values()).filter(s => s.enabled && s.scheduleType !== 'MANUAL');
  }

  public async createSavedSearch(search: SavedSearch): Promise<SavedSearch> {
    this.savedSearches.set(search.id, search);
    return search;
  }

  public async updateSavedSearch(id: string, updates: Partial<SavedSearch>): Promise<SavedSearch | null> {
    const existing = this.savedSearches.get(id);
    if (!existing) return null;
    const updated: SavedSearch = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.savedSearches.set(id, updated);
    return updated;
  }

  public async deleteSavedSearch(id: string): Promise<boolean> {
    return this.savedSearches.delete(id);
  }

  // --- Search Runs ---

  public async recordSearchRun(run: SearchRun): Promise<SearchRun> {
    this.searchRuns.push(run);
    return run;
  }

  public async getSearchRuns(savedSearchId: string): Promise<SearchRun[]> {
    return this.searchRuns
      .filter(r => r.savedSearchId === savedSearchId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  // --- Favorites ---

  public async getFavorites(userId: string): Promise<Favorite[]> {
    const favs = Array.from(this.favorites.values()).filter(f => f.userId === userId);
    return favs.map(f => ({
      ...f,
      property: this.properties.get(f.propertyId) || f.property
    }));
  }

  public async addFavorite(userId: string, propertyId: string, notes = ''): Promise<Favorite> {
    const id = `fav-${userId}-${propertyId}`;
    const property = this.properties.get(propertyId);
    const fav: Favorite = {
      id,
      userId,
      propertyId,
      notes,
      createdAt: new Date().toISOString(),
      property
    };
    this.favorites.set(id, fav);
    return fav;
  }

  public async updateFavorite(userId: string, propertyId: string, notes: string): Promise<Favorite | null> {
    const id = `fav-${userId}-${propertyId}`;
    const existing = this.favorites.get(id);
    if (!existing) return null;
    existing.notes = notes;
    return existing;
  }

  public async removeFavorite(userId: string, propertyId: string): Promise<boolean> {
    const id = `fav-${userId}-${propertyId}`;
    return this.favorites.delete(id);
  }

  public async isFavorite(userId: string, propertyId: string): Promise<boolean> {
    return this.favorites.has(`fav-${userId}-${propertyId}`);
  }

  // --- Notifications ---

  public async getNotifications(userId: string): Promise<AppNotification[]> {
    return this.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async markNotificationAsRead(id: string): Promise<boolean> {
    const notif = this.notifications.find(n => n.id === id);
    if (!notif) return false;
    notif.read = true;
    return true;
  }

  public async markAllNotificationsAsRead(userId: string): Promise<number> {
    let count = 0;
    for (const n of this.notifications) {
      if (n.userId === userId && !n.read) {
        n.read = true;
        count++;
      }
    }
    return count;
  }

  public async createNotification(notif: AppNotification): Promise<AppNotification> {
    this.notifications.unshift(notif);
    return notif;
  }

  // --- User Preferences ---

  public async getUserPreferences(userId: string): Promise<UserPreferences> {
    const existing = this.preferences.get(userId);
    if (existing) return existing;
    const def: UserPreferences = {
      userId,
      defaultCity: 'Helsinki',
      defaultTimezone: 'Europe/Helsinki',
      defaultCurrency: 'EUR',
      criteriaWeights: {
        price: 25,
        area: 15,
        location: 20,
        buildYear: 10,
        maintenanceFee: 10,
        pricePerSquareMeter: 10,
        features: 10
      },
      updatedAt: new Date().toISOString()
    };
    this.preferences.set(userId, def);
    return def;
  }

  public async updateUserPreferences(userId: string, updates: Partial<UserPreferences>): Promise<UserPreferences> {
    const current = await this.getUserPreferences(userId);
    const updated = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.preferences.set(userId, updated);
    return updated;
  }

  // --- Dashboard Intelligence Stats ---

  public async getDashboardStats(userId: string): Promise<DashboardStats> {
    const userSearches = await this.getSavedSearches(userId);
    const activeSearches = userSearches.filter(s => s.enabled).length;

    const allProps = Array.from(this.properties.values());
    const highMatches = allProps.filter(p => (p.score ?? 0) >= 85);
    const priceDrops = allProps.filter(p => p.smartTags?.includes('PRICE DROP') || (p.priceChangePercent && p.priceChangePercent < 0));
    const newProps = allProps.filter(p => p.smartTags?.includes('NEW'));

    const highestScore = allProps.reduce((max, p) => Math.max(max, p.score ?? 0), 0);

    const recentRuns = this.searchRuns.slice(-5).map(r => {
      const search = this.savedSearches.get(r.savedSearchId);
      return {
        id: r.id,
        savedSearchName: search?.name || 'Saved Search',
        completedAt: r.completedAt || r.startedAt,
        totalFound: r.totalFound,
        newProperties: r.newProperties,
        priceChanges: r.priceChanges
      };
    });

    return {
      activeSearches,
      checkedToday: 164,
      newListings: newProps.length || 7,
      priceDrops: priceDrops.length || 3,
      highMatchCount: highMatches.length,
      bestMatchScore: highestScore || 96,
      recentRuns
    };
  }
}

// Global Singleton for database repository
export const dbRepository = new PropertyDatabase();
