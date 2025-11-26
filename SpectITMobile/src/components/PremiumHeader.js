import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';

export default function PremiumHeader({ navigation, currentScreen }) {
  return (
    <LinearGradient
      colors={Colors.gradient.primary}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerContent}>
        <View style={styles.logo}>
          <Text style={styles.logoIcon}>👁️</Text>
          <Text style={styles.logoText}>Spect-IT</Text>
        </View>
        <View style={styles.navButtons}>
          <TouchableOpacity
            style={[styles.navButton, currentScreen === 'Home' && styles.navButtonActive]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={[styles.navButtonText, currentScreen === 'Home' && styles.navButtonTextActive]}>
              Home
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, currentScreen === 'Tests' && styles.navButtonActive]}
            onPress={() => navigation.navigate('Tests')}
          >
            <Text style={[styles.navButtonText, currentScreen === 'Tests' && styles.navButtonTextActive]}>
              Tests
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    fontSize: 24,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  navButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  navButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  navButtonTextActive: {
    fontWeight: '600',
  },
});

