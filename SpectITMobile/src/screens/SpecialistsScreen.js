import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';

export default function SpecialistsScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location permissions to find nearby specialists.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const findNearestSpecialists = async () => {
    setLoading(true);
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      
      // In a real implementation, this would call an API to find specialists
      // For now, show a message
      Alert.alert(
        'Specialists Found',
        'This feature will search for optometrists, ophthalmologists, and opticians near you. Full implementation coming soon!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error finding specialists:', error);
      Alert.alert('Error', 'Could not find your location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showManualLocationInput = () => {
    Alert.alert(
      'Enter Location',
      'Manual location input will be available soon. For now, please use the "Find Nearest Specialists" button.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>👁️ Find Eye Care Specialists</Text>
          <Text style={styles.subtitle}>
            Search all optometrists, ophthalmologists, and opticians across South Africa
          </Text>
          <Text style={styles.subtitle2}>
            Organized by province and proximity • Real-time distance calculation
          </Text>
        </View>

        <LinearGradient
          colors={Colors.gradient.primary}
          style={styles.locationCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.locationContent}>
            <Text style={styles.locationTitle}>
              📍 Find specialists near you
            </Text>
            <Text style={styles.locationSubtitle}>
              Uses your current location or enter an address manually
            </Text>
            <View style={styles.locationButtons}>
              <TouchableOpacity
                style={[styles.locationButtonPrimary, loading && styles.buttonDisabled]}
                onPress={findNearestSpecialists}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.primary} />
                ) : (
                  <Text style={styles.locationButtonPrimaryText}>
                    🔍 Find Nearest Specialists
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.locationButtonSecondary}
                onPress={showManualLocationInput}
                activeOpacity={0.8}
              >
                <Text style={styles.locationButtonSecondaryText}>
                  📍 Enter Location
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>About Specialist Search</Text>
          <Text style={styles.infoText}>
            Our comprehensive database includes optometrists, ophthalmologists, and opticians across South Africa. 
            Search by location to find the nearest eye care professionals to you.
          </Text>
          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>✓ Real-time distance calculation</Text>
            <Text style={styles.featureItem}>✓ Organized by province</Text>
            <Text style={styles.featureItem}>✓ Contact information included</Text>
            <Text style={styles.featureItem}>✓ Directions integration</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  subtitle2: {
    fontSize: 14,
    color: Colors.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  locationCard: {
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  locationContent: {
    gap: 16,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.white,
    marginBottom: 8,
  },
  locationSubtitle: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
  },
  locationButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  locationButtonPrimary: {
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    flex: 1,
    minWidth: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationButtonPrimaryText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  locationButtonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    flex: 1,
    minWidth: 150,
  },
  locationButtonSecondaryText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  infoContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.gray,
    lineHeight: 20,
    marginBottom: 16,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    fontSize: 14,
    color: Colors.dark,
    lineHeight: 20,
  },
});
