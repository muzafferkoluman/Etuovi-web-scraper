-- =================================================================
-- KotiScout Supabase Row Level Security (RLS) Policies
-- Migration: 0001_rls_policies.sql
-- =================================================================

-- 1. Enable RLS on user-specific tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- 2. Enable RLS on shared property market tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_events ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- Profiles Policies
-- =================================================================
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid()::text = id);

-- =================================================================
-- Saved Searches Policies (Full CRUD scoped to owner)
-- =================================================================
CREATE POLICY "Users can view own saved searches"
  ON saved_searches FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own saved searches"
  ON saved_searches FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own saved searches"
  ON saved_searches FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own saved searches"
  ON saved_searches FOR DELETE
  USING (auth.uid()::text = user_id);

-- =================================================================
-- Search Runs Policies (Derived from Saved Search ownership)
-- =================================================================
CREATE POLICY "Users can view search runs for own saved searches"
  ON search_runs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM saved_searches
      WHERE saved_searches.id = search_runs.saved_search_id
      AND saved_searches.user_id = auth.uid()::text
    )
  );

-- =================================================================
-- Favorites Policies (Scoped to owner)
-- =================================================================
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can add own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own favorite notes"
  ON favorites FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  USING (auth.uid()::text = user_id);

-- =================================================================
-- Notifications Policies (Private to user)
-- =================================================================
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update read status on own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- =================================================================
-- User Preferences Policies
-- =================================================================
CREATE POLICY "Users can access own preferences"
  ON user_preferences FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- =================================================================
-- Shared Real Estate Market Data Policies
-- =================================================================
CREATE POLICY "Public read for properties"
  ON properties FOR SELECT
  USING (true);

CREATE POLICY "Public read for property snapshots"
  ON property_snapshots FOR SELECT
  USING (true);

CREATE POLICY "Public read for property events"
  ON property_events FOR SELECT
  USING (true);

-- Service Role Key bypasses RLS for automated backend scraper / cron updates.
