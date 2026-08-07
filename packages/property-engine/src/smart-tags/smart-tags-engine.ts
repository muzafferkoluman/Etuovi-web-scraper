import { Property, SmartTag, DealIndicator } from '@koti-scout/shared';

export class SmartTagsEngine {
  public generateTags(
    property: Property,
    options?: {
      dealIndicator?: DealIndicator;
      hasPriceDrop?: boolean;
      score?: number;
    }
  ): SmartTag[] {
    const tags: SmartTag[] = [];
    const now = new Date().getTime();
    const published = new Date(property.publishedAt).getTime();
    const isNew = now - published <= 3 * 24 * 60 * 60 * 1000; // Within 3 days

    if (isNew) {
      tags.push('NEW');
    }

    if (options?.hasPriceDrop || (property.priceChangePercent && property.priceChangePercent < 0)) {
      tags.push('PRICE DROP');
    }

    const currentScore = options?.score ?? property.score;
    if (currentScore && currentScore >= 85) {
      tags.push('GREAT MATCH');
    }

    if (options?.dealIndicator?.isDeal) {
      tags.push('LOW €/M²');
    }

    const currentYear = new Date().getFullYear();
    if (property.buildYear && property.buildYear >= currentYear - 2) {
      tags.push('NEW BUILD');
    }

    if (property.maintenanceFee && property.area > 0) {
      const feePerSqm = property.maintenanceFee / property.area;
      if (feePerSqm <= 3.8) {
        tags.push('LOW MAINTENANCE');
      }
    }

    const firstSeen = new Date(property.firstSeenAt).getTime();
    const lastSeen = new Date(property.lastSeenAt).getTime();
    if (lastSeen - firstSeen > 24 * 60 * 60 * 1000 && !isNew) {
      tags.push('RECENTLY UPDATED');
    }

    return Array.from(new Set(tags));
  }
}
