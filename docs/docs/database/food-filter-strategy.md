# Food Database Filter Strategy

## Overview

The health platform maintains two food databases:
1. **USDA Foods Database** (`usda_foods`) - Complete mirror of USDA FoodData Central (5,001+ foods)
2. **Curated Foods Database** (`foods`) - Filtered subset optimized for chronic illness tracking (360+ foods)

## Database Architecture

```
USDA API (400,000+ foods) 
    ↓ [Complete Import]
usda_foods table (5,001 foods)
    ↓ [Curated Filtering]
foods table (360 foods)
    ↓ [User Interface]
Food Search & Tracking
```

## Filtering Criteria for Curated Foods

### ✅ INCLUDE

#### 1. **Whole, Unprocessed Foods**
- Single-ingredient items (chicken breast, broccoli, apple)
- Raw or minimally processed foods
- Basic cooking ingredients

#### 2. **Essential Cooking Ingredients**
- **Herbs & Spices**: basil, oregano, turmeric, cumin, etc.
- **Cooking Oils**: olive oil, coconut oil, avocado oil
- **Basic Seasonings**: salt, pepper, garlic powder

#### 3. **Common Prepared Foods**
- **Dairy**: plain yogurt, basic cheeses, milk varieties
- **Canned/Preserved**: canned beans, canned fish (in water)
- **Fermented Foods**: sauerkraut, kimchi, kefir

#### 4. **Protocol-Relevant Foods**
- Foods commonly referenced in elimination diets
- Foods with known trigger potential (nightshades, high-histamine foods)
- Nutrient-dense whole foods

### ❌ EXCLUDE

#### 1. **Baby Foods**
- All baby food categories (346 items in USDA)
- Not relevant for adult chronic illness tracking

#### 2. **Fast Food & Restaurant Items**
- McDonald's, Burger King, Pizza Hut items
- Inconsistent preparation methods
- Too processed for elimination diet tracking

#### 3. **Branded Products**
- Specific brand items (prefer generic versions)
- Commercial packaged foods with proprietary recipes

#### 4. **Highly Processed Foods**
- Cookies, candy, packaged snacks
- Foods with long ingredient lists
- Artificial/synthetic food products

#### 5. **Redundant Variations**
- Multiple preparation methods of same food
- Slight variations (e.g., "cooked with salt" vs "cooked without salt")

## Implementation Strategy

### Phase 1: Core Foods (Current - 360 foods)
- Essential proteins (meat, fish, eggs)
- Basic vegetables and fruits
- Common cooking ingredients
- Dairy staples

### Phase 2: Expansion (Target - 500-600 foods)
- More vegetable varieties
- Additional herbs and spices
- Fermented foods
- Nuts and seeds varieties

### Phase 3: Specialized (Target - 800-1000 foods)
- Protocol-specific foods
- Regional/cultural foods
- Specialty health foods

## Technical Implementation

### SQL Filter Pattern
```sql
-- Example filter for vegetables
SELECT DISTINCT
    CASE 
        WHEN display_name ILIKE '%spinach%' THEN 'Spinach'
        WHEN display_name ILIKE '%kale%' THEN 'Kale'
        -- ... more mappings
    END as display_name,
    subcategory_id,
    properties,
    id as usda_reference_id
FROM usda_foods 
WHERE category = 'Vegetables and Vegetable Products'
AND (display_name ILIKE '%spinach%' OR display_name ILIKE '%kale%')
AND display_name NOT LIKE '%baby%'
AND display_name NOT LIKE '%cooked%'
AND display_name NOT LIKE '%frozen%'
-- Prevent duplicates
AND [mapped_name] NOT IN (SELECT display_name FROM foods)
```

### Subcategory Mapping
- **Proteins**: Animal Proteins (1), Plant Proteins (2), Seafood & Fish (39)
- **Vegetables**: Leafy Greens (6), Root Vegetables (7), Cruciferous (8), etc.
- **Herbs & Spices**: Fresh Herbs (28), Dried Herbs (29), Spices (30)
- **Fats & Oils**: Cooking Oils (25), Animal Fats (26)

## Quality Assurance

### Data Validation Rules
1. **No duplicates** in curated foods table
2. **Valid USDA reference** for each curated food
3. **Proper subcategory mapping** based on food type
4. **Consistent naming convention** (Title Case, descriptive)

### Regular Maintenance
- **Monthly review** of new USDA foods
- **Quarterly expansion** of curated foods
- **Annual full audit** of both databases

## Current Statistics

- **USDA Foods**: 5,001 foods across 20+ categories
- **Curated Foods**: 360 foods across 10 categories
- **Coverage**: ~7% of USDA database (intentionally selective)
- **Database Size**: 24 MB total (well within AWS free tier)

## Benefits of This Approach

1. **Complete USDA Reference**: Full dataset available for future expansion
2. **Curated User Experience**: Clean, relevant food list for daily tracking
3. **Scalable Architecture**: Easy to expand curated foods as needed
4. **Cost Effective**: Minimal storage impact on AWS free tier
5. **Maintenance Friendly**: Clear separation of concerns

## Future Enhancements

1. **Automated Filtering**: ML-based food categorization
2. **User Preferences**: Personalized food recommendations
3. **Regional Expansion**: International food databases
4. **Nutritional Integration**: Enhanced nutrient data mapping

---

**Last Updated**: July 27, 2025  
**Database Version**: USDA FoodData Central 2023-10  
**Total Foods**: 5,001 USDA | 360 Curated
