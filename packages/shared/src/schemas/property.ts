import { z } from 'zod';
import { PROPERTY_TYPES, SORT_OPTIONS } from '../constants/finnish-geo';

export const PropertyTypeSchema = z.enum([
  'Apartment',
  'Row house',
  'Detached house',
  'Semi-detached',
  'Other'
]);

export const SortBySchema = z.enum([
  'newest',
  'oldest',
  'price-low',
  'price-high',
  'sqm-price-low',
  'sqm-price-high',
  'area-high',
  'score-high'
]);

export const PropertyFiltersSchema = z.object({
  keyword: z.string().optional(),
  cities: z.array(z.string()).optional(),
  districts: z.array(z.string()).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minArea: z.coerce.number().min(0).optional(),
  maxArea: z.coerce.number().min(0).optional(),
  minPricePerSquareMeter: z.coerce.number().min(0).optional(),
  maxPricePerSquareMeter: z.coerce.number().min(0).optional(),
  minRooms: z.coerce.number().min(1).optional(),
  maxRooms: z.coerce.number().min(1).optional(),
  minBuildYear: z.coerce.number().min(1800).max(2050).optional(),
  maxBuildYear: z.coerce.number().min(1800).max(2050).optional(),
  propertyTypes: z.array(PropertyTypeSchema).optional(),
  maxMaintenanceFee: z.coerce.number().min(0).optional(),
  balconyRequired: z.coerce.boolean().optional(),
  saunaRequired: z.coerce.boolean().optional(),
  elevatorRequired: z.coerce.boolean().optional(),
  newBuildingOnly: z.coerce.boolean().optional(),
  sortBy: SortBySchema.optional().default('newest'),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0)
});

export type PropertyFiltersInput = z.infer<typeof PropertyFiltersSchema>;
