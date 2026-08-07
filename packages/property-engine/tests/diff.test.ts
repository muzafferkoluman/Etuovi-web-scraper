import { describe, it, expect } from 'vitest';
import { PropertyDiffEngine } from '../src/diff/diff-engine';
import { Property, PropertySnapshot } from '@koti-scout/shared';

describe('PropertyDiffEngine', () => {
  const diffEngine = new PropertyDiffEngine();

  const baseProperty: Property = {
    id: 'test-diff-01',
    externalId: 'ext-diff-01',
    provider: 'MockPropertyProvider',
    sourceUrl: 'https://example.com',
    title: 'Test apartment',
    description: 'Nice flat',
    address: 'Eerikinkatu 28',
    postalCode: '00100',
    city: 'Helsinki',
    district: 'Kamppi',
    latitude: 60.16,
    longitude: 24.93,
    price: 229000,
    area: 50,
    pricePerSquareMeter: 4580,
    rooms: 2,
    bedrooms: 1,
    propertyType: 'Apartment',
    buildYear: 2010,
    maintenanceFee: 200,
    floor: 2,
    totalFloors: 5,
    hasBalcony: false,
    hasSauna: false,
    hasElevator: true,
    energyClass: 'C2018',
    thumbnailUrl: 'https://example.com/img.jpg',
    imageUrls: [],
    publishedAt: new Date().toISOString(),
    firstSeenAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
    active: true,
    score: 85
  };

  it('detects NEW_PROPERTY event on initial scan', () => {
    const events = diffEngine.detectPropertyEvents({
      property: baseProperty,
      isFirstScan: true
    });

    const newEvt = events.find((e) => e.type === 'NEW_PROPERTY');
    expect(newEvt).toBeDefined();
    expect(newEvt?.newValue).toBe(229000);
  });

  it('accurately calculates PRICE_DECREASED with diff amount and percentage', () => {
    const previousSnapshot: PropertySnapshot = {
      id: 'snap-old',
      propertyId: baseProperty.id,
      price: 249000,
      pricePerSquareMeter: 4980,
      maintenanceFee: 200,
      score: 80,
      capturedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    };

    const events = diffEngine.detectPropertyEvents({
      property: baseProperty, // price = 229,000
      previousSnapshot
    });

    const priceDrop = events.find((e) => e.type === 'PRICE_DECREASED');
    expect(priceDrop).toBeDefined();
    expect(priceDrop?.oldValue).toBe(249000);
    expect(priceDrop?.newValue).toBe(229000);
    expect(priceDrop?.difference).toBe(-20000);
    expect(priceDrop?.percentage).toBe(-8.03);
  });

  it('does not trigger false price events if price is unchanged', () => {
    const identicalSnapshot: PropertySnapshot = {
      id: 'snap-identical',
      propertyId: baseProperty.id,
      price: 229000,
      pricePerSquareMeter: 4580,
      maintenanceFee: 200,
      score: 85,
      capturedAt: new Date(Date.now() - 1000).toISOString()
    };

    const events = diffEngine.detectPropertyEvents({
      property: baseProperty,
      previousSnapshot: identicalSnapshot
    });

    expect(events.length).toBe(0);
  });
});
