import { PropertyProvider } from './types';
import { Property, PropertyFilters, PropertySearchResult } from '@koti-scout/shared';

/**
 * AuthorizedPropertyProvider
 *
 * Extensible adapter template for integrating authorized Finnish real estate API endpoints,
 * partner feeds, or open MLS integrations without any changes to the frontend.
 *
 * Note: Does not implement any prohibited anti-bot evasion, CAPTCHA bypass, or unauthorized scraping.
 */
export class AuthorizedPropertyProvider implements PropertyProvider {
  public readonly name = 'AuthorizedPropertyProvider';
  private apiKey?: string;
  private apiEndpoint?: string;

  constructor(config?: { apiKey?: string; apiEndpoint?: string }) {
    this.apiKey = config?.apiKey || process.env.AUTHORIZED_PROPERTY_API_KEY;
    this.apiEndpoint = config?.apiEndpoint || process.env.AUTHORIZED_PROPERTY_API_ENDPOINT;
  }

  public async search(_filters: PropertyFilters): Promise<PropertySearchResult> {
    if (!this.apiKey || !this.apiEndpoint) {
      // Fallback empty result until external credentials are provided
      return {
        properties: [],
        total: 0,
        page: 1,
        pageSize: 20,
        hasMore: false,
        provider: this.name
      };
    }

    // Example authorized API integration:
    // const response = await fetch(`${this.apiEndpoint}/properties/search`, {
    //   headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
    //   body: JSON.stringify(_filters)
    // });
    // return this.mapToSearchResult(await response.json());

    return {
      properties: [],
      total: 0,
      page: 1,
      pageSize: 20,
      hasMore: false,
      provider: this.name
    };
  }

  public async getProperty(_externalId: string): Promise<Property | null> {
    if (!this.apiKey || !this.apiEndpoint) {
      return null;
    }
    return null;
  }
}
