import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryPropertyRepository } from '../src/in-memory.repository';
import { Property, SavedSearch, AppNotification } from '@koti-scout/shared';

describe('Property Repository Integration Tests', () => {
  let repo: InMemoryPropertyRepository;

  beforeEach(() => {
    repo = new InMemoryPropertyRepository();
  });

  it('verifies property upsert and price history snapshot generation', async () => {
    const testProp: Property = {
      id: 'prop-test-01',
      externalId: 'ext-test-101',
      provider: 'MockPropertyProvider',
      sourceUrl: 'https://demo.kotiscout.fi/test-101',
      title: 'Modern Apartment in Kamppi',
      description: 'Bright city apartment',
      address: 'Urho Kekkosen katu 8',
      postalCode: '00100',
      city: 'Helsinki',
      district: 'Kamppi',
      price: 320000,
      area: 50,
      pricePerSquareMeter: 6400,
      rooms: 2,
      propertyType: 'Apartment',
      publishedAt: new Date().toISOString(),
      firstSeenAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      active: true,
      thumbnailUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      imageUrls: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200']
    };

    // 1. Initial upsert
    await repo.upsertProperty(testProp);
    const retrieved = await repo.getPropertyById('prop-test-01');
    expect(retrieved).toBeDefined();
    expect(retrieved?.price).toBe(320000);

    // Initial snapshot should be created
    const initialSnaps = await repo.getPropertySnapshots('prop-test-01');
    expect(initialSnaps.length).toBe(1);
    expect(initialSnaps[0].price).toBe(320000);

    // 2. Price drop update
    const updated = {
      ...testProp,
      price: 299000,
      pricePerSquareMeter: 5980
    };
    await repo.upsertProperty(updated);

    const afterDropSnaps = await repo.getPropertySnapshots('prop-test-01');
    expect(afterDropSnaps.length).toBe(2);
    expect(afterDropSnaps[1].price).toBe(299000);
  });

  it('persists saved searches and isolates them by user_id', async () => {
    const userA = 'user-a';
    const userB = 'user-b';

    const searchA: SavedSearch = {
      id: 'search-a-01',
      userId: userA,
      name: 'User A Helsinki Search',
      filters: { cities: ['Helsinki'], maxPrice: 300000 },
      minimumScore: 75,
      enabled: true,
      scheduleType: 'ONCE_DAILY',
      customScheduleTimes: ['08:00'],
      timezone: 'Europe/Helsinki',
      notificationSettings: { email: true, inApp: true, priceDrops: true, newMatches: true },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastRunAt: null,
      nextRunAt: new Date().toISOString()
    };

    const searchB: SavedSearch = {
      id: 'search-b-01',
      userId: userB,
      name: 'User B Tampere Search',
      filters: { cities: ['Tampere'], maxPrice: 250000 },
      minimumScore: 80,
      enabled: true,
      scheduleType: 'TWICE_DAILY',
      customScheduleTimes: ['08:00', '18:00'],
      timezone: 'Europe/Helsinki',
      notificationSettings: { email: true, inApp: true, priceDrops: true, newMatches: true },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastRunAt: null,
      nextRunAt: new Date().toISOString()
    };

    await repo.createSavedSearch(searchA);
    await repo.createSavedSearch(searchB);

    const userASearches = await repo.getSavedSearches(userA);
    expect(userASearches.length).toBe(1);
    expect(userASearches[0].name).toBe('User A Helsinki Search');

    const userBSearches = await repo.getSavedSearches(userB);
    expect(userBSearches.length).toBe(1);
    expect(userBSearches[0].name).toBe('User B Tampere Search');
  });

  it('enforces favorites uniqueness on (userId, propertyId) and persists user notes', async () => {
    const userId = 'user-fav-test';
    const propertyId = 'prop-hel-kallio-01';

    // Add favorite with initial note
    const fav1 = await repo.addFavorite(userId, propertyId, 'First inspection note');
    expect(fav1.notes).toBe('First inspection note');

    // Updating notes does not duplicate row
    const updatedFav = await repo.updateFavorite(userId, propertyId, 'Updated inspection note: pipe renovation done');
    expect(updatedFav?.notes).toBe('Updated inspection note: pipe renovation done');

    const userFavs = await repo.getFavorites(userId);
    expect(userFavs.length).toBe(1);
    expect(userFavs[0].notes).toBe('Updated inspection note: pipe renovation done');
  });

  it('persists notifications and marks as read', async () => {
    const userId = 'user-notif-test';

    const notif: AppNotification = {
      id: 'notif-01',
      userId,
      savedSearchId: 'search-01',
      propertyId: 'prop-01',
      type: 'PRICE_DROP',
      title: 'Price reduced by €20,000',
      message: 'Fleminginkatu 12 B is now €199,000 (-8%)',
      read: false,
      createdAt: new Date().toISOString()
    };

    await repo.createNotification(notif);
    const list = await repo.getNotifications(userId);
    expect(list.length).toBe(1);
    expect(list[0].read).toBe(false);

    await repo.markNotificationAsRead('notif-01', userId);
    const updatedList = await repo.getNotifications(userId);
    expect(updatedList[0].read).toBe(true);
  });
});
