import {
  Property,
  PropertyFilters,
  PropertySearchResult,
  SavedSearch,
  SearchRun,
  AppNotification,
  Favorite,
  DashboardStats,
  UserPreferences,
  CreateSavedSearchSchema,
  PropertySnapshot,
  PropertyEvent
} from '@koti-scout/shared';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('kotiscout_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: response.statusText };
    }
    throw new Error(errorData.error || errorData.message || 'API request failed');
  }

  return response.json();
}

export const api = {
  // Properties
  searchProperties: (filters: PropertyFilters): Promise<PropertySearchResult> => {
    const params = new URLSearchParams();
    if (filters.keyword) params.append('keyword', filters.keyword);
    if (filters.cities?.length) filters.cities.forEach(c => params.append('cities', c));
    if (filters.districts?.length) filters.districts.forEach(d => params.append('districts', d));
    if (filters.minPrice !== undefined) params.append('minPrice', String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.append('maxPrice', String(filters.maxPrice));
    if (filters.minArea !== undefined) params.append('minArea', String(filters.minArea));
    if (filters.maxArea !== undefined) params.append('maxArea', String(filters.maxArea));
    if (filters.rooms?.length) filters.rooms.forEach(r => params.append('rooms', String(r)));
    if (filters.minRooms !== undefined) params.append('minRooms', String(filters.minRooms));
    if (filters.maxRooms !== undefined) params.append('maxRooms', String(filters.maxRooms));
    if (filters.minBuildYear !== undefined) params.append('minBuildYear', String(filters.minBuildYear));
    if (filters.maxBuildYear !== undefined) params.append('maxBuildYear', String(filters.maxBuildYear));
    if (filters.maxMaintenanceFee !== undefined) params.append('maxMaintenanceFee', String(filters.maxMaintenanceFee));
    if (filters.balconyRequired) params.append('balconyRequired', 'true');
    if (filters.saunaRequired) params.append('saunaRequired', 'true');
    if (filters.elevatorRequired) params.append('elevatorRequired', 'true');
    if (filters.newBuildingOnly) params.append('newBuildingOnly', 'true');
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.offset) params.append('offset', String(filters.offset));

    return fetchJson<PropertySearchResult>(`${API_BASE}/properties/search?${params.toString()}`);
  },

  getProperty: (id: string): Promise<Property> => {
    return fetchJson<Property>(`${API_BASE}/properties/${id}`);
  },

  getPropertyHistory: (id: string): Promise<{ propertyId: string; snapshots: PropertySnapshot[]; events: PropertyEvent[] }> => {
    return fetchJson(`${API_BASE}/properties/${id}/history`);
  },

  // Saved Searches
  getSavedSearches: (): Promise<SavedSearch[]> => {
    return fetchJson<SavedSearch[]>(`${API_BASE}/saved-searches`);
  },

  createSavedSearch: (data: unknown): Promise<SavedSearch> => {
    return fetchJson<SavedSearch>(`${API_BASE}/saved-searches`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateSavedSearch: (id: string, data: Partial<SavedSearch>): Promise<SavedSearch> => {
    return fetchJson<SavedSearch>(`${API_BASE}/saved-searches/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  deleteSavedSearch: (id: string): Promise<{ success: boolean; id: string }> => {
    return fetchJson<{ success: boolean; id: string }>(`${API_BASE}/saved-searches/${id}`, {
      method: 'DELETE'
    });
  },

  runSavedSearchNow: (id: string): Promise<{ success: boolean; message: string; result: unknown }> => {
    return fetchJson(`${API_BASE}/saved-searches/${id}/run`, {
      method: 'POST'
    });
  },

  getSearchRunHistory: (savedSearchId: string): Promise<SearchRun[]> => {
    return fetchJson<SearchRun[]>(`${API_BASE}/saved-searches/${savedSearchId}/history`);
  },

  // Favorites
  getFavorites: (): Promise<Favorite[]> => {
    return fetchJson<Favorite[]>(`${API_BASE}/favorites`);
  },

  addFavorite: (propertyId: string, notes = ''): Promise<Favorite> => {
    return fetchJson<Favorite>(`${API_BASE}/favorites`, {
      method: 'POST',
      body: JSON.stringify({ propertyId, notes })
    });
  },

  updateFavoriteNotes: (propertyId: string, notes: string): Promise<Favorite> => {
    return fetchJson<Favorite>(`${API_BASE}/favorites/${propertyId}/notes`, {
      method: 'PATCH',
      body: JSON.stringify({ notes })
    });
  },

  removeFavorite: (propertyId: string): Promise<{ success: boolean; propertyId: string }> => {
    return fetchJson<{ success: boolean; propertyId: string }>(`${API_BASE}/favorites/${propertyId}`, {
      method: 'DELETE'
    });
  },

  // Notifications
  getNotifications: (): Promise<{ notifications: AppNotification[]; unreadCount: number }> => {
    return fetchJson(`${API_BASE}/notifications`);
  },

  markNotificationRead: (id: string): Promise<{ success: boolean; id: string }> => {
    return fetchJson(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH'
    });
  },

  markAllNotificationsRead: (): Promise<{ success: boolean; markedCount: number }> => {
    return fetchJson(`${API_BASE}/notifications/read-all`, {
      method: 'PATCH'
    });
  },

  // Dashboard Stats
  getDashboardStats: (): Promise<DashboardStats> => {
    return fetchJson<DashboardStats>(`${API_BASE}/stats/dashboard`);
  },

  // Preferences
  getUserPreferences: (): Promise<UserPreferences> => {
    return fetchJson<UserPreferences>(`${API_BASE}/preferences`);
  },

  updateUserPreferences: (prefs: Partial<UserPreferences>): Promise<UserPreferences> => {
    return fetchJson<UserPreferences>(`${API_BASE}/preferences`, {
      method: 'PATCH',
      body: JSON.stringify(prefs)
    });
  }
};
