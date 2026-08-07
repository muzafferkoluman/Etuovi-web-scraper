import { describe, it, expect } from 'vitest';
import { DealFinderEngine } from '../src/deal/deal-finder';
import { Property } from '@koti-scout/shared';

describe('DealFinderEngine', () => {
  const dealFinder = new DealFinderEngine();

  it('detects deal when €/m² is significantly below district median asking price', () => {
    // Kallio median in constants is 5800 €/m²
    const cheapKallioProp: Property = {
      id: 'kallio-deal',
      externalId: 'ext-deal',
      provider: 'MockPropertyProvider',
      sourceUrl: 'https://example.com',
      title: 'Deal',
      description: 'Underpriced',
      address: 'Vaasankatu 5',
      postalCode: '00500',
      city: 'Helsinki',
      district: 'Kallio',
      latitude: 60.18,
      longitude: 24.95,
      price: 210000,
      area: 50,
      pricePerSquareMeter: 4200, // 4200 vs 5800 -> -27.6%
      rooms: 2,
      bedrooms: 1,
      propertyType: 'Apartment',
      buildYear: 1965,
      maintenanceFee: 220,
      floor: 2,
      totalFloors: 5,
      hasBalcony: false,
      hasSauna: false,
      hasElevator: true,
      energyClass: 'D2018',
      thumbnailUrl: '',
      imageUrls: [],
      publishedAt: new Date().toISOString(),
      firstSeenAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      active: true
    };

    const result = dealFinder.evaluateDeal(cheapKallioProp);
    expect(result).toBeDefined();
    expect(result?.isDeal).toBe(true);
    expect(result?.discountPercentage).toBeLessThan(-15);
    expect(result?.label).toContain('below Kallio asking median');
  });
});
