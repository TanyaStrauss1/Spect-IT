/**
 * Google Places API Proxy
 * Server-side proxy for Google Places API to keep API key secure
 * Supports geolocation-based and text-based search for eye care providers
 */

import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY

interface PlaceResult {
  place_id: string
  name: string
  formatted_address: string
  formatted_phone_number?: string
  international_phone_number?: string
  opening_hours?: {
    open_now?: boolean
    weekday_text?: string[]
  }
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  rating?: number
  user_ratings_total?: number
}

interface PlacesResponse {
  results: PlaceResult[]
  status: string
  error?: string
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const query = searchParams.get('query')
  const radius = searchParams.get('radius') || '5000' // Default 5km radius

  // Validate inputs
  if (!lat && !lng && !query) {
    return NextResponse.json(
      { error: 'Either lat/lng or query parameter is required', results: [], status: 'INVALID_REQUEST' },
      { status: 400 }
    )
  }

  if ((lat && !lng) || (!lat && lng)) {
    return NextResponse.json(
      { error: 'Both lat and lng are required for location-based search', results: [], status: 'INVALID_REQUEST' },
      { status: 400 }
    )
  }

  // If no API key, return empty results (graceful degradation)
  if (!GOOGLE_PLACES_API_KEY) {
    console.warn('GOOGLE_PLACES_API_KEY not configured - Places API disabled')
    return NextResponse.json({
      results: [],
      status: 'API_KEY_NOT_CONFIGURED',
      error: 'Places API is not configured. Set GOOGLE_PLACES_API_KEY environment variable.'
    })
  }

  try {
    let apiUrl: string
    let apiParams: Record<string, string>

    if (lat && lng) {
      // Nearby Search - find optometrists/eye care near coordinates
      apiUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
      apiParams = {
        location: `${lat},${lng}`,
        radius: radius,
        keyword: 'optometrist OR optician OR "eye care" OR "eye doctor"',
        key: GOOGLE_PLACES_API_KEY,
      }
    } else if (query) {
      // Text Search - find optometrists by city/query
      apiUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json'
      apiParams = {
        query: `${query} optometrist OR optician OR eye care`,
        key: GOOGLE_PLACES_API_KEY,
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid search parameters', results: [], status: 'INVALID_REQUEST' },
        { status: 400 }
      )
    }

    // Build URL with query params
    const url = new URL(apiUrl)
    Object.entries(apiParams).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    // Fetch from Google Places API
    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data.status, data.error_message)
      return NextResponse.json(
        {
          error: data.error_message || 'Google Places API error',
          results: [],
          status: data.status,
        },
        { status: response.ok ? 200 : response.status }
      )
    }

    // Fetch place details for each result to get phone numbers and opening hours
    const detailedResults = await Promise.all(
      (data.results || []).slice(0, 10).map(async (place: any) => {
        try {
          const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json')
          detailsUrl.searchParams.append('place_id', place.place_id)
          detailsUrl.searchParams.append('fields', 'formatted_phone_number,international_phone_number,opening_hours')
          detailsUrl.searchParams.append('key', GOOGLE_PLACES_API_KEY!)

          const detailsResponse = await fetch(detailsUrl.toString())
          const detailsData = await detailsResponse.json()

          return {
            place_id: place.place_id,
            name: place.name,
            formatted_address: place.vicinity || place.formatted_address,
            formatted_phone_number: detailsData.result?.formatted_phone_number,
            international_phone_number: detailsData.result?.international_phone_number,
            opening_hours: detailsData.result?.opening_hours,
            geometry: place.geometry,
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
          }
        } catch (error) {
          console.error('Error fetching place details:', error)
          // Return basic info if details fetch fails
          return {
            place_id: place.place_id,
            name: place.name,
            formatted_address: place.vicinity || place.formatted_address,
            geometry: place.geometry,
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
          }
        }
      })
    )

    return NextResponse.json({
      results: detailedResults,
      status: data.status,
    })
  } catch (error: any) {
    console.error('Places API proxy error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch nearby eye care providers',
        results: [],
        status: 'UNKNOWN_ERROR',
      },
      { status: 500 }
    )
  }
}
