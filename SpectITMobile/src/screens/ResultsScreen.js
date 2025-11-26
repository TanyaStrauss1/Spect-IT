import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';
import { SupabaseService } from '../services/SupabaseService';

export default function ResultsScreen({ navigation }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      const email = await SupabaseService.getUserEmail();
      setUserEmail(email);
      
      if (email) {
        const testResults = await SupabaseService.getTestResults(email);
        setResults(testResults);
      } else {
        // Load from local storage as fallback
        const localResults = JSON.parse(
          await AsyncStorage.getItem('test_results') || '[]'
        );
        setResults(localResults);
      }
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTestIcon = (testType) => {
    const icons = {
      'visual-acuity': '📏',
      'color-blindness': '🎨',
      'astigmatism': '⚫',
      'contrast': '🌓',
      'visual-field': '👁️',
      'prescription': '🔍',
    };
    return icons[testType] || '📊';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Test Results</Text>
          <Text style={styles.subtitle}>Track your vision health over time</Text>
        </View>

        {results.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsIcon}>📊</Text>
            <Text style={styles.noResultsTitle}>No test results yet</Text>
            <Text style={styles.noResultsText}>
              Complete a test to see your results here. Track your eye health over time and share results with your eye care professional.
            </Text>
            <TouchableOpacity
              style={styles.startTestButton}
              onPress={() => navigation.navigate('Tests')}
              activeOpacity={0.8}
            >
              <Text style={styles.startTestButtonText}>Start Your First Test</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Summary Cards */}
            <View style={styles.summaryContainer}>
              <LinearGradient
                colors={Colors.gradient.primary}
                style={styles.summaryCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.summaryNumber}>{results.length}</Text>
                <Text style={styles.summaryLabel}>Tests Completed</Text>
              </LinearGradient>
              
              <View style={styles.summaryCardPlain}>
                <Text style={styles.summaryNumberPlain}>
                  {new Set(results.map(r => r.test_type)).size}
                </Text>
                <Text style={styles.summaryLabelPlain}>Test Types</Text>
              </View>
            </View>

            {/* Results List */}
            <View style={styles.resultsList}>
              {results.map((result, index) => (
                <TouchableOpacity
                  key={result.id || index}
                  style={styles.resultCard}
                  activeOpacity={0.7}
                >
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultIcon}>
                      {getTestIcon(result.test_type)}
                    </Text>
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultTitle}>
                        {result.test_name || result.test_type}
                      </Text>
                      <Text style={styles.resultDate}>
                        {formatDate(result.created_at || result.date)}
                      </Text>
                    </View>
                  </View>
                  {result.results && (
                    <View style={styles.resultDetails}>
                      <Text style={styles.resultDetailsText}>
                        {JSON.stringify(result.results, null, 2).substring(0, 100)}...
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: Colors.gray,
    fontSize: 14,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
  },
  summaryCardPlain: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryNumberPlain: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  summaryLabelPlain: {
    fontSize: 14,
    color: Colors.gray,
  },
  resultsList: {
    gap: 16,
  },
  resultCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  resultIcon: {
    fontSize: 32,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 4,
  },
  resultDate: {
    fontSize: 12,
    color: Colors.gray,
  },
  resultDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  resultDetailsText: {
    fontSize: 12,
    color: Colors.gray,
    fontFamily: 'monospace',
  },
  noResultsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginTop: 20,
  },
  noResultsIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  noResultsTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 12,
  },
  noResultsText: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  startTestButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  startTestButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
