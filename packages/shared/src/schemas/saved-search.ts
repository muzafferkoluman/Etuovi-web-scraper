import { z } from 'zod';
import { PropertyFiltersSchema } from './property';

export const ScheduleTypeSchema = z.enum([
  'MANUAL',
  'ONCE_DAILY',
  'TWICE_DAILY',
  'THRICE_DAILY',
  'CUSTOM'
]);

export const NotificationSettingsSchema = z.object({
  inApp: z.boolean().default(true),
  email: z.boolean().optional().default(false),
  telegram: z.boolean().optional().default(false),
  notifyOnNewProperty: z.boolean().default(true),
  notifyOnPriceDrop: z.boolean().default(true),
  notifyOnHighScore: z.boolean().default(true),
  minScoreForNotification: z.number().min(0).max(100).optional().default(80)
});

export const CreateSavedSearchSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  filters: PropertyFiltersSchema,
  minimumScore: z.number().min(0).max(100).default(70),
  enabled: z.boolean().default(true),
  scheduleType: ScheduleTypeSchema.default('ONCE_DAILY'),
  customScheduleTimes: z.array(z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/)).optional(),
  timezone: z.string().default('Europe/Helsinki'),
  notificationSettings: NotificationSettingsSchema.default({})
});

export const UpdateSavedSearchSchema = CreateSavedSearchSchema.partial();

export const CreateFavoriteSchema = z.object({
  propertyId: z.string().min(1),
  notes: z.string().max(1000).optional().default('')
});

export const UpdateFavoriteSchema = z.object({
  notes: z.string().max(1000)
});

export const UserPreferencesSchema = z.object({
  defaultCity: z.string().default('Helsinki'),
  defaultTimezone: z.string().default('Europe/Helsinki'),
  defaultCurrency: z.string().default('EUR'),
  criteriaWeights: z.object({
    price: z.number().min(0).max(100).default(25),
    area: z.number().min(0).max(100).default(15),
    location: z.number().min(0).max(100).default(20),
    buildYear: z.number().min(0).max(100).default(10),
    maintenanceFee: z.number().min(0).max(100).default(10),
    pricePerSquareMeter: z.number().min(0).max(100).default(10),
    features: z.number().min(0).max(100).default(10)
  }).default({
    price: 25,
    area: 15,
    location: 20,
    buildYear: 10,
    maintenanceFee: 10,
    pricePerSquareMeter: 10,
    features: 10
  })
});
