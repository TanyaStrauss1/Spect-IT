/**
 * Adaptive Coaching Card
 * 
 * Displays corrective coaching prompts when module quality is insufficient.
 * Part of the closed-loop examination controller.
 */

import { View, Text, StyleSheet } from 'react-native'

type AdaptiveCoachingCardProps = {
  coachingPrompts: string[]
  attemptNumber: number
  maxAttempts: number
}

export function AdaptiveCoachingCard({
  coachingPrompts,
  attemptNumber,
  maxAttempts,
}: AdaptiveCoachingCardProps) {
  if (coachingPrompts.length === 0) return null

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>💡</Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>Improvement Suggestions</Text>
          <Text style={styles.subtitle}>
            Attempt {attemptNumber}/{maxAttempts}
          </Text>
        </View>
      </View>

      <View style={styles.promptsList}>
        {coachingPrompts.map((prompt, idx) => (
          <Text key={idx} style={styles.prompt}>
            {prompt}
          </Text>
        ))}
      </View>

      <Text style={styles.footer}>
        Following these suggestions will improve data quality.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#3B82F6',
  },
  promptsList: {
    marginBottom: 8,
  },
  prompt: {
    fontSize: 14,
    color: '#1E3A8A',
    lineHeight: 20,
    marginBottom: 6,
  },
  footer: {
    fontSize: 12,
    color: '#3B82F6',
    fontStyle: 'italic',
    marginTop: 4,
  },
})
