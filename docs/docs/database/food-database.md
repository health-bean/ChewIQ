# Food Database Architecture

This document covers the comprehensive food database system including USDA integration, categorization, and filtering strategies.

## 🗄️ Overview

The Health Platform maintains a two-tier food database system:

1. **USDA Foods Database** (`usda_foods`) - Complete reference (5,001+ foods)
2. **Curated Foods Database** (`foods`) - User-facing subset (360+ foods)

```
USDA API (400,000+ foods) 
    ↓ [Complete Import]
usda_foods table (5,001 foods)
    ↓ [Curated Filtering]
foods table (360 foods)
    ↓ [User Interface]
Food Search & Tracking
```

## 📊 Database Schema

### USDA Foods Table
```sql
CREATE TABLE usda_foods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    display_name VARCHAR(255),
    usda_fdc_id VARCHAR(50),
    source VARCHAR(50) DEFAULT 'USDA',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    
    UNIQUE(name)
);

-- Indexes for performance
CREATE INDEX idx_usda_foods_category ON usda_foods(category);
CREATE INDEX idx_usda_foods_display_name ON usda_foods(display_name);
CREATE INDEX idx_usda_foods_fdc_id ON usda_foods(usda_fdc_id);
CREATE INDEX idx_usda_foods_display_name_trgm ON usda_foods USING gin(display_name gin_trgm_ops);
```

### Curated Foods Table
```sql
CREATE TABLE foods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name VARCHAR(255) NOT NULL,
    subcategory_id INTEGER REFERENCES food_subcategories(id),
    properties JSONB,
    display_order INTEGER,
    is_common BOOLEAN DEFAULT false,
    usda_reference_id UUID REFERENCES usda_foods(id)
);

-- Indexes for performance
CREATE INDEX idx_foods_display_name ON foods(display_name);
CREATE INDEX idx_foods_subcategory ON foods(subcategory_id);
CREATE INDEX idx_foods_display_name_trgm ON foods USING gin(display_name gin_trgm_ops);
```

### Food Categories & Subcategories
```sql
CREATE TABLE food_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INTEGER
);

CREATE TABLE food_subcategories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category_id INTEGER REFERENCES food_categories(id),
    description TEXT,
    display_order INTEGER
);
```

## 🏗️ Food Categorization System

### Categories & Subcategories

#### **1. Proteins**
- Animal Proteins (ID: 1) - Beef, pork, poultry, lamb
- Plant Proteins (ID: 2) - Legumes, tofu, tempeh
- **Seafood & Fish (ID: 39)** - Fish, shellfish, seafood ✨ *New*

#### **2. Vegetables** 
- Leafy Greens (ID: 6) - Spinach, kale, lettuce
- Root Vegetables (ID: 7) - Carrots, potatoes, beets
- Cruciferous Vegetables (ID: 8) - Broccoli, cauliflower
- Nightshade Vegetables (ID: 9) - Tomatoes, peppers
- Other Fresh Vegetables (ID: 10)
- Prepared Vegetables (ID: 11)

#### **3. Fruits**
- Berries (ID: 12) - Blueberries, strawberries
- Citrus Fruits (ID: 13) - Oranges, lemons
- Tropical Fruits (ID: 14) - Mango, pineapple
- Stone Fruits (ID: 15) - Peaches, plums
- Pome Fruits (ID: 16) - Apples, pears
- Processed Fruits (ID: 17)

#### **4. Nuts & Seeds**
- Tree Nuts (ID: 21) - Almonds, walnuts
- Peanuts (ID: 22)
- Seeds (ID: 23) - Sunflower, pumpkin
- Nut & Seed Butters (ID: 24)

#### **5. Dairy & Alternatives**
- Fresh Dairy (ID: 18) - Milk, cheese, yogurt
- Fermented Dairy (ID: 19) - Kefir, aged cheese
- Plant-Based Alternatives (ID: 20)

#### **6. Grains & Starches**
- Whole Grains (ID: 3) - Brown rice, quinoa
- Refined Grains (ID: 4) - White rice, pasta
- Starchy Vegetables (ID: 5) - Potatoes, corn

#### **7. Fats & Oils**
- Cooking Oils (ID: 25) - Olive oil, coconut oil
- Animal Fats (ID: 26) - Butter, lard
- Other Healthy Fats (ID: 27) - Avocado, nuts

#### **8. Herbs & Spices**
- Fresh Herbs (ID: 28) - Fresh basil, cilantro
- Dried Herbs (ID: 29) - Dried oregano, thyme
- Spices (ID: 30) - Turmeric, cumin
- Salt & Pepper (ID: 31)

#### **9. Beverages**
- Water & Hydration (ID: 35)
- Hot Beverages (ID: 36) - Coffee, tea
- Cold Beverages (ID: 37) - Juices, sodas
- Alcoholic Beverages (ID: 38)

#### **10. Sauces & Condiments**
- Dressings & Vinegars (ID: 32)
- Sauces (ID: 33) - Tomato sauce, hot sauce
- Condiments (ID: 34) - Mustard, ketchup

## 🎯 Filtering Strategy

### ✅ INCLUDE in Curated Database
1. **Whole, unprocessed foods** (single ingredients)
2. **Essential cooking ingredients** (herbs, spices, oils)
3. **Basic prepared foods** (yogurt, cheese, canned beans)
4. **Protocol-relevant foods** (elimination diet staples)

### ❌ EXCLUDE from Curated Database
1. **Baby foods** (346 items in USDA - not relevant for adults)
2. **Fast food/restaurant items** (too processed, inconsistent)
3. **Branded products** (prefer generic versions)
4. **Highly processed foods** (cookies, candy, packaged snacks)

## 🔍 Search & Query System

### Materialized View for Fast Search
```sql
CREATE MATERIALIZED VIEW mat_food_search AS
SELECT 
    f.id,
    f.display_name as name,
    fc.name as category_name,
    fsc.name as subcategory_name,
    f.properties,
    f.is_common,
    f.usda_reference_id
FROM foods f
JOIN food_subcategories fsc ON f.subcategory_id = fsc.id
JOIN food_categories fc ON fsc.category_id = fc.id;

-- Index for fast text search
CREATE INDEX idx_mat_food_search_name_trgm 
ON mat_food_search USING gin(name gin_trgm_ops);
```

### Search Query Examples

#### Primary Search (Curated Foods)
```sql
SELECT name, category_name, subcategory_name
FROM mat_food_search 
WHERE name ILIKE '%chicken%'
ORDER BY 
    is_common DESC,
    name ASC
LIMIT 10;
```

#### Extended Search (USDA Foods Not in Curated)
```sql
SELECT u.display_name, u.category 
FROM usda_foods u
LEFT JOIN foods f ON u.id = f.usda_reference_id
WHERE f.id IS NULL  -- Not in curated database
AND u.display_name ILIKE '%chicken%'
ORDER BY u.display_name
LIMIT 50;
```

## 📥 USDA Import Process

### Current Statistics
- **USDA Foods**: 5,001 foods across 20+ categories
- **Curated Foods**: 360 foods across 10 categories
- **Database Size**: 24 MB total (0.12% of AWS free tier)
- **Last Import**: July 27, 2025

### Major USDA Categories Imported
```
Beef Products: 1,069 foods
Vegetables and Vegetable Products: 405 foods
Baby Foods: 346 foods
Baked Products: 293 foods
Legumes and Legume Products: 271 foods
Fast Foods: 223 foods
Dairy and Egg Products: 178 foods
Fruits and Fruit Juices: 165 foods
Beverages: 141 foods
Spices and Herbs: 82 foods
```

### Import Scripts
- **Complete Import**: `/scripts/complete-usda-import.js`
- **Category Import**: `/scripts/import-foods-by-category.js`
- **Working Import**: `/working-usda-import.sh` (bash + curl)

## 🏗️ Food Properties System

### JSONB Properties Structure
```json
{
  "growing": {
    "organic": false,
    "grass_fed": false,
    "free_range": false,
    "wild_caught": true
  },
  "properties": {
    "fodmap": "unknown",
    "lectin": "unknown", 
    "oxalate": "unknown",
    "histamine": "unknown",
    "nightshade": false,
    "salicylate": "unknown"
  },
  "preparation": {
    "state": "raw"
  }
}
```

### Property Values
- **FODMAP**: "low", "moderate", "high", "unknown"
- **Histamine**: "low", "moderate", "high", "unknown"
- **Oxalate**: "low", "moderate", "high", "unknown"
- **Lectin**: "low", "moderate", "high", "unknown"
- **Salicylate**: "low", "moderate", "high", "unknown"
- **Nightshade**: true/false
- **State**: "raw", "cooked", "processed", "dried", "fresh"

## 🚀 Performance Optimization

### Indexes for Fast Search
```sql
-- Text search with trigrams
CREATE INDEX idx_foods_display_name_trgm 
ON foods USING gin(display_name gin_trgm_ops);

CREATE INDEX idx_usda_foods_display_name_trgm 
ON usda_foods USING gin(display_name gin_trgm_ops);

-- Category filtering
CREATE INDEX idx_foods_subcategory ON foods(subcategory_id);
CREATE INDEX idx_usda_foods_category ON usda_foods(category);

-- Properties queries
CREATE INDEX idx_foods_properties_gin ON foods USING gin(properties);
```

### Query Performance Tips
1. **Use materialized view** for primary searches
2. **Refresh materialized view** after food imports
3. **Use trigram indexes** for fuzzy text search
4. **Limit results** for user-facing queries

## 🔄 Maintenance & Updates

### Regular Tasks
- **Weekly**: Refresh materialized views
- **Monthly**: Review new USDA foods for curation
- **Quarterly**: Expand curated foods database
- **Annually**: Full USDA database refresh

### Refresh Commands
```sql
-- Refresh search view
REFRESH MATERIALIZED VIEW mat_food_search;

-- Update statistics
ANALYZE foods;
ANALYZE usda_foods;
```

## 🎯 Future Enhancements

1. **Automated Curation**: ML-based food categorization
2. **Nutritional Integration**: Enhanced nutrient data mapping
3. **User Preferences**: Personalized food recommendations
4. **Regional Expansion**: International food databases
5. **Real-time Sync**: Automated USDA updates

---

**Last Updated**: July 27, 2025  
**USDA Version**: FoodData Central 2023-10  
**Total Foods**: 5,001 USDA | 360 Curated
