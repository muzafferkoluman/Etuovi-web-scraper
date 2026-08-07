import { describe, it, expect } from 'vitest';
import { PropertyScoringEngine } from '../src/scoring/scoring-engine';
import { Property } from '@koti-scout/shared';

describe('PropertyScoringEngine', () => {
  const engine = new PropertyScoringEngine();

  const mockProperty: Property = {
    id: 'test-prop-01',
    externalId: 'ext-01',
    provider: 'MockPropertyProvider',
    sourceUrl: 'https://example.com',
    title: 'Test apartment',
    description: 'Nice flat',
    address: 'Fleminginkatu 12',
    postalCode: '00530',
    city: 'Helsinki',
    district: 'Kallio',
    latitude: 60.18,
    longitude: 24.95,
    price: 219000,
    area: 50,
    pricePerSquareMeter: 4380,
    rooms: 2,
    bedrooms: 1,
    propertyType: 'Apartment',
    buildYear: 2005,
    maintenanceFee: 200,
    floor: 3,
    totalFloors: 5,
    hasBalcony: true,
    hasSauna: true,
    hasElevator: true,
    energyClass: 'C2018',
    thumbnailUrl: 'https://example.com/img.jpg',
    imageUrls: [],
    publishedAt: new Date().toISOString(),
    firstSeenAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
    active: true
  };

  it('calculates score within 0 to 100 range and returns breakdown', () => {
    const result = engine.calculateScore(mockProperty, {
      cities: ['Helsinki'],
      maxPrice: 250000,
      minArea: 40
    });

    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(result.total).toBeLessThanOrEqual(100);
    expect(result.total).toBeGreaterThanOrEqual(80); // High quality match

    expect(result.breakdown).toBeDefined();
    expect(result.breakdown.price).toBeGreaterThan(0);
    expect(result.breakdown.location).toBeGreaterThan(0);
    expect(result.breakdown.area).toBeGreaterThan(0);
    expect(result.breakdown.features).toBeGreaterThan(0);
  });

  it('penalizes properties drastically exceeding maxPrice budget', () => {
    const expensiveProperty = { ...mockProperty, price: 650000 };
    const result = engine.calculateScore(expensiveProperty, {
      maxPrice: 250000
    });

    expect(result.breakdown.price).toBeLessThan(10);
  });
});
