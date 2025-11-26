import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <LinearGradient
          colors={Colors.gradient.hero}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>Premium Advanced Eye Testing</Text>
            </View>
            <Text style={styles.heroTitle}>Spect-IT</Text>
            <Text style={styles.heroSubtitle}>
              AI-powered professional-grade vision assessment with 3D face mapping, advanced eye tracking, and comprehensive analytics
            </Text>
            <Text style={styles.heroSubtitle2}>
              Transform your device into a professional eye testing platform. Monitor your eye health, measure prescriptions, and track changes over time.
            </Text>
            
            {/* Feature Items */}
            <View style={styles.featureContainer}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🔬</Text>
                <Text style={styles.featureText}>Accurate Results</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📊</Text>
                <Text style={styles.featureText}>Comprehensive Results</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📱</Text>
                <Text style={styles.featureText}>Device Compatible</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🔒</Text>
                <Text style={styles.featureText}>Secure & Private</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Tests')}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Start Testing</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Quick Links Section */}
        <View style={styles.quickLinks}>
          <TouchableOpacity
            style={styles.quickLinkCard}
            onPress={() => navigation.navigate('Tests')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickLinkIcon}>👁️</Text>
            <Text style={styles.quickLinkTitle}>Vision Tests</Text>
            <Text style={styles.quickLinkSubtitle}>Comprehensive eye health assessment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickLinkCard}
            onPress={() => navigation.navigate('Results')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickLinkIcon}>📊</Text>
            <Text style={styles.quickLinkTitle}>Your Results</Text>
            <Text style={styles.quickLinkSubtitle}>View test history and analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickLinkCard}
            onPress={() => navigation.navigate('Specialists')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickLinkIcon}>🏥</Text>
            <Text style={styles.quickLinkTitle}>Find Specialists</Text>
            <Text style={styles.quickLinkSubtitle}>Locate nearby eye care professionals</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickLinkCard}
            onPress={() => navigation.navigate('Shop')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickLinkIcon}>🛍️</Text>
            <Text style={styles.quickLinkTitle}>Shop</Text>
            <Text style={styles.quickLinkSubtitle}>Browse eyewear products</Text>
          </TouchableOpacity>
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
    flexGrow: 1,
  },
  hero: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: 600,
    width: '100%',
  },
  premiumBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
    backdropFilter: 'blur(10px)',
  },
  premiumBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  heroSubtitle2: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.85,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  featureContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 200,
  },
  primaryButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  quickLinks: {
    padding: 20,
    gap: 16,
  },
  quickLinkCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickLinkIcon: {
    fontSize: 32,
  },
  quickLinkTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 4,
  },
  quickLinkSubtitle: {
    fontSize: 14,
    color: Colors.gray,
  },
});

