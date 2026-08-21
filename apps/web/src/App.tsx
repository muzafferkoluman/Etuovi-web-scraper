import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Property,
  PropertyFilters,
  SavedSearch,
  Favorite,
  AppNotification,
  DashboardStats,
  UserPreferences
} from '@koti-scout/shared';
import { api } from './lib/api-client';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { SearchPage } from './features/search/SearchPage';
import { SavedSearchesPage } from './features/saved-searches/SavedSearchesPage';
import { FavoritesPage } from './features/favorites/FavoritesPage';
import { ComparePage } from './features/compare/ComparePage';
import { NotificationsPage } from './features/notifications/NotificationsPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { DevDebugPage } from './features/dev/DevDebugPage';
import { LoginPage } from './features/auth/LoginPage';
import { SignupPage } from './features/auth/SignupPage';
import { AuthProvider } from './contexts/AuthContext';
import { CreateSearchModal } from './features/saved-searches/CreateSearchModal';

export const AppContent: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Search filter state
  const [filters, setFilters] = useState<PropertyFilters>({
    cities: ['Helsinki'],
    sortBy: 'newest',
    limit: 30
  });

  // Compare properties state (max 4)
  const [comparedProperties, setComparedProperties] = useState<Property[]>([]);
  const [saveSearchModalOpen, setSaveSearchModalOpen] = useState(false);
  const [runningSearchId, setRunningSearchId] = useState<string | null>(null);
  const [runFeedback, setRunFeedback] = useState<{ id: string; message: string } | null>(null);

  // Queries
  const { data: searchResult, isLoading: propertiesLoading } = useQuery({
    queryKey: ['properties', filters],
    queryFn: () => api.searchProperties(filters)
  });

  const { data: savedSearches = [] } = useQuery({
    queryKey: ['saved-searches'],
    queryFn: () => api.getSavedSearches()
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => api.getFavorites()
  });

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.getNotifications()
  });

  const { data: stats = null } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.getDashboardStats()
  });

  const { data: preferences = null } = useQuery({
    queryKey: ['preferences'],
    queryFn: () => api.getUserPreferences()
  });

  const favoriteIds = favorites.map((f) => f.propertyId);
  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unreadCount || 0;
  const properties = searchResult?.properties || [];
  const totalProperties = searchResult?.total || 0;

  // Toggle Favorite
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      if (favoriteIds.includes(propertyId)) {
        return api.removeFavorite(propertyId);
      } else {
        return api.addFavorite(propertyId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    }
  });

  // Toggle Compare
  const handleToggleCompare = (property: Property) => {
    setComparedProperties((prev) => {
      const exists = prev.some((p) => p.id === property.id);
      if (exists) {
        return prev.filter((p) => p.id !== property.id);
      }
      if (prev.length >= 4) {
        alert('You can compare up to 4 properties simultaneously.');
        return prev;
      }
      return [...prev, property];
    });
  };

  // Run Saved Search Now
  const handleRunSearchNow = async (id: string) => {
    setRunningSearchId(id);
    try {
      const res = await api.runSavedSearchNow(id);
      setRunFeedback({ id, message: res.message });
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setTimeout(() => setRunFeedback(null), 8000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Execution error';
      alert(msg);
    } finally {
      setRunningSearchId(null);
    }
  };

  // Mark notification read
  const handleMarkRead = async (id: string) => {
    await api.markNotificationRead(id);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar
        notifications={notifications}
        unreadCount={unreadCount}
        compareCount={comparedProperties.length}
        favoritesCount={favoriteIds.length}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
        onOpenNotificationProperty={(propId) => {
          navigate(`/search?keyword=${encodeURIComponent(propId)}`);
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 md:pb-8">
        <Routes>
          <Route
            path="/"
            element={
              <DashboardPage
                stats={stats}
                savedSearches={savedSearches}
                properties={properties}
                favorites={favoriteIds}
                comparedProperties={comparedProperties}
                onToggleFavorite={(id) => toggleFavoriteMutation.mutate(id)}
                onToggleCompare={handleToggleCompare}
                onRunSearchNow={handleRunSearchNow}
                runningSearchId={runningSearchId}
                runFeedback={runFeedback}
              />
            }
          />
          <Route
            path="/search"
            element={
              <SearchPage
                properties={properties}
                total={totalProperties}
                isLoading={propertiesLoading}
                filters={filters}
                onFilterChange={setFilters}
                favorites={favoriteIds}
                comparedProperties={comparedProperties}
                onToggleFavorite={(id) => toggleFavoriteMutation.mutate(id)}
                onToggleCompare={handleToggleCompare}
                onSaveSearchModalOpen={() => setSaveSearchModalOpen(true)}
              />
            }
          />
          <Route
            path="/saved-searches"
            element={
              <SavedSearchesPage
                savedSearches={savedSearches}
                onRefresh={() => queryClient.invalidateQueries({ queryKey: ['saved-searches'] })}
                onRunSearchNow={handleRunSearchNow}
                runningSearchId={runningSearchId}
                runFeedback={runFeedback}
              />
            }
          />
          <Route
            path="/favorites"
            element={
              <FavoritesPage
                favorites={favorites}
                onRefresh={() => queryClient.invalidateQueries({ queryKey: ['favorites'] })}
                onToggleFavorite={(id) => toggleFavoriteMutation.mutate(id)}
                comparedProperties={comparedProperties}
                onToggleCompare={handleToggleCompare}
              />
            }
          />
          <Route
            path="/compare"
            element={
              <ComparePage
                properties={comparedProperties}
                onRemoveFromCompare={(id) =>
                  setComparedProperties((prev) => prev.filter((p) => p.id !== id))
                }
                onClearCompare={() => setComparedProperties([])}
              />
            }
          />
          <Route
            path="/notifications"
            element={
              <NotificationsPage
                notifications={notifications}
                onMarkRead={handleMarkRead}
                onMarkAllRead={handleMarkAllRead}
              />
            }
          />
          <Route
            path="/settings"
            element={
              <SettingsPage
                preferences={preferences}
                onRefresh={() => queryClient.invalidateQueries({ queryKey: ['preferences'] })}
              />
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dev" element={<DevDebugPage />} />
        </Routes>
      </main>

      <Footer />

      {/* Save Search Modal */}
      <CreateSearchModal
        isOpen={saveSearchModalOpen}
        onClose={() => setSaveSearchModalOpen(false)}
        onSave={async (data) => {
          await api.createSavedSearch(data);
          queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
        }}
        initialFilters={filters}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};
