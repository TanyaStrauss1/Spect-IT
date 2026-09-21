/**
 * Find Care Nearby Component
 * Helps users find optometrists/opticians near them after screening
 * Uses Google Places API (server-side) with graceful fallback to Maps deep links
 */

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui'

interface Place {
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

interface FindCareNearbyProps {
  /** Whether to show this component (e.g., based on screening results) */
  show?: boolean
  /** Custom title */
  title?: string
}

export function FindCareNearby({ show = true, title = 'Find Nearby Eye Care' }: FindCareNearbyProps) {
  const [loading, setLoading] = useState(false)
  const [places, setPlaces] = useState<Place[]>([])
  const [error, setError] = useState<string | null>(null)
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')
  const [searchQuery, setSearchQuery] = useState('')
  const [apiAvailable, setApiAvailable] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  if (!show) return null

  const handleLocationSearch = async () => {
    setLoading(true)
    setError(null)
    setPlaces([])

    try {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser')
        setApiAvailable(false)
        return
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        })
      })

      const { latitude, longitude } = position.coords
      setUserLocation({ lat: latitude, lng: longitude })
      setLocationPermission('granted')

      // Call our API route
      const response = await fetch(
        `/api/places?lat=${latitude}&lng=${longitude}&radius=5000`
      )
      const data = await response.json()

      if (data.status === 'API_KEY_NOT_CONFIGURED') {
        setApiAvailable(false)
        setError('Places API is not configured. Use the fallback search below.')
      } else if (data.status === 'ZERO_RESULTS') {
        setError('No eye care providers found nearby. Try searching by city name.')
      } else if (data.status === 'OK') {
        setPlaces(data.results || [])
      } else {
        setError(data.error || 'Failed to find nearby providers')
      }
    } catch (error: any) {
      console.error('Location search error:', error)
      if (error.code === 1) {
        setLocationPermission('denied')
        setError('Location permission denied. Enter your city below to search.')
      } else {
        setError('Failed to get your location. Enter your city below to search.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleQuerySearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    setError(null)
    setPlaces([])

    try {
      const response = await fetch(
        `/api/places?query=${encodeURIComponent(searchQuery)}`
      )
      const data = await response.json()

      if (data.status === 'API_KEY_NOT_CONFIGURED') {
        setApiAvailable(false)
        setError('Places API is not configured. Use the fallback search below.')
      } else if (data.status === 'ZERO_RESULTS') {
        setError('No eye care providers found. Try a different city or area.')
      } else if (data.status === 'OK') {
        setPlaces(data.results || [])
      } else {
        setError(data.error || 'Failed to search for providers')
      }
    } catch (error) {
      console.error('Query search error:', error)
      setError('Failed to search. Try again or use the fallback link below.')
    } finally {
      setLoading(false)
    }
  }

  const getMapsUrl = (place: Place) => {
    const { lat, lng } = place.geometry.location
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`
  }

  const getCallUrl = (phone?: string) => {
    if (!phone) return null
    return `tel:${phone.replace(/\s+/g, '')}`
  }

  const getFallbackMapsUrl = () => {
    if (userLocation) {
      return `https://www.google.com/maps/search/optometrist+eye+care/@${userLocation.lat},${userLocation.lng},13z`
    }
    if (searchQuery.trim()) {
      return `https://www.google.com/maps/search/optometrist+eye+care+${encodeURIComponent(searchQuery)}`
    }
    return `https://www.google.com/maps/search/optometrist+eye+care`
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 print:hidden">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        🗺️ {title}
      </h2>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
        <p className="text-sm text-blue-900">
          <strong>Referral Aid:</strong> This tool helps you find licensed optometrists and opticians for comprehensive eye examinations. 
          This is a referral aid only — not a medical recommendation or endorsement of any specific provider. 
          Always verify provider credentials and services before scheduling.
        </p>
      </div>

      {/* Search Controls */}
      <div className="space-y-4 mb-6">
        <div>
          <Button
            onClick={handleLocationSearch}
            disabled={loading}
            className="w-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {loading ? '📍 Searching...' : '📍 Find Care Near Me'}
          </Button>
          <p className="text-xs text-gray-500 mt-1">
            Uses your device location to find nearby eye care providers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-sm text-gray-500">OR</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        <form onSubmit={handleQuerySearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter city or area (e.g., 'Boston' or 'Cape Town')"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            className="bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400"
          >
            🔍 Search
          </Button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-6">
          <p className="text-sm text-yellow-800">{error}</p>
        </div>
      )}

      {/* Fallback Link (when API not available or error) */}
      {(!apiAvailable || error) && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 p-6 rounded-lg mb-6 text-center">
          <p className="text-sm text-gray-700 mb-3">
            <strong>Manual Search:</strong> Open Google Maps to find eye care providers
          </p>
          <a
            href={getFallbackMapsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            🗺️ Open Google Maps Search
          </a>
        </div>
      )}

      {/* Results */}
      {places.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Found {places.length} eye care provider{places.length !== 1 ? 's' : ''} nearby
          </p>

          {places.map((place) => (
            <div
              key={place.place_id}
              className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    {place.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    📍 {place.formatted_address}
                  </p>

                  {place.formatted_phone_number && (
                    <p className="text-sm text-gray-700 mb-2">
                      📞 {place.formatted_phone_number}
                    </p>
                  )}

                  {place.opening_hours?.open_now !== undefined && (
                    <p className="text-sm font-semibold mb-2">
                      {place.opening_hours.open_now ? (
                        <span className="text-green-600">✓ Open now</span>
                      ) : (
                        <span className="text-red-600">✗ Closed</span>
                      )}
                    </p>
                  )}

                  {place.rating && (
                    <p className="text-sm text-gray-600">
                      ⭐ {place.rating.toFixed(1)}
                      {place.user_ratings_total && ` (${place.user_ratings_total} reviews)`}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <a
                    href={getMapsUrl(place)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm text-center whitespace-nowrap"
                  >
                    🗺️ Directions
                  </a>
                  {place.formatted_phone_number && (
                    <a
                      href={getCallUrl(place.formatted_phone_number)!}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm text-center whitespace-nowrap"
                    >
                      📞 Call
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="text-center mt-6">
            <a
              href={getFallbackMapsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 text-sm underline"
            >
              See more results in Google Maps →
            </a>
          </div>
        </div>
      )}

      {/* No results but successful search */}
      {!loading && places.length === 0 && !error && userLocation && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Start a search to find eye care providers near you
          </p>
        </div>
      )}
    </div>
  )
}
