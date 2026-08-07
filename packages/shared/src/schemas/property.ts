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

const stringOrArray = z.preprocess((val) => {
  if (typeof val === 'string') return [val];
  if (Array.isArray(val)) return val;
  return undefined;
}, z.array(z.string()).optional());

const propertyTypesOrArray = z.preprocess((val) => {
  if (typeof val === 'string') return [val];
  if (Array.isArray(val)) return val;
  return undefined;
}, z.array(PropertyTypeSchema).optional());

export const PropertyFiltersSchema = z.object({
  keyword: z.string().optional(),
  cities: stringOrArray,
  districts: stringOrArray,
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
  propertyTypes: propertyTypesOrArray,
  maxMaintenanceFee: z.coerce.number().min(0).optional(),
  balconyRequired: z.preprocess((v) => v === 'true' || v === true, z.boolean().optional()),
  saunaRequired: z.preprocess((v) => v === 'true' || v === true, z.boolean().optional()),
  elevatorRequired: z.preprocess((v) => v === 'true' || v === true, z.boolean().optional()),
  newBuildingOnly: z.preprocess((v) => v === 'true' || v === true, z.boolean().optional()),
  sortBy: SortBySchema.optional().default('newest'),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0)
});

export type PropertyFiltersInput = z.infer<typeof PropertyFiltersSchema>;
