import { Property } from './property';

export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  notes: string;
  createdAt: string;
  property?: Property;
}

export interface UserPreferences {
  userId: string;
  defaultCity: string;
  defaultTimezone: string;
  defaultCurrency: string;
  criteriaWeights: {
    price: number;
    area: number;
    location: number;
    buildYear: number;
    maintenanceFee: number;
    pricePerSquareMeter: number;
    features: number;
  };
  updatedAt: string;
}
