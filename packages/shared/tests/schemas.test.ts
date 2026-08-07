import { describe, it, expect } from 'vitest';
import { PropertyFiltersSchema, CreateSavedSearchSchema } from '../src';

describe('Shared Zod Schemas', () => {
  it('validates property filters with valid types and limits', () => {
    const valid = PropertyFiltersSchema.safeParse({
      cities: ['Helsinki', 'Espoo'],
      minPrice: 200000,
      maxPrice: 400000,
      minRooms: 2,
      sortBy: 'price-low'
    });

    expect(valid.success).toBe(true);
  });

  it('validates saved search creation payload with default schedule', () => {
    const valid = CreateSavedSearchSchema.safeParse({
      name: 'Helsinki Family Apartments',
      filters: {
        cities: ['Helsinki'],
        minRooms: 3
      },
      minimumScore: 80,
      scheduleType: 'TWICE_DAILY'
    });

    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.timezone).toBe('Europe/Helsinki');
      expect(valid.data.notificationSettings.inApp).toBe(true);
    }
  });
});
