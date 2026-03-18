-- Add USDA food source tracking to foods table
-- Run against production: psql $DATABASE_URL -f lib/db/migrations/add-usda-food-source.sql

ALTER TABLE foods ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'curated';
ALTER TABLE foods ADD COLUMN IF NOT EXISTS usda_fdc_id INTEGER;

-- Unique index on usda_fdc_id to prevent duplicate USDA imports
CREATE UNIQUE INDEX IF NOT EXISTS foods_usda_fdc_id_idx ON foods (usda_fdc_id) WHERE usda_fdc_id IS NOT NULL;

-- Add a catch-all category/subcategory for USDA-sourced foods
INSERT INTO food_categories (name) VALUES ('USDA Foods') ON CONFLICT (name) DO NOTHING;
INSERT INTO food_subcategories (category_id, name)
  SELECT id, 'Uncategorized' FROM food_categories WHERE name = 'USDA Foods'
  ON CONFLICT DO NOTHING;
