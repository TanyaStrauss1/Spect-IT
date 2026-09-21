/**
 * Find Care Nearby Component (React Native)
 * Helps users find optometrists/opticians near them after screening
 * Falls back to Maps deep links when web API is unavailable
 */

import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Linking,
  Platform,
  Alert,
} from 'react-native'

interface Place {
  place_id: string
  name: string
  formatted_address: string
  formatted_phone_number?: string
  international_phone_number?: string
  opening_hours?: {
    open_now?: boolean
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
  /** Web API base URL (if available) */
  webApiUrl?: string
}

export function FindCareNearby({ 
  show = true, 
  title = 'Find Nearby Eye Care',
  webApiUrl = 'https://spect-it.com' // Default to production web app
}: FindCareNearbyProps) {
  const [loading, setLoading] = useState(false)
  const [places, setPlaces] = useState<Place[]>([])
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  if (!show) return null

  const handleLocationSearch = async () => {
    setLoading(true)
    setError(null)
    setPlaces([])

    try {
      // Request location permission
      if (Platform.OS === 'web') {
        // Web geolocation
        if (!navigator.geolocation) {
          setError('Geolocation is not supported')
          openFallbackMaps()
          return
        }

        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000,
          })
        })

        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })

        // Try to call web API
        await searchByLocation(latitude, longitude)
      } else {
        // Native - use Maps deep link directly
        openFallbackMaps()
      }
    } catch (error: any) {
      console.error('Location search error:', error)
      setError('Unable to get location. Use the manual search or open Maps directly.')
      openFallbackMaps()
    } finally {
      setLoading(false)
    }
  }

  const searchByLocation = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `${webApiUrl}/api/places?lat=${lat}&lng=${lng}&radius=5000`
      )
      const data = await response.json()

      if (data.status === 'API_KEY_NOT_CONFIGURED' || data.status !== 'OK') {
        openFallbackMaps(lat, lng)
        setError('Opening Maps directly for best results')
      } else {
        setPlaces(data.results || [])
      }
    } catch (error) {
      console.error('API search error:', error)
      openFallbackMaps(lat, lng)
      setError('Opening Maps directly')
    }
  }

  const handleQuerySearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setError(null)
    setPlaces([])

    try {
      const response = await fetch(
        `${webApiUrl}/api/places?query=${encodeURIComponent(searchQuery)}`
      )
      const data = await response.json()

      if (data.status === 'API_KEY_NOT_CONFIGURED' || data.status !== 'OK') {
        openFallbackMaps()
        setError('Opening Maps directly for best results')
      } else {
        setPlaces(data.results || [])
      }
    } catch (error) {
      console.error('Query search error:', error)
      openFallbackMaps()
      setError('Opening Maps directly')
    } finally {
      setLoading(false)
    }
  }

  const openFallbackMaps = (lat?: number, lng?: number) => {
    let mapsUrl: string

    if (lat && lng) {
      // iOS: Use Apple Maps with coordinates
      // Android: Use Google Maps with coordinates
      if (Platform.OS === 'ios') {
        mapsUrl = `http://maps.apple.com/?q=optometrist+eye+care&sll=${lat},${lng}&z=13`
      } else {
        mapsUrl = `https://www.google.com/maps/search/optometrist+eye+care/@${lat},${lng},13z`
      }
    } else if (searchQuery.trim()) {
      // Search by query
      if (Platform.OS === 'ios') {
        mapsUrl = `http://maps.apple.com/?q=optometrist+eye+care+${encodeURIComponent(searchQuery)}`
      } else {
        mapsUrl = `https://www.google.com/maps/search/optometrist+eye+care+${encodeURIComponent(searchQuery)}`
      }
    } else {
      // General search
      if (Platform.OS === 'ios') {
        mapsUrl = `http://maps.apple.com/?q=optometrist+eye+care`
      } else {
        mapsUrl = `https://www.google.com/maps/search/optometrist+eye+care`
      }
    }

    Linking.openURL(mapsUrl).catch((err) => {
      console.error('Failed to open maps:', err)
      Alert.alert('Error', 'Failed to open Maps app')
    })
  }

  const openMaps = (place: Place) => {
    const { lat, lng } = place.geometry.location
    let mapsUrl: string

    if (Platform.OS === 'ios') {
      mapsUrl = `http://maps.apple.com/?q=${encodeURIComponent(place.name)}&ll=${lat},${lng}`
    } else {
      mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`
    }

    Linking.openURL(mapsUrl).catch((err) => {
      console.error('Failed to open maps:', err)
      Alert.alert('Error', 'Failed to open Maps app')
    })
  }

  const openPhone = (phone: string) => {
    const phoneUrl = `tel:${phone.replace(/\s+/g, '')}`
    Linking.openURL(phoneUrl).catch((err) => {
      console.error('Failed to open phone:', err)
      Alert.alert('Error', 'Failed to open phone app')
    })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗺️ {title}</Text>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerTitle}>Referral Aid</Text>
        <Text style={styles.disclaimerText}>
          This tool helps you find licensed optometrists and opticians for comprehensive eye examinations. 
          This is a referral aid only — not a medical recommendation or endorsement of any specific provider.
        </Text>
      </View>

      {/* Search Controls */}
      <View style={styles.searchControls}>
        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleLocationSearch}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? '📍 Searching...' : '📍 Find Care Near Me'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.hint}>
          Uses your device location or opens Maps directly
        </Text>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TextInput
          style={styles.input}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Enter city or area"
          placeholderTextColor="#9CA3AF"
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.secondaryButton, (loading || !searchQuery.trim()) && styles.buttonDisabled]}
          onPress={handleQuerySearch}
          disabled={loading || !searchQuery.trim()}
        >
          <Text style={styles.secondaryButtonText}>🔍 Search</Text>
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Fallback Button */}
      <View style={styles.fallbackBox}>
        <Text style={styles.fallbackText}>
          <Text style={styles.fallbackBold}>Quick Option:</Text> Open your Maps app directly
        </Text>
        <TouchableOpacity
          style={styles.mapsButton}
          onPress={() => openFallbackMaps(userLocation?.lat, userLocation?.lng)}
        >
          <Text style={styles.mapsButtonText}>🗺️ Open Maps</Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      )}

      {places.length > 0 && (
        <View style={styles.results}>
          <Text style={styles.resultsCount}>
            Found {places.length} eye care provider{places.length !== 1 ? 's' : ''} nearby
          </Text>

          {places.map((place) => (
            <View key={place.place_id} style={styles.placeCard}>
              <Text style={styles.placeName}>{place.name}</Text>
              <Text style={styles.placeAddress}>📍 {place.formatted_address}</Text>

              {place.formatted_phone_number && (
                <Text style={styles.placePhone}>📞 {place.formatted_phone_number}</Text>
              )}

              {place.opening_hours?.open_now !== undefined && (
                <Text
                  style={[
                    styles.placeStatus,
                    place.opening_hours.open_now ? styles.statusOpen : styles.statusClosed,
                  ]}
                >
                  {place.opening_hours.open_now ? '✓ Open now' : '✗ Closed'}
                </Text>
              )}

              {place.rating && (
                <Text style={styles.placeRating}>
                  ⭐ {place.rating.toFixed(1)}
                  {place.user_ratings_total && ` (${place.user_ratings_total} reviews)`}
                </Text>
              )}

              <View style={styles.placeActions}>
                <TouchableOpacity
                  style={styles.directionsButton}
                  onPress={() => openMaps(place)}
                >
                  <Text style={styles.directionsButtonText}>🗺️ Directions</Text>
                </TouchableOpacity>

                {place.formatted_phone_number && (
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => openPhone(place.formatted_phone_number!)}
                  >
                    <Text style={styles.callButtonText}>📞 Call</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  disclaimer: {
    backgroundColor: '#DBEAFE',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    marginBottom: 16,
  },
  disclaimerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#1E3A8A',
    lineHeight: 18,
  },
  searchControls: {
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 6,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D5DB',
  },
  dividerText: {
    fontSize: 12,
    color: '#6B7280',
    marginHorizontal: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 8,
  },
  secondaryButton: {
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#92400E',
  },
  fallbackBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  fallbackText: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  fallbackBold: {
    fontWeight: '600',
  },
  mapsButton: {
    backgroundColor: '#10B981',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  mapsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  results: {
    marginTop: 16,
  },
  resultsCount: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  placeCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  placeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 6,
  },
  placeAddress: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  placePhone: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 4,
  },
  placeStatus: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusOpen: {
    color: '#059669',
  },
  statusClosed: {
    color: '#DC2626',
  },
  placeRating: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  placeActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  directionsButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  directionsButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  callButton: {
    flex: 1,
    backgroundColor: '#10B981',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  callButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
})
