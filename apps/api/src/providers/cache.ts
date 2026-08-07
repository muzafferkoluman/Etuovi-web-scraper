import { PropertyFilters, PropertySearchResult } from '@koti-scout/shared';

interface CacheEntry {
  result: PropertySearchResult;
  expiresAt: number;
}

export class ProviderSearchCache {
  private cache: Map<string, CacheEntry> = new Map();
  private ttlMs: number;

  constructor(ttlMinutes = 5) {
    this.ttlMs = ttlMinutes * 60 * 1000;
  }

  private generateKey(providerName: string, filters: PropertyFilters): string {
    return `${providerName}:${JSON.stringify(filters)}`;
  }

  public get(providerName: string, filters: PropertyFilters): PropertySearchResult | null {
    const key = this.generateKey(providerName, filters);
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.result;
  }

  public set(providerName: string, filters: PropertyFilters, result: PropertySearchResult): void {
    const key = this.generateKey(providerName, filters);
    this.cache.set(key, {
      result,
      expiresAt: Date.now() + this.ttlMs
    });
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const searchCache = new ProviderSearchCache();
