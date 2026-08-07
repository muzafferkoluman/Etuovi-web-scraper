import { PropertyProvider } from './types';
import { Property, PropertyFilters, PropertySearchResult } from '@koti-scout/shared';
import { dbRepository } from '@koti-scout/database';
import { searchCache } from './cache';

export class MockPropertyProvider implements PropertyProvider {
  public readonly name = 'MockPropertyProvider';

  public async search(filters: PropertyFilters): Promise<PropertySearchResult> {
    // Check search cache first
    const cached = searchCache.get(this.name, filters);
    if (cached) {
      return cached;
    }

    const { properties, total } = await dbRepository.getProperties(filters);

    const result: PropertySearchResult = {
      properties,
      total,
      page: Math.floor((filters.offset ?? 0) / (filters.limit ?? 20)) + 1,
      pageSize: filters.limit ?? 20,
      hasMore: (filters.offset ?? 0) + (filters.limit ?? 20) < total,
      provider: this.name
    };

    // Cache the result for subsequent identical queries
    searchCache.set(this.name, filters, result);

    return result;
  }

  public async getProperty(externalId: string): Promise<Property | null> {
    const { properties } = await dbRepository.getProperties({ limit: 100 });
    return properties.find(p => p.externalId === externalId || p.id === externalId) || null;
  }
}
