export interface FinnishDistrictInfo {
  name: string;
  city: string;
  postalCodes: string[];
  medianPricePerSqm: number;
}

export const FINNISH_CITIES = [
  'Helsinki',
  'Espoo',
  'Vantaa',
  'Tampere',
  'Turku',
  'Oulu',
  'Jyväskylä',
  'Lahti',
  'Kuopio',
  'Pori'
] as const;

export type FinnishCity = (typeof FINNISH_CITIES)[number];

export const FINNISH_DISTRICTS: Record<string, FinnishDistrictInfo[]> = {
  Helsinki: [
    { name: 'Kallio', city: 'Helsinki', postalCodes: ['00530', '00500'], medianPricePerSqm: 5800 },
    { name: 'Kamppi', city: 'Helsinki', postalCodes: ['00100'], medianPricePerSqm: 7900 },
    { name: 'Töölö', city: 'Helsinki', postalCodes: ['00250', '00260'], medianPricePerSqm: 6900 },
    { name: 'Lauttasaari', city: 'Helsinki', postalCodes: ['00200', '00210'], medianPricePerSqm: 6300 },
    { name: 'Punavuori', city: 'Helsinki', postalCodes: ['00120'], medianPricePerSqm: 7400 },
    { name: 'Pasila', city: 'Helsinki', postalCodes: ['00520'], medianPricePerSqm: 5200 },
    { name: 'Kruununhaka', city: 'Helsinki', postalCodes: ['00170'], medianPricePerSqm: 7600 },
    { name: 'Eira', city: 'Helsinki', postalCodes: ['00150'], medianPricePerSqm: 8900 },
    { name: 'Haaga', city: 'Helsinki', postalCodes: ['00400'], medianPricePerSqm: 4300 },
    { name: 'Vuosaari', city: 'Helsinki', postalCodes: ['00980', '00960'], medianPricePerSqm: 3600 },
    { name: 'Kalasatama', city: 'Helsinki', postalCodes: ['00580'], medianPricePerSqm: 6800 },
    { name: 'Jätkäsaari', city: 'Helsinki', postalCodes: ['00220'], medianPricePerSqm: 6500 }
  ],
  Espoo: [
    { name: 'Matinkylä', city: 'Espoo', postalCodes: ['02230'], medianPricePerSqm: 4200 },
    { name: 'Tapiola', city: 'Espoo', postalCodes: ['02100'], medianPricePerSqm: 5300 },
    { name: 'Leppävaara', city: 'Espoo', postalCodes: ['02600', '02650'], medianPricePerSqm: 3900 },
    { name: 'Otaniemi', city: 'Espoo', postalCodes: ['02150'], medianPricePerSqm: 4900 },
    { name: 'Haukilahti', city: 'Espoo', postalCodes: ['02170'], medianPricePerSqm: 5100 },
    { name: 'Espoon keskus', city: 'Espoo', postalCodes: ['02770'], medianPricePerSqm: 3100 }
  ],
  Vantaa: [
    { name: 'Tikkurila', city: 'Vantaa', postalCodes: ['01300'], medianPricePerSqm: 3800 },
    { name: 'Myyrmäki', city: 'Vantaa', postalCodes: ['01600'], medianPricePerSqm: 3200 },
    { name: 'Kivistö', city: 'Vantaa', postalCodes: ['01700'], medianPricePerSqm: 3700 },
    { name: 'Korso', city: 'Vantaa', postalCodes: ['01450'], medianPricePerSqm: 2600 }
  ],
  Tampere: [
    { name: 'Keskusta', city: 'Tampere', postalCodes: ['33100'], medianPricePerSqm: 4400 },
    { name: 'Pyynikki', city: 'Tampere', postalCodes: ['33230'], medianPricePerSqm: 4600 },
    { name: 'Tammela', city: 'Tampere', postalCodes: ['33500'], medianPricePerSqm: 4100 },
    { name: 'Hervanta', city: 'Tampere', postalCodes: ['33720'], medianPricePerSqm: 2500 },
    { name: 'Kaleva', city: 'Tampere', postalCodes: ['33540'], medianPricePerSqm: 3900 }
  ],
  Turku: [
    { name: 'Keskusta', city: 'Turku', postalCodes: ['20100'], medianPricePerSqm: 3900 },
    { name: 'Kupittaa', city: 'Turku', postalCodes: ['20520'], medianPricePerSqm: 3700 },
    { name: 'Port Arthur', city: 'Turku', postalCodes: ['20100'], medianPricePerSqm: 4100 },
    { name: 'Runosmäki', city: 'Turku', postalCodes: ['20360'], medianPricePerSqm: 2100 }
  ]
};

export const PROPERTY_TYPES = [
  'Apartment', // Kerrostalo
  'Row house', // Rivitalo
  'Detached house', // Omakotitalo
  'Semi-detached', // Paritalo
  'Other'
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'sqm-price-low', label: '€/m²: Low to High' },
  { value: 'sqm-price-high', label: '€/m²: High to Low' },
  { value: 'area-high', label: 'Area: Largest first' },
  { value: 'score-high', label: 'Match Score: Highest' }
] as const;

export type SortByOption = (typeof SORT_OPTIONS)[number]['value'];
