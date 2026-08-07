import { PropertyProvider } from '../providers/types';
import { MockPropertyProvider } from '../providers/mock-provider';
import { Property, PropertyFilters, PropertySearchResult } from '@koti-scout/shared';
import { PropertyScoringEngine, DealFinderEngine, SmartTagsEngine } from '@koti-scout/property-engine';
import { dbRepository } from '@koti-scout/database';

export class PropertySearchService {
  private provider: PropertyProvider;
  private scoringEngine: PropertyScoringEngine;
  private dealFinder: DealFinderEngine;
  private smartTagsEngine: SmartTagsEngine;

  constructor(provider?: PropertyProvider) {
    this.provider = provider || new MockPropertyProvider();
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
    const rawResult = await this.provider.search(filters);

    // Enrich each property with scoring, deal detection, and smart tags
    const enrichedProperties: Property[] = await Promise.all(
      rawResult.properties.map(async (property) => {
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
    const property = await dbRepository.getPropertyById(id);
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
