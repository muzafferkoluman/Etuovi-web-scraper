import { Property, ScoreBreakdown, PropertyFilters } from '@koti-scout/shared';
import { FINNISH_DISTRICTS } from '@koti-scout/shared';

export interface ScoringWeights {
  price: number; // max pts (default: 25)
  area: number; // max pts (default: 15)
  location: number; // max pts (default: 20)
  buildYear: number; // max pts (default: 10)
  maintenanceFee: number; // max pts (default: 10)
  pricePerSquareMeter: number; // max pts (default: 10)
  features: number; // max pts (default: 10)
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  price: 25,
  location: 20,
  area: 15,
  buildYear: 10,
  maintenanceFee: 10,
  pricePerSquareMeter: 10,
  features: 10
};

export class PropertyScoringEngine {
  private weights: ScoringWeights;

  constructor(weights: Partial<ScoringWeights> = {}) {
    this.weights = { ...DEFAULT_WEIGHTS, ...weights };
  }

  public calculateScore(property: Property, preferences?: PropertyFilters): { total: number; breakdown: ScoreBreakdown } {
    const priceScore = this.evaluatePrice(property, preferences);
    const locationScore = this.evaluateLocation(property, preferences);
    const areaScore = this.evaluateArea(property, preferences);
    const buildYearScore = this.evaluateBuildYear(property, preferences);
    const maintenanceScore = this.evaluateMaintenanceFee(property, preferences);
    const sqmPriceScore = this.evaluatePricePerSquareMeter(property);
    const featuresScore = this.evaluateFeatures(property, preferences);

    const totalRaw =
      priceScore +
      locationScore +
      areaScore +
      buildYearScore +
      maintenanceScore +
      sqmPriceScore +
      featuresScore;

    const total = Math.min(100, Math.max(0, Math.round(totalRaw)));

    const breakdown: ScoreBreakdown = {
      total,
      price: Math.round(priceScore * 10) / 10,
      location: Math.round(locationScore * 10) / 10,
      area: Math.round(areaScore * 10) / 10,
      buildYear: Math.round(buildYearScore * 10) / 10,
      maintenanceFee: Math.round(maintenanceScore * 10) / 10,
      pricePerSquareMeter: Math.round(sqmPriceScore * 10) / 10,
      features: Math.round(featuresScore * 10) / 10
    };

    return { total, breakdown };
  }

  private evaluatePrice(property: Property, preferences?: PropertyFilters): number {
    const maxWeight = this.weights.price;
    if (preferences?.maxPrice) {
      if (property.price <= preferences.maxPrice * 0.8) return maxWeight;
      if (property.price <= preferences.maxPrice) {
        const ratio = (preferences.maxPrice - property.price) / (preferences.maxPrice * 0.2);
        return maxWeight * (0.7 + 0.3 * ratio);
      }
      // Over budget
      const overBudgetRatio = (property.price - preferences.maxPrice) / preferences.maxPrice;
      return Math.max(0, maxWeight * (0.5 - overBudgetRatio));
    }

    // Baseline Finnish housing price sweet spot assessment (e.g. 150k - 350k is standard accessible range)
    if (property.price < 200000) return maxWeight;
    if (property.price < 350000) return maxWeight * 0.88;
    if (property.price < 500000) return maxWeight * 0.75;
    return maxWeight * 0.6;
  }

  private evaluateLocation(property: Property, preferences?: PropertyFilters): number {
    const maxWeight = this.weights.location;
    if (preferences?.cities?.length) {
      if (!preferences.cities.includes(property.city)) {
        return maxWeight * 0.2;
      }
    }
    if (preferences?.districts?.length) {
      if (preferences.districts.includes(property.district)) {
        return maxWeight;
      }
    }

    // High demand prime Finnish districts
    const primeDistricts = ['Kallio', 'Kamppi', 'Töölö', 'Lauttasaari', 'Tapiola', 'Punavuori', 'Pyynikki', 'Keskusta'];
    if (primeDistricts.includes(property.district)) {
      return maxWeight * 0.95;
    }
    return maxWeight * 0.8;
  }

  private evaluateArea(property: Property, preferences?: PropertyFilters): number {
    const maxWeight = this.weights.area;
    if (preferences?.minArea && preferences?.maxArea) {
      if (property.area >= preferences.minArea && property.area <= preferences.maxArea) {
        return maxWeight;
      }
    } else if (preferences?.minArea) {
      if (property.area >= preferences.minArea) {
        return maxWeight;
      }
      return Math.max(0, maxWeight * (property.area / preferences.minArea));
    }

    // General spaciousness for room count
    const m2PerRoom = property.rooms > 0 ? property.area / property.rooms : 30;
    if (m2PerRoom >= 28) return maxWeight;
    if (m2PerRoom >= 22) return maxWeight * 0.85;
    return maxWeight * 0.65;
  }

  private evaluateBuildYear(property: Property, preferences?: PropertyFilters): number {
    const maxWeight = this.weights.buildYear;
    if (!property.buildYear) return maxWeight * 0.5;

    if (preferences?.minBuildYear && property.buildYear < preferences.minBuildYear) {
      const diff = preferences.minBuildYear - property.buildYear;
      return Math.max(0, maxWeight * (1 - diff / 30));
    }

    if (property.buildYear >= 2020) return maxWeight;
    if (property.buildYear >= 2005) return maxWeight * 0.9;
    if (property.buildYear >= 1990) return maxWeight * 0.8;
    if (property.buildYear >= 1970) return maxWeight * 0.65; // 70s pipe renovation considerations
    // Classic Jugenstil / Art Nouveau pre-1930 buildings in Helsinki are highly valued
    if (property.buildYear <= 1935 && ['Helsinki', 'Turku', 'Tampere'].includes(property.city)) {
      return maxWeight * 0.95;
    }
    return maxWeight * 0.6;
  }

  private evaluateMaintenanceFee(property: Property, preferences?: PropertyFilters): number {
    const maxWeight = this.weights.maintenanceFee;
    if (property.maintenanceFee === null || property.maintenanceFee === undefined) {
      return maxWeight * 0.5;
    }

    if (preferences?.maxMaintenanceFee && property.maintenanceFee > preferences.maxMaintenanceFee) {
      const over = property.maintenanceFee - preferences.maxMaintenanceFee;
      return Math.max(0, maxWeight * (1 - over / 200));
    }

    // In Finland, maintenance fee (hoitovastike) under ~4.5 €/m²/mo is good
    const feePerSqm = property.area > 0 ? property.maintenanceFee / property.area : 5;
    if (feePerSqm <= 3.8) return maxWeight;
    if (feePerSqm <= 4.8) return maxWeight * 0.85;
    if (feePerSqm <= 6.0) return maxWeight * 0.65;
    return maxWeight * 0.4;
  }

  private evaluatePricePerSquareMeter(property: Property): number {
    const maxWeight = this.weights.pricePerSquareMeter;
    const cityDistricts = FINNISH_DISTRICTS[property.city];
    const districtInfo = cityDistricts?.find(d => d.name.toLowerCase() === property.district.toLowerCase());

    if (districtInfo) {
      const ratio = property.pricePerSquareMeter / districtInfo.medianPricePerSqm;
      if (ratio <= 0.85) return maxWeight; // 15%+ under median -> top score!
      if (ratio <= 0.95) return maxWeight * 0.9;
      if (ratio <= 1.05) return maxWeight * 0.75;
      if (ratio <= 1.2) return maxWeight * 0.55;
      return maxWeight * 0.35;
    }

    // Fallback baseline
    if (property.pricePerSquareMeter < 3500) return maxWeight;
    if (property.pricePerSquareMeter < 5500) return maxWeight * 0.75;
    return maxWeight * 0.5;
  }

  private evaluateFeatures(property: Property, preferences?: PropertyFilters): number {
    const maxWeight = this.weights.features;
    let score = 0;
    const items = 3;
    const ptEach = maxWeight / items;

    if (property.hasBalcony || (preferences?.balconyRequired && property.hasBalcony)) {
      score += ptEach;
    }
    if (property.hasSauna || (preferences?.saunaRequired && property.hasSauna)) {
      score += ptEach;
    }
    if (property.hasElevator || (preferences?.elevatorRequired && property.hasElevator)) {
      score += ptEach;
    }

    return Math.min(maxWeight, score);
  }
}
