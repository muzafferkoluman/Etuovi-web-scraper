import { PropertyProvider } from "../providers/types";
import { MockPropertyProvider } from "../providers/mock-provider";
import { AuthorizedPropertyProvider } from "../providers/authorized-provider";
import { EtuoviLivePropertyProvider } from "../providers/etuovi-live-provider";
import { Property, PropertyFilters, PropertySearchResult } from "@koti-scout/shared";
import { PropertyScoringEngine, DealFinderEngine, SmartTagsEngine } from "@koti-scout/property-engine";
import { dbRepository } from "@koti-scout/database";

export function resolveDefaultProvider(): PropertyProvider {
  const providerType = (process.env.PROPERTY_PROVIDER || "etuovi").toLowerCase();
  if (providerType === "mock" || providerType === "demo") {
    return new MockPropertyProvider();
  }
  if (providerType === "authorized") {
    return new AuthorizedPropertyProvider();
  }
  return new EtuoviLivePropertyProvider();
}

export class PropertySearchService {
  private provider: PropertyProvider;
  private scoringEngine: PropertyScoringEngine;
  private dealFinder: DealFinderEngine;
  private smartTagsEngine: SmartTagsEngine;

  constructor(provider?: PropertyProvider) {
    this.provider = provider || resolveDefaultProvider();
    this.scoringEngine = new PropertyScoringEngine();
    this.dealFinder = new DealFinderEngine();
    this.smartTagsEngine = new SmartTagsEngine();
  }

  public setProvider(provider: PropertyProvider): void {
    this.provider = provider;
  }

  public getProviderName(): string {
    return this.provider.name;
  }

  public async search(filters: PropertyFilters): Promise<PropertySearchResult> {
    let rawResult = await this.provider.search(filters);

    // Resilience Fallback: If live provider returns 0 results (due to rate limits or network), fallback to dbRepository
    if (rawResult.properties.length === 0) {
      try {
        const dbResult = await dbRepository.getProperties(filters);
        if (dbResult.properties.length > 0) {
          const limit = filters.limit || 20;
          const offset = filters.offset || 0;
          rawResult = {
            properties: dbResult.properties,
            total: dbResult.total,
            page: Math.floor(offset / limit) + 1,
            pageSize: limit,
            hasMore: offset + dbResult.properties.length < dbResult.total,
            provider: `${this.provider.name} (Resilient Cache)`
          };
        }
      } catch {
        // Continue with rawResult
      }
    }

    const enrichedProperties: Property[] = await Promise.all(
      rawResult.properties.map(async (property) => {
        // Persist/upsert property into database for snapshot tracking
        try {
          await dbRepository.upsertProperty(property);
        } catch (err) {
          // Ignore DB upsert errors if DB mode is minimal
        }

        const snapshots = await dbRepository.getPropertySnapshots(property.id);
        const hasPriceDrop = snapshots.length >= 2 && snapshots[snapshots.length - 1].price < snapshots[0].price;

        const deal = this.dealFinder.evaluateDeal(property);
        const { total, breakdown } = this.scoringEngine.calculateScore(property, filters);
        const tags = this.smartTagsEngine.generateTags(property, {
          dealIndicator: deal,
          hasPriceDrop,
          score: total
        });

        const initialPrice = snapshots.length > 0 ? snapshots[0].price : property.price;
        const priceChangePercent =
          initialPrice !== property.price
            ? Math.round(((property.price - initialPrice) / initialPrice) * 10000) / 100
            : undefined;

        return {
          ...property,
          score: total,
          scoreBreakdown: breakdown,
          dealIndicator: deal,
          smartTags: tags,
          priceChangePercent
        };
      })
    );

    return {
      ...rawResult,
      properties: enrichedProperties
    };
  }

  public async getPropertyDetails(id: string): Promise<{
    property: Property;
    snapshots: Awaited<ReturnType<typeof dbRepository.getPropertySnapshots>>;
    events: Awaited<ReturnType<typeof dbRepository.getPropertyEvents>>;
  } | null> {
    let property = await dbRepository.getPropertyById(id);

    // If property not found in local DB, attempt live fetch from provider
    if (!property) {
      const liveProperty = await this.provider.getProperty(id);
      if (liveProperty) {
        try {
          await dbRepository.upsertProperty(liveProperty);
          property = await dbRepository.getPropertyById(id) || liveProperty;
        } catch {
          property = liveProperty;
        }
      }
    }

    if (!property) return null;

    const snapshots = await dbRepository.getPropertySnapshots(id);
    const events = await dbRepository.getPropertyEvents(id);

    const deal = this.dealFinder.evaluateDeal(property);
    const { total, breakdown } = this.scoringEngine.calculateScore(property);
    const tags = this.smartTagsEngine.generateTags(property, { dealIndicator: deal, score: total });

    const initialPrice = snapshots.length > 0 ? snapshots[0].price : property.price;
    const priceChangePercent =
      initialPrice !== property.price
        ? Math.round(((property.price - initialPrice) / initialPrice) * 10000) / 100
        : undefined;

    const enriched: Property = {
      ...property,
      score: total,
      scoreBreakdown: breakdown,
      dealIndicator: deal,
      smartTags: tags,
      priceChangePercent
    };

    return {
      property: enriched,
      snapshots,
      events
    };
  }
}

export const searchService = new PropertySearchService();
