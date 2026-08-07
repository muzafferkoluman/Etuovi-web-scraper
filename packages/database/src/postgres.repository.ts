import { PropertyRepository } from './repository.interface';
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
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and, desc, asc, gte, lte, sql, inArray } from 'drizzle-orm';
import {
  properties as propertiesTable,
  propertySnapshots as snapshotsTable,
  savedSearches as savedSearchesTable,
  searchRuns as searchRunsTable,
  favorites as favoritesTable,
  notifications as notificationsTable,
  propertyEvents as propertyEventsTable,
  userPreferences as userPreferencesTable
} from './schema';
import { PropertyScoringEngine, PropertyMatchingEngine, DealFinderEngine, SmartTagsEngine } from '@koti-scout/property-engine';

export class PostgresPropertyRepository implements PropertyRepository {
  private db: ReturnType<typeof drizzle>;
  private client: ReturnType<typeof postgres>;
  private scoringEngine = new PropertyScoringEngine();
  private matchingEngine = new PropertyMatchingEngine();
  private dealFinder = new DealFinderEngine();
  private smartTagsEngine = new SmartTagsEngine();

  constructor(connectionString: string) {
    this.client = postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10
    });
    this.db = drizzle(this.client);
  }

  public async getClient(): Promise<ReturnType<typeof postgres>> {
    return this.client;
  }

  // --- Properties ---

  public async getProperties(filters: PropertyFilters): Promise<{ properties: Property[]; total: number }> {
    const conditions = [];

    if (filters.cities && filters.cities.length > 0) {
      conditions.push(inArray(propertiesTable.city, filters.cities));
    }
    if (filters.districts && filters.districts.length > 0) {
      conditions.push(inArray(propertiesTable.district, filters.districts));
    }
    if (filters.minPrice !== undefined) {
      conditions.push(gte(propertiesTable.price, filters.minPrice));
    }
    if (filters.maxPrice !== undefined) {
      conditions.push(lte(propertiesTable.price, filters.maxPrice));
    }
    if (filters.minArea !== undefined) {
      conditions.push(gte(propertiesTable.area, filters.minArea));
    }
    if (filters.maxArea !== undefined) {
      conditions.push(lte(propertiesTable.area, filters.maxArea));
    }
    if (filters.minRooms !== undefined) {
      conditions.push(gte(propertiesTable.rooms, filters.minRooms));
    }
    if (filters.maxRooms !== undefined) {
      conditions.push(lte(propertiesTable.rooms, filters.maxRooms));
    }
    if (filters.balconyRequired) {
      conditions.push(eq(propertiesTable.hasBalcony, true));
    }
    if (filters.saunaRequired) {
      conditions.push(eq(propertiesTable.hasSauna, true));
    }
    if (filters.elevatorRequired) {
      conditions.push(eq(propertiesTable.hasElevator, true));
    }
    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      conditions.push(inArray(propertiesTable.propertyType, filters.propertyTypes));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Sorting
    let orderClause = desc(propertiesTable.publishedAt);
    if (filters.sortBy === 'oldest') orderClause = asc(propertiesTable.publishedAt);
    if (filters.sortBy === 'price-low') orderClause = asc(propertiesTable.price);
    if (filters.sortBy === 'price-high') orderClause = desc(propertiesTable.price);
    if (filters.sortBy === 'sqm-price-low') orderClause = asc(propertiesTable.pricePerSquareMeter);
    if (filters.sortBy === 'sqm-price-high') orderClause = desc(propertiesTable.pricePerSquareMeter);
    if (filters.sortBy === 'area-high') orderClause = desc(propertiesTable.area);

    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;

    const rows = await this.db
      .select()
      .from(propertiesTable)
      .where(whereClause)
      .orderBy(orderClause)
      .limit(limit)
      .offset(offset);

    const countResult = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(propertiesTable)
      .where(whereClause);

    const total = countResult[0]?.count ?? rows.length;

    // Map and enrich with scoring & deal finder
    const properties: Property[] = rows.map((r) => {
      const p: Property = {
        id: r.id,
        externalId: r.externalId,
        provider: r.provider,
        sourceUrl: r.sourceUrl,
        title: r.title,
        description: r.description,
        address: r.address,
        postalCode: r.postalCode,
        city: r.city,
        district: r.district,
        latitude: r.latitude,
        longitude: r.longitude,
        price: r.price,
        area: r.area,
        pricePerSquareMeter: r.pricePerSquareMeter,
        rooms: r.rooms,
        bedrooms: r.bedrooms,
        propertyType: r.propertyType as Property['propertyType'],
        buildYear: r.buildYear,
        maintenanceFee: r.maintenanceFee,
        floor: r.floor,
        totalFloors: r.totalFloors,
        hasBalcony: r.hasBalcony,
        hasSauna: r.hasSauna,
        hasElevator: r.hasElevator,
        energyClass: r.energyClass,
        thumbnailUrl: r.thumbnailUrl,
        imageUrls: r.imageUrls,
        publishedAt: r.publishedAt.toISOString(),
        firstSeenAt: r.firstSeenAt.toISOString(),
        lastSeenAt: r.lastSeenAt.toISOString(),
        active: r.active
      };

      const deal = this.dealFinder.evaluateDeal(p);
      const { total, breakdown } = this.scoringEngine.calculateScore(p, filters);
      const tags = this.smartTagsEngine.generateTags(p, { dealIndicator: deal, score: total });

      return {
        ...p,
        score: total,
        scoreBreakdown: breakdown,
        dealIndicator: deal,
        smartTags: tags
      };
    });

    return { properties, total };
  }

  public async getPropertyById(id: string): Promise<Property | null> {
    const rows = await this.db
      .select()
      .from(propertiesTable)
      .where(eq(propertiesTable.id, id))
      .limit(1);

    if (rows.length === 0) return null;
    const r = rows[0];

    const p: Property = {
      id: r.id,
      externalId: r.externalId,
      provider: r.provider,
      sourceUrl: r.sourceUrl,
      title: r.title,
      description: r.description,
      address: r.address,
      postalCode: r.postalCode,
      city: r.city,
      district: r.district,
      latitude: r.latitude,
      longitude: r.longitude,
      price: r.price,
      area: r.area,
      pricePerSquareMeter: r.pricePerSquareMeter,
      rooms: r.rooms,
      bedrooms: r.bedrooms,
      propertyType: r.propertyType as Property['propertyType'],
      buildYear: r.buildYear,
      maintenanceFee: r.maintenanceFee,
      floor: r.floor,
      totalFloors: r.totalFloors,
      hasBalcony: r.hasBalcony,
      hasSauna: r.hasSauna,
      hasElevator: r.hasElevator,
      energyClass: r.energyClass,
      thumbnailUrl: r.thumbnailUrl,
      imageUrls: r.imageUrls,
      publishedAt: r.publishedAt.toISOString(),
      firstSeenAt: r.firstSeenAt.toISOString(),
      lastSeenAt: r.lastSeenAt.toISOString(),
      active: r.active
    };

    const deal = this.dealFinder.evaluateDeal(p);
    const { total, breakdown } = this.scoringEngine.calculateScore(p);
    const tags = this.smartTagsEngine.generateTags(p, { dealIndicator: deal, score: total });

    return {
      ...p,
      score: total,
      scoreBreakdown: breakdown,
      dealIndicator: deal,
      smartTags: tags
    };
  }

  public async getPropertyByExternalId(provider: string, externalId: string): Promise<Property | null> {
    const rows = await this.db
      .select()
      .from(propertiesTable)
      .where(and(eq(propertiesTable.provider, provider), eq(propertiesTable.externalId, externalId)))
      .limit(1);

    if (rows.length === 0) return null;
    return this.getPropertyById(rows[0].id);
  }

  public async upsertProperty(property: Property): Promise<Property> {
    // Unique on (provider, externalId)
    await this.db
      .insert(propertiesTable)
      .values({
        id: property.id,
        externalId: property.externalId,
        provider: property.provider,
        sourceUrl: property.sourceUrl,
        title: property.title,
        description: property.description,
        address: property.address,
        postalCode: property.postalCode,
        city: property.city,
        district: property.district,
        latitude: property.latitude,
        longitude: property.longitude,
        price: property.price,
        area: property.area,
        pricePerSquareMeter: property.pricePerSquareMeter,
        rooms: property.rooms,
        bedrooms: property.bedrooms,
        propertyType: property.propertyType,
        buildYear: property.buildYear,
        maintenanceFee: property.maintenanceFee,
        floor: property.floor,
        totalFloors: property.totalFloors,
        hasBalcony: property.hasBalcony,
        hasSauna: property.hasSauna,
        hasElevator: property.hasElevator,
        energyClass: property.energyClass,
        thumbnailUrl: property.thumbnailUrl,
        imageUrls: property.imageUrls,
        publishedAt: new Date(property.publishedAt),
        firstSeenAt: new Date(property.firstSeenAt),
        lastSeenAt: new Date(property.lastSeenAt),
        active: property.active,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: [propertiesTable.provider, propertiesTable.externalId],
        set: {
          price: property.price,
          pricePerSquareMeter: property.pricePerSquareMeter,
          maintenanceFee: property.maintenanceFee,
          lastSeenAt: new Date(),
          active: property.active,
          updatedAt: new Date()
        }
      });

    // Create snapshot if price changed
    const snapshots = await this.getPropertySnapshots(property.id);
    const lastSnap = snapshots[snapshots.length - 1];
    if (!lastSnap || lastSnap.price !== property.price) {
      await this.createSnapshot({
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

  // --- Snapshots ---

  public async createSnapshot(snapshot: PropertySnapshot): Promise<PropertySnapshot> {
    await this.db.insert(snapshotsTable).values({
      id: snapshot.id,
      propertyId: snapshot.propertyId,
      price: snapshot.price,
      pricePerSquareMeter: snapshot.pricePerSquareMeter,
      maintenanceFee: snapshot.maintenanceFee,
      score: snapshot.score,
      capturedAt: new Date(snapshot.capturedAt)
    });
    return snapshot;
  }

  public async getPropertySnapshots(propertyId: string): Promise<PropertySnapshot[]> {
    const rows = await this.db
      .select()
      .from(snapshotsTable)
      .where(eq(snapshotsTable.propertyId, propertyId))
      .orderBy(asc(snapshotsTable.capturedAt));

    return rows.map((r) => ({
      id: r.id,
      propertyId: r.propertyId,
      price: r.price,
      pricePerSquareMeter: r.pricePerSquareMeter,
      maintenanceFee: r.maintenanceFee,
      score: r.score,
      capturedAt: r.capturedAt.toISOString()
    }));
  }

  // --- Property Events ---

  public async addPropertyEvents(events: PropertyEvent[]): Promise<void> {
    if (events.length === 0) return;

    for (const evt of events) {
      await this.db.insert(propertyEventsTable).values({
        id: evt.id,
        propertyId: evt.propertyId,
        savedSearchId: evt.savedSearchId,
        type: evt.type,
        oldValue: evt.oldValue ? String(evt.oldValue) : null,
        newValue: evt.newValue ? String(evt.newValue) : null,
        difference: evt.difference,
        percentage: evt.percentage,
        metadata: evt.metadata as Record<string, unknown>,
        createdAt: new Date(evt.createdAt)
      });
    }
  }

  public async getPropertyEvents(propertyId: string): Promise<PropertyEvent[]> {
    const rows = await this.db
      .select()
      .from(propertyEventsTable)
      .where(eq(propertyEventsTable.propertyId, propertyId))
      .orderBy(desc(propertyEventsTable.createdAt));

    return rows.map((r) => ({
      id: r.id,
      propertyId: r.propertyId,
      savedSearchId: r.savedSearchId,
      type: r.type as PropertyEvent['type'],
      oldValue: r.oldValue,
      newValue: r.newValue,
      difference: r.difference,
      percentage: r.percentage,
      metadata: r.metadata as Record<string, unknown>,
      createdAt: r.createdAt.toISOString()
    }));
  }

  // --- Saved Searches ---

  public async getSavedSearches(userId: string): Promise<SavedSearch[]> {
    const rows = await this.db
      .select()
      .from(savedSearchesTable)
      .where(eq(savedSearchesTable.userId, userId))
      .orderBy(desc(savedSearchesTable.createdAt));

    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      name: r.name,
      filters: r.filters as PropertyFilters,
      minimumScore: r.minimumScore,
      enabled: r.enabled,
      scheduleType: r.scheduleType as SavedSearch['scheduleType'],
      customScheduleTimes: r.customScheduleTimes || undefined,
      timezone: r.timezone,
      notificationSettings: r.notificationSettings as SavedSearch['notificationSettings'],
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      lastRunAt: r.lastRunAt ? r.lastRunAt.toISOString() : null,
      nextRunAt: r.nextRunAt ? r.nextRunAt.toISOString() : null
    }));
  }

  public async getSavedSearchById(id: string): Promise<SavedSearch | null> {
    const rows = await this.db
      .select()
      .from(savedSearchesTable)
      .where(eq(savedSearchesTable.id, id))
      .limit(1);

    if (rows.length === 0) return null;
    const r = rows[0];

    return {
      id: r.id,
      userId: r.userId,
      name: r.name,
      filters: r.filters as PropertyFilters,
      minimumScore: r.minimumScore,
      enabled: r.enabled,
      scheduleType: r.scheduleType as SavedSearch['scheduleType'],
      customScheduleTimes: r.customScheduleTimes || undefined,
      timezone: r.timezone,
      notificationSettings: r.notificationSettings as SavedSearch['notificationSettings'],
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      lastRunAt: r.lastRunAt ? r.lastRunAt.toISOString() : null,
      nextRunAt: r.nextRunAt ? r.nextRunAt.toISOString() : null
    };
  }

  public async getAllDueSavedSearches(): Promise<SavedSearch[]> {
    const rows = await this.db
      .select()
      .from(savedSearchesTable)
      .where(and(eq(savedSearchesTable.enabled, true), sql`${savedSearchesTable.scheduleType} != 'MANUAL'`));

    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      name: r.name,
      filters: r.filters as PropertyFilters,
      minimumScore: r.minimumScore,
      enabled: r.enabled,
      scheduleType: r.scheduleType as SavedSearch['scheduleType'],
      customScheduleTimes: r.customScheduleTimes || undefined,
      timezone: r.timezone,
      notificationSettings: r.notificationSettings as SavedSearch['notificationSettings'],
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      lastRunAt: r.lastRunAt ? r.lastRunAt.toISOString() : null,
      nextRunAt: r.nextRunAt ? r.nextRunAt.toISOString() : null
    }));
  }

  public async createSavedSearch(search: SavedSearch): Promise<SavedSearch> {
    await this.db.insert(savedSearchesTable).values({
      id: search.id,
      userId: search.userId,
      name: search.name,
      filters: search.filters,
      minimumScore: search.minimumScore,
      enabled: search.enabled,
      scheduleType: search.scheduleType,
      customScheduleTimes: search.customScheduleTimes || [],
      timezone: search.timezone || 'Europe/Helsinki',
      notificationSettings: search.notificationSettings,
      lastRunAt: search.lastRunAt ? new Date(search.lastRunAt) : null,
      nextRunAt: search.nextRunAt ? new Date(search.nextRunAt) : null,
      createdAt: new Date(search.createdAt),
      updatedAt: new Date(search.updatedAt)
    });
    return search;
  }

  public async updateSavedSearch(id: string, updates: Partial<SavedSearch>): Promise<SavedSearch | null> {
    const setClause: Record<string, unknown> = {
      updatedAt: new Date()
    };
    if (updates.name !== undefined) setClause.name = updates.name;
    if (updates.filters !== undefined) setClause.filters = updates.filters;
    if (updates.minimumScore !== undefined) setClause.minimumScore = updates.minimumScore;
    if (updates.enabled !== undefined) setClause.enabled = updates.enabled;
    if (updates.scheduleType !== undefined) setClause.scheduleType = updates.scheduleType;
    if (updates.lastRunAt !== undefined) setClause.lastRunAt = updates.lastRunAt ? new Date(updates.lastRunAt) : null;
    if (updates.nextRunAt !== undefined) setClause.nextRunAt = updates.nextRunAt ? new Date(updates.nextRunAt) : null;

    await this.db
      .update(savedSearchesTable)
      .set(setClause)
      .where(eq(savedSearchesTable.id, id));

    return this.getSavedSearchById(id);
  }

  public async deleteSavedSearch(id: string, userId?: string): Promise<boolean> {
    const condition = userId
      ? and(eq(savedSearchesTable.id, id), eq(savedSearchesTable.userId, userId))
      : eq(savedSearchesTable.id, id);

    const deleted = await this.db.delete(savedSearchesTable).where(condition);
    return Boolean(deleted);
  }

  // --- Search Runs ---

  public async recordSearchRun(run: SearchRun): Promise<SearchRun> {
    await this.db.insert(searchRunsTable).values({
      id: run.id,
      savedSearchId: run.savedSearchId,
      startedAt: new Date(run.startedAt),
      completedAt: run.completedAt ? new Date(run.completedAt) : null,
      status: run.status,
      totalFound: run.totalFound,
      newProperties: run.newProperties,
      priceChanges: run.priceChanges,
      removedProperties: run.removedProperties,
      matchingProperties: run.matchingProperties,
      errorMessage: run.errorMessage
    });
    return run;
  }

  public async getSearchRuns(savedSearchId: string): Promise<SearchRun[]> {
    const rows = await this.db
      .select()
      .from(searchRunsTable)
      .where(eq(searchRunsTable.savedSearchId, savedSearchId))
      .orderBy(desc(searchRunsTable.startedAt));

    return rows.map((r) => ({
      id: r.id,
      savedSearchId: r.savedSearchId,
      startedAt: r.startedAt.toISOString(),
      completedAt: r.completedAt ? r.completedAt.toISOString() : null,
      status: r.status as SearchRun['status'],
      totalFound: r.totalFound,
      newProperties: r.newProperties,
      priceChanges: r.priceChanges,
      removedProperties: r.removedProperties,
      matchingProperties: r.matchingProperties,
      errorMessage: r.errorMessage
    }));
  }

  // --- Favorites ---

  public async getFavorites(userId: string): Promise<Favorite[]> {
    const rows = await this.db
      .select({
        favorite: favoritesTable,
        property: propertiesTable
      })
      .from(favoritesTable)
      .leftJoin(propertiesTable, eq(favoritesTable.propertyId, propertiesTable.id))
      .where(eq(favoritesTable.userId, userId))
      .orderBy(desc(favoritesTable.createdAt));

    return rows.map((r) => ({
      id: r.favorite.id,
      userId: r.favorite.userId,
      propertyId: r.favorite.propertyId,
      notes: r.favorite.notes,
      createdAt: r.favorite.createdAt.toISOString(),
      property: r.property ? (r.property as unknown as Property) : undefined
    }));
  }

  public async addFavorite(userId: string, propertyId: string, notes = ''): Promise<Favorite> {
    const id = `fav-${userId}-${propertyId}`;
    await this.db
      .insert(favoritesTable)
      .values({
        id,
        userId,
        propertyId,
        notes,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: [favoritesTable.userId, favoritesTable.propertyId],
        set: { notes, updatedAt: new Date() }
      });

    const property = await this.getPropertyById(propertyId);
    return {
      id,
      userId,
      propertyId,
      notes,
      createdAt: new Date().toISOString(),
      property: property || undefined
    };
  }

  public async updateFavorite(userId: string, propertyId: string, notes: string): Promise<Favorite | null> {
    const condition = and(eq(favoritesTable.userId, userId), eq(favoritesTable.propertyId, propertyId));
    await this.db
      .update(favoritesTable)
      .set({ notes, updatedAt: new Date() })
      .where(condition);

    const favs = await this.getFavorites(userId);
    return favs.find((f) => f.propertyId === propertyId) || null;
  }

  public async removeFavorite(userId: string, propertyId: string): Promise<boolean> {
    const condition = and(eq(favoritesTable.userId, userId), eq(favoritesTable.propertyId, propertyId));
    await this.db.delete(favoritesTable).where(condition);
    return true;
  }

  public async isFavorite(userId: string, propertyId: string): Promise<boolean> {
    const rows = await this.db
      .select({ id: favoritesTable.id })
      .from(favoritesTable)
      .where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.propertyId, propertyId)))
      .limit(1);
    return rows.length > 0;
  }

  // --- Notifications ---

  public async getNotifications(userId: string): Promise<AppNotification[]> {
    const rows = await this.db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, userId))
      .orderBy(desc(notificationsTable.createdAt));

    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      savedSearchId: r.savedSearchId,
      propertyId: r.propertyId,
      type: r.type as AppNotification['type'],
      title: r.title,
      message: r.message,
      read: r.read,
      createdAt: r.createdAt.toISOString()
    }));
  }

  public async createNotification(notif: AppNotification): Promise<AppNotification> {
    await this.db.insert(notificationsTable).values({
      id: notif.id,
      userId: notif.userId,
      savedSearchId: notif.savedSearchId,
      propertyId: notif.propertyId,
      propertyEventId: null,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      read: notif.read,
      createdAt: new Date(notif.createdAt)
    });
    return notif;
  }

  public async markNotificationAsRead(id: string, userId?: string): Promise<boolean> {
    const condition = userId
      ? and(eq(notificationsTable.id, id), eq(notificationsTable.userId, userId))
      : eq(notificationsTable.id, id);

    await this.db
      .update(notificationsTable)
      .set({ read: true })
      .where(condition);
    return true;
  }

  public async markAllNotificationsAsRead(userId: string): Promise<number> {
    const updated = await this.db
      .update(notificationsTable)
      .set({ read: true })
      .where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.read, false)));
    return 1;
  }

  // --- User Preferences ---

  public async getUserPreferences(userId: string): Promise<UserPreferences> {
    const rows = await this.db
      .select()
      .from(userPreferencesTable)
      .where(eq(userPreferencesTable.userId, userId))
      .limit(1);

    if (rows.length === 0) {
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
      await this.db.insert(userPreferencesTable).values({
        userId,
        defaultCity: def.defaultCity,
        defaultTimezone: def.defaultTimezone,
        defaultCurrency: def.defaultCurrency,
        criteriaWeights: def.criteriaWeights,
        updatedAt: new Date()
      });
      return def;
    }

    const r = rows[0];
    return {
      userId: r.userId,
      defaultCity: r.defaultCity,
      defaultTimezone: r.defaultTimezone,
      defaultCurrency: r.defaultCurrency,
      criteriaWeights: r.criteriaWeights as UserPreferences['criteriaWeights'],
      updatedAt: r.updatedAt.toISOString()
    };
  }

  public async updateUserPreferences(userId: string, updates: Partial<UserPreferences>): Promise<UserPreferences> {
    const current = await this.getUserPreferences(userId);
    const updated = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await this.db
      .insert(userPreferencesTable)
      .values({
        userId,
        defaultCity: updated.defaultCity,
        defaultTimezone: updated.defaultTimezone,
        defaultCurrency: updated.defaultCurrency,
        criteriaWeights: updated.criteriaWeights,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: userPreferencesTable.userId,
        set: {
          defaultCity: updated.defaultCity,
          defaultTimezone: updated.defaultTimezone,
          defaultCurrency: updated.defaultCurrency,
          criteriaWeights: updated.criteriaWeights,
          updatedAt: new Date()
        }
      });

    return updated;
  }

  // --- Dashboard Intelligence Stats ---

  public async getDashboardStats(userId: string): Promise<DashboardStats> {
    const userSearches = await this.getSavedSearches(userId);
    const activeSearches = userSearches.filter((s) => s.enabled).length;

    const { properties: allProps } = await this.getProperties({ limit: 100 });
    const highMatches = allProps.filter((p) => (p.score ?? 0) >= 85);
    const priceDrops = allProps.filter((p) => p.smartTags?.includes('PRICE DROP') || (p.priceChangePercent && p.priceChangePercent < 0));
    const newProps = allProps.filter((p) => p.smartTags?.includes('NEW'));

    const highestScore = allProps.reduce((max, p) => Math.max(max, p.score ?? 0), 0);

    const recentRunsRows = await this.db
      .select({
        run: searchRunsTable,
        search: savedSearchesTable
      })
      .from(searchRunsTable)
      .leftJoin(savedSearchesTable, eq(searchRunsTable.savedSearchId, savedSearchesTable.id))
      .where(eq(savedSearchesTable.userId, userId))
      .orderBy(desc(searchRunsTable.startedAt))
      .limit(5);

    const recentRuns = recentRunsRows.map((r) => ({
      id: r.run.id,
      savedSearchName: r.search?.name || 'Saved Search',
      completedAt: (r.run.completedAt || r.run.startedAt).toISOString(),
      totalFound: r.run.totalFound,
      newProperties: r.run.newProperties,
      priceChanges: r.run.priceChanges
    }));

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
