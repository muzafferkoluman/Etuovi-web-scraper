import { describe, it, expect } from 'vitest';
import { PropertyMatchingEngine } from '../src/matching/matching-engine';
import { Property } from '@koti-scout/shared';

describe('PropertyMatchingEngine', () => {
  const engine = new PropertyMatchingEngine();

  const property: Property = {
    id: 'prop-match-01',
    externalId: 'ext-01',
    provider: 'MockPropertyProvider',
    sourceUrl: 'https://example.com',
    title: 'Moderni kaksio',
    description: 'Valoisa asunto',
    address: 'Fleminginkatu 12',
    postalCode: '00530',
    city: 'Helsinki',
    district: 'Kallio',
    latitude: 60.18,
    longitude: 24.95,
    price: 219000,
    area: 48,
    pricePerSquareMeter: 4562,
    rooms: 2,
    bedrooms: 1,
    propertyType: 'Apartment',
    buildYear: 2005,
    maintenanceFee: 210,
    floor: 2,
    totalFloors: 5,
    hasBalcony: true,
    hasSauna: false,
    hasElevator: true,
    energyClass: 'C2018',
    thumbnailUrl: 'https://example.com/img.jpg',
    imageUrls: [],
    publishedAt: new Date().toISOString(),
    firstSeenAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
    active: true
  };

  it('matches properties satisfying city, price, and area criteria', () => {
    const isMatch = engine.matches(property, {
      cities: ['Helsinki'],
      maxPrice: 250000,
      minArea: 40,
      minRooms: 2,
      balconyRequired: true
    });
    expect(isMatch).toBe(true);
  });

  it('rejects properties failing amenity or price constraints', () => {
    const failsSauna = engine.matches(property, {
      saunaRequired: true
    });
    expect(failsSauna).toBe(false);

    const failsPrice = engine.matches(property, {
      maxPrice: 150000
    });
    expect(failsPrice).toBe(false);
  });
});
