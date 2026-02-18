-- Supabase Database Schema for Mika Log
-- Run this in your Supabase SQL Editor to set up the database tables

-- ==========================================
-- Table 1: library_items
-- ==========================================
CREATE TABLE IF NOT EXISTS library_items (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('book', 'film', 'show')),
  title TEXT NOT NULL,
  author_director TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  synopsis TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('want', 'current', 'finished')),
  rating NUMERIC,
  personal_rating NUMERIC CHECK (personal_rating >= 0 AND personal_rating <= 5),
  personal_tags TEXT[],
  personal_notes TEXT,
  date_added TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_library_items_user_id ON library_items(user_id);
CREATE INDEX IF NOT EXISTS idx_library_items_type ON library_items(type);
CREATE INDEX IF NOT EXISTS idx_library_items_status ON library_items(status);
CREATE INDEX IF NOT EXISTS idx_library_items_date_added ON library_items(date_added DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own library items
CREATE POLICY "Users can view their own library items"
  ON library_items FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own library items
CREATE POLICY "Users can insert their own library items"
  ON library_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own library items
CREATE POLICY "Users can update their own library items"
  ON library_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own library items
CREATE POLICY "Users can delete their own library items"
  ON library_items FOR DELETE
  USING (auth.uid() = user_id);

-- ==========================================
-- Table 2: user_reviews
-- ==========================================
CREATE TABLE IF NOT EXISTS user_reviews (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  item_title TEXT NOT NULL,
  item_cover_image TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('book', 'film', 'show')),
  rating NUMERIC NOT NULL CHECK (rating >= 0 AND rating <= 5),
  review_text TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_reviews_user_id ON user_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_item_id ON user_reviews(item_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_created_at ON user_reviews(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own reviews
CREATE POLICY "Users can view their own reviews"
  ON user_reviews FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own reviews
CREATE POLICY "Users can insert their own reviews"
  ON user_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
  ON user_reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews"
  ON user_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- ==========================================
-- Trigger to automatically set user_id
-- ==========================================
-- For library_items
CREATE OR REPLACE FUNCTION set_user_id_library_items()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_set_user_id_library_items
  BEFORE INSERT ON library_items
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id_library_items();

-- For user_reviews
CREATE OR REPLACE FUNCTION set_user_id_user_reviews()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_set_user_id_user_reviews
  BEFORE INSERT ON user_reviews
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id_user_reviews();

-- ==========================================
-- Trigger to update updated_at timestamp
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to library_items
CREATE TRIGGER update_library_items_updated_at
  BEFORE UPDATE ON library_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to user_reviews
CREATE TRIGGER update_user_reviews_updated_at
  BEFORE UPDATE ON user_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
