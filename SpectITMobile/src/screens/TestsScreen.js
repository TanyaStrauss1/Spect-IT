import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Colors } from '../constants/colors';

const tests = [
  {
    id: 'prescription',
    icon: '🔍',
    title: 'Prescription Measurement',
    description: 'Estimate eyeglass prescription strength',
    duration: '5-10 min',
    accuracy: 'Medium Accuracy',
  },
  {
    id: 'color-blindness',
    icon: '🎨',
    title: 'Color Blindness Test',
    description: 'Detect color vision deficiencies (Ishihara plates)',
    duration: '2-3 min',
    accuracy: 'High Accuracy',
  },
  {
    id: 'astigmatism',
    icon: '⚫',
    title: 'Astigmatism Test',
    description: 'Check for corneal irregularities and astigmatism',
    duration: '2-3 min',
    accuracy: 'High Accuracy',
  },
  {
    id: 'contrast',
    icon: '🌓',
    title: 'Contrast Sensitivity',
    description: 'Evaluate vision in low-light conditions',
    duration: '3-4 min',
    accuracy: 'High Accuracy',
  },
  {
    id: 'visual-field',
    icon: '👁️',
    title: 'Visual Field Test',
    description: 'Check peripheral vision and blind spots',
    duration: '5-7 min',
    accuracy: 'High Accuracy',
  },
  {
    id: 'visual-acuity',
    icon: '📏',
    title: 'Visual Acuity Test',
    description: 'Measure distance and near vision using Snellen chart',
    duration: '3-5 min',
    accuracy: 'High Accuracy',
  },
];

export default function TestsScreen({ navigation }) {
  const handleTestPress = (testId) => {
    // For now, open web version of test
    // Later can be replaced with native test implementation
    navigation.navigate('WebTest', { testId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Vision Tests</Text>
          <Text style={styles.subtitle}>Comprehensive eye health assessment tools</Text>
        </View>

        <View style={styles.testsGrid}>
          {tests.map((test) => (
            <TouchableOpacity
              key={test.id}
              style={styles.testCard}
              onPress={() => handleTestPress(test.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.testIcon}>{test.icon}</Text>
              <Text style={styles.testTitle}>{test.title}</Text>
              <Text style={styles.testDescription}>{test.description}</Text>
              
              <View style={styles.testDetails}>
                <Text style={styles.testDetailText}>⏱️ {test.duration}</Text>
                <Text style={styles.testDetailText}>🎯 {test.accuracy}</Text>
              </View>

              <TouchableOpacity
                style={styles.testButton}
                onPress={() => handleTestPress(test.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.testButtonText}>Start Test</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    padding: 20,
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
  testsGrid: {
    gap: 20,
  },
  testCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  testTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 8,
    textAlign: 'center',
  },
  testDescription: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  testDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  testDetailText: {
    fontSize: 12,
    color: Colors.gray,
  },
  testButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    marginTop: 8,
  },
  testButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

