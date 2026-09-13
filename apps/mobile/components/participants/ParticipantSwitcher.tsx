import { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native'
import { useParticipants } from '../../lib/participants/participant-context'

export function ParticipantSwitcher() {
  const { participants, activeParticipant, setActiveParticipant } = useParticipants()
  const [isOpen, setIsOpen] = useState(false)

  if (participants.length === 0) {
    return null
  }

  const getRoleIcon = (role?: string, isSelf?: boolean) => {
    if (isSelf) return '👤'
    if (role === 'child') return '👶'
    if (role === 'student') return '🎓'
    if (role === 'family') return '👥'
    return '👥'
  }

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        style={styles.button}
      >
        <Text style={styles.icon}>{getRoleIcon(activeParticipant?.role, activeParticipant?.is_self)}</Text>
        <View style={styles.content}>
          <Text style={styles.label}>Testing as</Text>
          <Text style={styles.name}>{activeParticipant?.display_name || 'Select participant'}</Text>
        </View>
        <Text style={styles.chevron}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Participant</Text>
                <Text style={styles.modalSubtitle}>Who is taking the test?</Text>
              </View>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.participantList}>
              {participants.map((participant) => {
                const isActive = activeParticipant?.id === participant.id
                return (
                  <TouchableOpacity
                    key={participant.id}
                    onPress={async () => {
                      await setActiveParticipant(participant)
                      setIsOpen(false)
                    }}
                    style={[
                      styles.participantItem,
                      isActive && styles.participantItemActive
                    ]}
                  >
                    <Text style={styles.participantIcon}>
                      {getRoleIcon(participant.role, participant.is_self)}
                    </Text>
                    <View style={styles.participantInfo}>
                      <Text style={styles.participantName}>{participant.display_name}</Text>
                      {participant.role && (
                        <Text style={styles.participantRole}>{participant.role}</Text>
                      )}
                      {participant.age && (
                        <Text style={styles.participantAge}>Age: {participant.age}</Text>
                      )}
                    </View>
                    {isActive && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#C7D2FE',
  },
  icon: {
    fontSize: 24,
    marginRight: 8,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  chevron: {
    fontSize: 10,
    color: '#6B7280',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  closeButton: {
    fontSize: 24,
    color: '#6B7280',
    padding: 4,
  },
  participantList: {
    padding: 16,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  participantItemActive: {
    backgroundColor: '#EEF2FF',
    borderLeftColor: '#4F46E5',
  },
  participantIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  participantRole: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  participantAge: {
    fontSize: 12,
    color: '#6B7280',
  },
  checkmark: {
    fontSize: 20,
    color: '#4F46E5',
    fontWeight: 'bold',
  },
})
