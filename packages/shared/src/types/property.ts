import { PropertyType, SortByOption } from '../constants/finnish-geo';

export interface Property {
  id: string;
  externalId: string;
  provider: string;

  sourceUrl: string;

  title: string;
  description: string;

  address: string;
  postalCode: string;
  city: string;
  district: string;

  latitude: number | null;
  longitude: number | null;

  price: number;
  area: number;
  pricePerSquareMeter: number;

  rooms: number;
  bedrooms: number | null;

  propertyType: PropertyType;

  buildYear: number | null;

  maintenanceFee: number | null;

  floor: number | null;
  totalFloors: number | null;

  hasBalcony: boolean;
  hasSauna: boolean;
  hasElevator: boolean;

  energyClass: string | null;

  thumbnailUrl: string;
  imageUrls: string[];

  publishedAt: string;
  firstSeenAt: string;
  lastSeenAt: string;

  active: boolean;

  // Computed & intelligence enrichment
  score?: number;
  scoreBreakdown?: ScoreBreakdown;
  priceChangePercent?: number;
  dealIndicator?: DealIndicator;
  smartTags?: SmartTag[];
}

export interface ScoreBreakdown {
  total: number;
  price: number;
  area: number;
  location: number;
  buildYear: number;
  maintenanceFee: number;
  pricePerSquareMeter: number;
  features: number;
}

export interface DealIndicator {
  isDeal: boolean;
  districtMedianSqmPrice: number;
  discountPercentage: number; // e.g. -13.6%
  label: string; // e.g. "13.6% below Kallio median asking level"
}

export type SmartTag =
  | 'NEW'
  | 'PRICE DROP'
  | 'GREAT MATCH'
  | 'LOW €/M²'
  | 'NEW BUILD'
  | 'LOW MAINTENANCE'
  | 'RECENTLY UPDATED';

export interface PropertyFilters {
  keyword?: string;

  cities?: string[];
  districts?: string[];

  minPrice?: number;
  maxPrice?: number;

  minArea?: number;
  maxArea?: number;

  minPricePerSquareMeter?: number;
  maxPricePerSquareMeter?: number;

  minRooms?: number;
  maxRooms?: number;

  minBuildYear?: number;
  maxBuildYear?: number;

  propertyTypes?: PropertyType[];

  maxMaintenanceFee?: number;

  balconyRequired?: boolean;
  saunaRequired?: boolean;
  elevatorRequired?: boolean;

  newBuildingOnly?: boolean;

  sortBy?: SortByOption;

  limit?: number;
  offset?: number;
}

export interface PropertySearchResult {
  properties: Property[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  provider: string;
}

export interface PropertySnapshot {
  id: string;
  propertyId: string;
  price: number;
  pricePerSquareMeter: number;
  maintenanceFee: number | null;
  score: number | null;
  capturedAt: string;
}

export type PropertyEventType =
  | 'NEW_PROPERTY'
  | 'PRICE_DECREASED'
  | 'PRICE_INCREASED'
  | 'PROPERTY_REMOVED'
  | 'PROPERTY_RETURNED'
  | 'SCORE_THRESHOLD_REACHED';

export interface PropertyEvent {
  id: string;
  propertyId: string;
  savedSearchId?: string | null;
  type: PropertyEventType;
  oldValue?: number | string | null;
  newValue?: number | string | null;
  difference?: number | null;
  percentage?: number | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
