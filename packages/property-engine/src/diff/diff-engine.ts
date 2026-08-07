import { Property, PropertyEvent, PropertyEventType, PropertySnapshot } from '@koti-scout/shared';

export interface DiffDetectionInput {
  property: Property;
  previousSnapshot?: PropertySnapshot | null;
  savedSearchId?: string | null;
  minimumScoreThreshold?: number;
  isFirstScan?: boolean;
}

export interface BatchDiffInput {
  currentProperties: Property[];
  previousSnapshotsMap: Map<string, PropertySnapshot>;
  savedSearchId?: string | null;
  minimumScoreThreshold?: number;
}

export class PropertyDiffEngine {
  /**
   * Evaluates diff events between current property state and its previous snapshot.
   */
  public detectPropertyEvents(input: DiffDetectionInput): PropertyEvent[] {
    const events: PropertyEvent[] = [];
    const { property, previousSnapshot, savedSearchId, minimumScoreThreshold = 80, isFirstScan } = input;
    const now = new Date().toISOString();

    if (!previousSnapshot || isFirstScan) {
      events.push({
        id: `evt-new-${property.id}-${Date.now()}`,
        propertyId: property.id,
        savedSearchId,
        type: 'NEW_PROPERTY',
        newValue: property.price,
        createdAt: now,
        metadata: {
          title: property.title,
          city: property.city,
          district: property.district,
          price: property.price,
          area: property.area
        }
      });

      if (property.score && property.score >= minimumScoreThreshold) {
        events.push({
          id: `evt-score-${property.id}-${Date.now()}`,
          propertyId: property.id,
          savedSearchId,
          type: 'SCORE_THRESHOLD_REACHED',
          newValue: property.score,
          createdAt: now,
          metadata: {
            score: property.score,
            threshold: minimumScoreThreshold
          }
        });
      }
      return events;
    }

    // Price change calculation
    if (previousSnapshot.price !== property.price) {
      const diff = property.price - previousSnapshot.price;
      const percentage = Math.round((diff / previousSnapshot.price) * 10000) / 100; // e.g. -8.03
      const type: PropertyEventType = diff < 0 ? 'PRICE_DECREASED' : 'PRICE_INCREASED';

      events.push({
        id: `evt-price-${property.id}-${Date.now()}`,
        propertyId: property.id,
        savedSearchId,
        type,
        oldValue: previousSnapshot.price,
        newValue: property.price,
        difference: diff,
        percentage,
        createdAt: now,
        metadata: {
          oldSqmPrice: previousSnapshot.pricePerSquareMeter,
          newSqmPrice: property.pricePerSquareMeter
        }
      });
    }

    // High score threshold newly reached
    const prevScore = previousSnapshot.score ?? 0;
    const currentScore = property.score ?? 0;
    if (prevScore < minimumScoreThreshold && currentScore >= minimumScoreThreshold) {
      events.push({
        id: `evt-score-${property.id}-${Date.now()}`,
        propertyId: property.id,
        savedSearchId,
        type: 'SCORE_THRESHOLD_REACHED',
        oldValue: prevScore,
        newValue: currentScore,
        createdAt: now,
        metadata: {
          threshold: minimumScoreThreshold
        }
      });
    }

    return events;
  }

  /**
   * Performs batch diff analysis comparing the scanned result set with previous state
   */
  public detectBatchDiffs(input: BatchDiffInput): {
    events: PropertyEvent[];
    newProperties: Property[];
    priceDrops: Array<{ property: Property; oldPrice: number; newPrice: number; diff: number; percentage: number }>;
  } {
    const events: PropertyEvent[] = [];
    const newProperties: Property[] = [];
    const priceDrops: Array<{ property: Property; oldPrice: number; newPrice: number; diff: number; percentage: number }> = [];

    for (const property of input.currentProperties) {
      const prev = input.previousSnapshotsMap.get(property.id) || input.previousSnapshotsMap.get(property.externalId);
      const propEvents = this.detectPropertyEvents({
        property,
        previousSnapshot: prev,
        savedSearchId: input.savedSearchId,
        minimumScoreThreshold: input.minimumScoreThreshold
      });

      events.push(...propEvents);

      const isNew = propEvents.some(e => e.type === 'NEW_PROPERTY');
      if (isNew) {
        newProperties.push(property);
      }

      const priceDropEvt = propEvents.find(e => e.type === 'PRICE_DECREASED');
      if (priceDropEvt && priceDropEvt.oldValue && priceDropEvt.newValue) {
        priceDrops.push({
          property,
          oldPrice: Number(priceDropEvt.oldValue),
          newPrice: Number(priceDropEvt.newValue),
          diff: priceDropEvt.difference ?? (Number(priceDropEvt.newValue) - Number(priceDropEvt.oldValue)),
          percentage: priceDropEvt.percentage ?? 0
        });
      }
    }

    return { events, newProperties, priceDrops };
  }
}
