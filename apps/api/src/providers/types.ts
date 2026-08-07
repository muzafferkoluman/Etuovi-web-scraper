import { Property, PropertyFilters, PropertySearchResult } from '@koti-scout/shared';

export interface PropertyProvider {
  name: string;

  search(filters: PropertyFilters): Promise<PropertySearchResult>;

  getProperty(externalId: string): Promise<Property | null>;
}
