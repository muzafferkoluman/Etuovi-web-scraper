import { pgTable, text, timestamp, boolean, integer, doublePrecision, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const properties = pgTable(
  'properties',
  {
    id: text('id').primaryKey(),
    externalId: text('external_id').notNull(),
    provider: text('provider').notNull(),
    sourceUrl: text('source_url').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    address: text('address').notNull(),
    postalCode: text('postal_code').notNull(),
    city: text('city').notNull(),
    district: text('district').notNull(),
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    price: integer('price').notNull(),
    area: doublePrecision('area').notNull(),
    pricePerSquareMeter: integer('price_per_square_meter').notNull(),
    rooms: integer('rooms').notNull(),
    bedrooms: integer('bedrooms'),
    propertyType: text('property_type').notNull(),
    buildYear: integer('build_year'),
    maintenanceFee: doublePrecision('maintenance_fee'),
    floor: integer('floor'),
    totalFloors: integer('total_floors'),
    hasBalcony: boolean('has_balcony').default(false).notNull(),
    hasSauna: boolean('has_sauna').default(false).notNull(),
    hasElevator: boolean('has_elevator').default(false).notNull(),
    energyClass: text('energy_class'),
    thumbnailUrl: text('thumbnail_url').notNull(),
    imageUrls: jsonb('image_urls').$type<string[]>().default([]).notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true }).notNull(),
    firstSeenAt: timestamp('first_seen_at', { withTimezone: true }).defaultNow().notNull(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).defaultNow().notNull(),
    active: boolean('active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    uniqueIndex('properties_external_id_provider_idx').on(table.provider, table.externalId),
    index('properties_city_district_idx').on(table.city, table.district),
    index('properties_price_idx').on(table.price),
    index('properties_area_idx').on(table.area),
    index('properties_active_idx').on(table.active)
  ]
);

export const propertySnapshots = pgTable(
  'property_snapshots',
  {
    id: text('id').primaryKey(),
    propertyId: text('property_id')
      .notNull()
      .references(() => properties.id, { onDelete: 'cascade' }),
    price: integer('price').notNull(),
    pricePerSquareMeter: integer('price_per_square_meter').notNull(),
    maintenanceFee: doublePrecision('maintenance_fee'),
    score: integer('score'),
    capturedAt: timestamp('captured_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('snapshots_property_captured_idx').on(table.propertyId, table.capturedAt)
  ]
);

export const savedSearches = pgTable(
  'saved_searches',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    name: text('name').notNull(),
    filters: jsonb('filters').notNull(),
    minimumScore: integer('minimum_score').default(70).notNull(),
    enabled: boolean('enabled').default(true).notNull(),
    scheduleType: text('schedule_type').default('ONCE_DAILY').notNull(),
    scheduleConfig: jsonb('schedule_config').$type<Record<string, unknown>>().default({}),
    customScheduleTimes: jsonb('custom_schedule_times').$type<string[]>().default([]),
    timezone: text('timezone').default('Europe/Helsinki').notNull(),
    notificationSettings: jsonb('notification_settings').notNull(),
    lastRunAt: timestamp('last_run_at', { withTimezone: true }),
    nextRunAt: timestamp('next_run_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('saved_searches_user_id_idx').on(table.userId),
    index('saved_searches_enabled_next_run_idx').on(table.enabled, table.nextRunAt)
  ]
);

export const searchRuns = pgTable(
  'search_runs',
  {
    id: text('id').primaryKey(),
    savedSearchId: text('saved_search_id')
      .notNull()
      .references(() => savedSearches.id, { onDelete: 'cascade' }),
    startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    status: text('status').default('SUCCESS').notNull(),
    totalFound: integer('total_found').default(0).notNull(),
    newProperties: integer('new_properties').default(0).notNull(),
    priceChanges: integer('price_changes').default(0).notNull(),
    removedProperties: integer('removed_properties').default(0).notNull(),
    matchingProperties: integer('matching_properties').default(0).notNull(),
    errorMessage: text('error_message')
  },
  (table) => [
    index('search_runs_saved_search_started_idx').on(table.savedSearchId, table.startedAt)
  ]
);

export const favorites = pgTable(
  'favorites',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    propertyId: text('property_id')
      .notNull()
      .references(() => properties.id, { onDelete: 'cascade' }),
    notes: text('notes').default('').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    uniqueIndex('favorites_user_property_idx').on(table.userId, table.propertyId),
    index('favorites_user_id_idx').on(table.userId)
  ]
);

export const notifications = pgTable(
  'notifications',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    savedSearchId: text('saved_search_id'),
    propertyId: text('property_id'),
    propertyEventId: text('property_event_id'),
    type: text('type').notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    read: boolean('read').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('notifications_user_read_created_idx').on(table.userId, table.read, table.createdAt)
  ]
);

export const propertyEvents = pgTable(
  'property_events',
  {
    id: text('id').primaryKey(),
    propertyId: text('property_id')
      .notNull()
      .references(() => properties.id, { onDelete: 'cascade' }),
    savedSearchId: text('saved_search_id'),
    type: text('type').notNull(),
    oldValue: text('old_value'),
    newValue: text('new_value'),
    difference: doublePrecision('difference'),
    percentage: doublePrecision('percentage'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    index('property_events_property_created_idx').on(table.propertyId, table.createdAt)
  ]
);

export const userPreferences = pgTable(
  'user_preferences',
  {
    userId: text('user_id').primaryKey(),
    defaultCity: text('default_city').default('Helsinki').notNull(),
    defaultTimezone: text('default_timezone').default('Europe/Helsinki').notNull(),
    defaultCurrency: text('default_currency').default('EUR').notNull(),
    criteriaWeights: jsonb('criteria_weights').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  }
);
