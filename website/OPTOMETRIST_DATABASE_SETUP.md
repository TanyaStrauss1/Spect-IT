# Optometrist Database Setup Guide

## Overview

The Spect-IT platform now includes a comprehensive optometrist database system that scrapes, stores, and serves optometrist information across South Africa. This system allows users to find the nearest optometrists, opticians, and ophthalmologists quickly and efficiently.

## Features

✅ **Comprehensive Database**: Over 100+ known optometrists and optical retailers across South Africa  
✅ **Web Scraping**: Automatically scrapes data from multiple sources (Spec-Savers, OPSM, Vision Express, HPCSA, Yellow Pages, etc.)  
✅ **Supabase Storage**: Persistent database storage for fast retrieval  
✅ **Background Sync**: Automatic periodic updates (every 24 hours)  
✅ **Location-Based Search**: Find nearest optometrists based on user location  
✅ **Multi-Source Data**: Combines Google Places API, web scraping, and known database  

## Setup Instructions

### Step 1: Create Optometrists Table in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the SQL script from `website/CREATE_OPTOMETRISTS_TABLE.sql`

This will create:
- `optometrists` table with all necessary fields
- Indexes for fast queries
- Row-level security policies
- Automatic timestamp updates

### Step 2: Verify Supabase Connection

Ensure `website/supabase-storage.js` is properly configured with your Supabase credentials. The optometrist database functions are automatically available once Supabase is initialized.

### Step 3: Initial Database Population

The system will automatically:
1. Load known retailers (100+ locations) on first search
2. Scrape web sources in the background
3. Save all data to Supabase database

You can also manually trigger a sync:
```javascript
window.syncOptometristDatabase();
```

## How It Works

### Search Flow

1. **Database First**: Checks Supabase database for optometrists near user location
2. **Known Retailers**: Loads comprehensive list of known South African optical retailers
3. **Google Places API**: Searches nearby locations using Google Places API
4. **Web Scraping**: Scrapes additional sources in the background
5. **Results Merged**: All results are combined, deduplicated, and sorted by distance

### Data Sources

1. **Known Database**: 100+ pre-populated optometrists across all provinces
2. **Spec-Savers**: All major Spec-Savers locations
3. **OPSM**: OPSM store locations
4. **Vision Express**: Vision Express locations
5. **HPCSA Directory**: Health Professions Council of South Africa listings
6. **Yellow Pages**: Yellow Pages South Africa
7. **HelloPeter**: HelloPeter business directory
8. **Brabys**: Brabys business directory
9. **Ananzi**: Ananzi business directory
10. **Google Places API**: Real-time Google Business listings

### Background Sync

The system automatically syncs the database:
- **On Page Load**: If last sync was > 24 hours ago
- **Periodic**: Every 24 hours automatically
- **Manual**: Can be triggered via `window.syncOptometristDatabase()`

## Database Schema

```sql
optometrists (
    id BIGSERIAL PRIMARY KEY,
    place_id TEXT UNIQUE,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'optometrist', 'optician', 'ophthalmologist'
    address TEXT,
    location JSONB, -- {lat: number, lng: number}
    phone TEXT,
    email TEXT,
    website TEXT,
    rating DECIMAL,
    rating_count INTEGER,
    open_now BOOLEAN,
    licensed TEXT, -- 'yes', 'no', 'likely', 'unknown'
    license_info TEXT,
    license_verify_url TEXT,
    source TEXT,
    price_level INTEGER,
    province TEXT,
    city TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
```

## API Functions

### Save Optometrist
```javascript
window.saveOptometristToSupabase(optometrist);
```

### Batch Save
```javascript
window.saveOptometristsBatchToSupabase(optometrists);
```

### Get Optometrists
```javascript
const optometrists = await window.getOptometristsFromSupabase(location, maxDistanceKm);
```

### Sync Database
```javascript
window.syncOptometristDatabase(location);
```

## Coverage

The database includes optometrists from:

- **Western Cape**: Cape Town, Stellenbosch, Paarl, George, Knysna, etc.
- **Gauteng**: Johannesburg, Pretoria, Sandton, Centurion, etc.
- **KwaZulu-Natal**: Durban, Umhlanga, Pietermaritzburg, etc.
- **Eastern Cape**: Port Elizabeth, East London, Grahamstown, etc.
- **Free State**: Bloemfontein, Welkom, etc.
- **Limpopo**: Polokwane, etc.
- **Mpumalanga**: Nelspruit, etc.
- **North West**: Rustenburg, Potchefstroom, Klerksdorp, etc.
- **Northern Cape**: Kimberley, etc.

## Performance

- **Database Queries**: Fast indexed queries by location
- **Caching**: 5-minute cache for search results
- **Background Processing**: Web scraping doesn't block user interface
- **Deduplication**: Automatic duplicate detection by place_id

## Maintenance

### Updating Known Retailers

Edit `getKnownSouthAfricanOpticalRetailers()` function in `website/specialists.js` to add more known locations.

### Adjusting Sync Frequency

Modify `SYNC_INTERVAL` constant in `website/specialists.js`:
```javascript
const SYNC_INTERVAL = 24 * 60 * 60 * 1000; // Change to desired interval
```

### Adding Scraping Sources

Add new sources to the `sources` array in `scrapeOptometristsFromWeb()` function.

## Troubleshooting

### Database Not Populating

1. Check Supabase connection: `window.isSupabaseReady()`
2. Verify table exists: Check Supabase dashboard
3. Check browser console for errors
4. Manually trigger sync: `window.syncOptometristDatabase()`

### No Results Showing

1. Check user location is available
2. Verify search radius is appropriate
3. Check if database has data: Query Supabase directly
4. Check browser console for API errors

### Sync Not Working

1. Check `syncInProgress` flag isn't stuck
2. Verify last sync time in localStorage: `localStorage.getItem('optometrist_db_last_sync')`
3. Check browser console for sync errors

## Future Enhancements

- [ ] PostGIS integration for advanced spatial queries
- [ ] Real-time updates via Supabase real-time subscriptions
- [ ] User-submitted optometrist listings
- [ ] Reviews and ratings system
- [ ] Appointment booking integration
- [ ] Multi-language support

## Support

For issues or questions, check:
- Browser console for error messages
- Supabase dashboard for database status
- Network tab for API call failures

