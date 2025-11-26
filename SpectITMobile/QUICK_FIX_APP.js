// Quick Fix - Minimal App to Test
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'react-native';
import { Colors } from './src/constants/colors';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.content}>
        <Text style={styles.title}>Spect-IT</Text>
        <Text style={styles.subtitle}>App is loading...</Text>
        <Text style={styles.text}>If you see this, the basic app structure works!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.gray,
    marginBottom: 24,
  },
  text: {
    fontSize: 14,
    color: Colors.dark,
    textAlign: 'center',
  },
});

