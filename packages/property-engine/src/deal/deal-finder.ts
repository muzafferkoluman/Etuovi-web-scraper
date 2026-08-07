import { Property, DealIndicator } from '@koti-scout/shared';
import { FINNISH_DISTRICTS } from '@koti-scout/shared';

export class DealFinderEngine {
  /**
   * Calculates estimated relative value against Finnish district median price benchmarks.
   * Clearly presents values as indicators rather than investment guarantees.
   */
  public evaluateDeal(property: Property): DealIndicator | undefined {
    const cityDistricts = FINNISH_DISTRICTS[property.city];
    if (!cityDistricts) return undefined;

    const districtInfo = cityDistricts.find(
      d => d.name.toLowerCase() === property.district.toLowerCase()
    );

    if (!districtInfo || !districtInfo.medianPricePerSqm) {
      return undefined;
    }

    const median = districtInfo.medianPricePerSqm;
    const diff = property.pricePerSquareMeter - median;
    const discountPercentage = Math.round((diff / median) * 1000) / 10; // e.g. -13.6%

    const isDeal = discountPercentage <= -7.0; // 7%+ below area asking median

    const absDiscount = Math.abs(discountPercentage);
    const label = isDeal
      ? `${absDiscount}% below ${property.district} asking median`
      : discountPercentage > 0
      ? `${discountPercentage}% above ${property.district} asking median`
      : `In line with ${property.district} median`;

    return {
      isDeal,
      districtMedianSqmPrice: median,
      discountPercentage,
      label
    };
  }
}
