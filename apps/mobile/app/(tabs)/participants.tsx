import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { useParticipants, Participant } from '../../lib/participants/participant-context'

export default function ParticipantsScreen() {
  const {
    participants,
    createParticipant,
    updateParticipant,
    archiveParticipant,
    deleteParticipant,
    loading,
  } = useParticipants()

  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    display_name: '',
    date_of_birth: '',
    age: '',
    role: 'child' as 'self' | 'child' | 'student' | 'family' | 'other',
    notes: '',
  })

  const resetForm = () => {
    setFormData({
      display_name: '',
      date_of_birth: '',
      age: '',
      role: 'child',
      notes: '',
    })
    setIsAddingNew(false)
    setEditingId(null)
  }

  const handleSubmit = async () => {
    if (!formData.display_name.trim()) {
      Alert.alert('Error', 'Display name is required')
      return
    }

    const data = {
      display_name: formData.display_name,
      date_of_birth: formData.date_of_birth || undefined,
      age: formData.age ? parseInt(formData.age) : undefined,
      role: formData.role,
      notes: formData.notes || undefined,
      is_self: false,
      archived: false,
    }

    if (editingId) {
      const success = await updateParticipant(editingId, data)
      if (success) {
        Alert.alert('Success', 'Participant updated successfully')
        resetForm()
      } else {
        Alert.alert('Error', 'Failed to update participant')
      }
    } else {
      const result = await createParticipant(data)
      if (result) {
        Alert.alert('Success', 'Participant added successfully')
        resetForm()
      } else {
        Alert.alert('Error', 'Failed to add participant')
      }
    }
  }

  const handleEdit = (participant: Participant) => {
    setFormData({
      display_name: participant.display_name,
      date_of_birth: participant.date_of_birth || '',
      age: participant.age?.toString() || '',
      role: participant.role || 'other',
      notes: participant.notes || '',
    })
    setEditingId(participant.id)
    setIsAddingNew(true)
  }

  const handleDelete = (id: string, displayName: string) => {
    Alert.alert(
      'Delete Participant',
      `Are you sure you want to delete ${displayName}? This will also delete all their test results.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteParticipant(id)
            if (success) {
              Alert.alert('Success', 'Participant deleted')
            } else {
              Alert.alert('Error', 'Failed to delete participant')
            }
          },
        },
      ]
    )
  }

  const handleArchive = async (id: string) => {
    const success = await archiveParticipant(id)
    if (success) {
      Alert.alert('Success', 'Participant archived')
    } else {
      Alert.alert('Error', 'Failed to archive participant')
    }
  }

  const getRoleIcon = (role?: string, isSelf?: boolean) => {
    if (isSelf) return '👤'
    if (role === 'child') return '👶'
    if (role === 'student') return '🎓'
    if (role === 'family') return '👥'
    return '👥'
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading participants...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Manage Participants</Text>
        <Text style={styles.subtitle}>
          Add family members, students, or others to track their vision screening results
        </Text>
      </View>

      {!isAddingNew && (
        <View style={styles.addButtonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsAddingNew(true)}
          >
            <Text style={styles.addButtonText}>+ Add Participant</Text>
          </TouchableOpacity>
        </View>
      )}

      {isAddingNew && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            {editingId ? 'Edit Participant' : 'Add New Participant'}
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Display Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={formData.display_name}
              onChangeText={(text) => setFormData({ ...formData, display_name: text })}
              placeholder="e.g., Alex, Sam"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Role</Text>
            <View style={styles.roleButtons}>
              {[
                { value: 'child', label: 'Child', icon: '👶' },
                { value: 'student', label: 'Student', icon: '🎓' },
                { value: 'family', label: 'Family', icon: '👥' },
                { value: 'other', label: 'Other', icon: '👤' },
              ].map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleButton,
                    formData.role === role.value && styles.roleButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, role: role.value as any })}
                >
                  <Text style={styles.roleIcon}>{role.icon}</Text>
                  <Text
                    style={[
                      styles.roleLabel,
                      formData.role === role.value && styles.roleLabelActive,
                    ]}
                  >
                    {role.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Age (years)</Text>
              <TextInput
                style={styles.input}
                value={formData.age}
                onChangeText={(text) => setFormData({ ...formData, age: text })}
                placeholder="e.g., 8"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
              />
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Date of Birth</Text>
              <TextInput
                style={styles.input}
                value={formData.date_of_birth}
                onChangeText={(text) => setFormData({ ...formData, date_of_birth: text })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder="Any relevant notes..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.primaryButtonText}>
                {editingId ? 'Update' : 'Add'} Participant
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={resetForm}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.participantsList}>
        {participants.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No participants yet</Text>
            <Text style={styles.emptyText}>
              Add a participant to start tracking their vision screening results
            </Text>
          </View>
        ) : (
          participants.map((participant) => (
            <View key={participant.id} style={styles.participantCard}>
              <View style={styles.participantHeader}>
                <Text style={styles.participantIcon}>
                  {getRoleIcon(participant.role, participant.is_self)}
                </Text>
                <View style={styles.participantInfo}>
                  <Text style={styles.participantName}>
                    {participant.display_name}
                    {participant.is_self && (
                      <Text style={styles.selfBadge}> You</Text>
                    )}
                  </Text>
                  <View style={styles.participantMeta}>
                    {participant.role && (
                      <Text style={styles.participantMetaText}>{participant.role}</Text>
                    )}
                    {participant.age && (
                      <Text style={styles.participantMetaText}>Age: {participant.age}</Text>
                    )}
                    {participant.date_of_birth && (
                      <Text style={styles.participantMetaText}>
                        Born: {new Date(participant.date_of_birth).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                  {participant.notes && (
                    <Text style={styles.participantNotes}>{participant.notes}</Text>
                  )}
                </View>
              </View>

              {!participant.is_self && (
                <View style={styles.participantActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEdit(participant)}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.archiveButton]}
                    onPress={() => handleArchive(participant.id)}
                  >
                    <Text style={styles.archiveButtonText}>Archive</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(participant.id, participant.display_name)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Privacy Note</Text>
        <Text style={styles.infoText}>
          Participants you add are only visible to you. Each participant's test results are
          kept separate and private to your account.
        </Text>
      </View>

      <View style={styles.howItWorksCard}>
        <Text style={styles.howItWorksTitle}>How It Works</Text>
        <View style={styles.howItWorksStep}>
          <Text style={styles.stepNumber}>1</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Add Participants</Text>
            <Text style={styles.stepText}>
              Add children, students, or family members who will be taking vision screening
              tests.
            </Text>
          </View>
        </View>
        <View style={styles.howItWorksStep}>
          <Text style={styles.stepNumber}>2</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Select Active Participant</Text>
            <Text style={styles.stepText}>
              Before starting a test, use the participant switcher in the dashboard to select
              who is being tested.
            </Text>
          </View>
        </View>
        <View style={styles.howItWorksStep}>
          <Text style={styles.stepNumber}>3</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Track Results</Text>
            <Text style={styles.stepText}>
              Each participant's test results are kept separate, allowing you to track progress
              over time.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backArrow: {
    fontSize: 24,
    color: '#4F46E5',
    marginRight: 4,
  },
  backText: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  loadingText: {
    marginTop: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  addButtonContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C7D2FE',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  roleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  roleIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  roleLabelActive: {
    color: '#4F46E5',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#E5E7EB',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  participantsList: {
    paddingHorizontal: 20,
  },
  emptyState: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  participantCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  participantHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  participantIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  selfBadge: {
    fontSize: 12,
    color: '#4F46E5',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  participantMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  participantMetaText: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  participantNotes: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  participantActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#EEF2FF',
  },
  editButtonText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
  archiveButton: {
    backgroundColor: '#F3F4F6',
  },
  archiveButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
  },
  deleteButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#DBEAFE',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 18,
  },
  howItWorksCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  howItWorksTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  howItWorksStep: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 28,
    marginRight: 12,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
})
