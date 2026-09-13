'use client'

import { useState } from 'react'
import { useParticipants, Participant } from '@/lib/participants/participant-context'
import { Button } from '@/components/ui'

export function ParticipantManager() {
  const { participants, createParticipant, updateParticipant, archiveParticipant, deleteParticipant } = useParticipants()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
      await updateParticipant(editingId, data)
    } else {
      await createParticipant(data)
    }

    resetForm()
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

  const handleDelete = async (id: string, displayName: string) => {
    if (confirm(`Are you sure you want to delete ${displayName}? This will also delete all their test results.`)) {
      await deleteParticipant(id)
    }
  }

  const handleArchive = async (id: string) => {
    await archiveParticipant(id)
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Participants</h2>
          <p className="text-sm text-gray-600 mt-1">Add family members, students, or others to track their vision screening results</p>
        </div>
        {!isAddingNew && (
          <Button
            onClick={() => setIsAddingNew(true)}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            + Add Participant
          </Button>
        )}
      </div>

      {isAddingNew && (
        <form onSubmit={handleSubmit} className="mb-6 p-6 bg-gray-50 rounded-lg border-2 border-indigo-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Participant' : 'Add New Participant'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Alex, Sam"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="child">Child</option>
                <option value="student">Student</option>
                <option value="family">Family Member</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age (years)</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 8"
                min="0"
                max="120"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Any relevant notes..."
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
              {editingId ? 'Update Participant' : 'Add Participant'}
            </Button>
            <Button
              type="button"
              onClick={resetForm}
              className="bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {participants.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-lg font-semibold mb-2">No participants yet</p>
            <p className="text-sm">Add a participant to start tracking their vision screening results</p>
          </div>
        ) : (
          participants.map((participant) => (
            <div
              key={participant.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">
                    {participant.is_self ? '👤' : participant.role === 'child' ? '👶' : participant.role === 'student' ? '🎓' : '👥'}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      {participant.display_name}
                      {participant.is_self && (
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">You</span>
                      )}
                    </h3>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
                      {participant.role && (
                        <span className="capitalize">{participant.role}</span>
                      )}
                      {participant.age && <span>Age: {participant.age}</span>}
                      {participant.date_of_birth && (
                        <span>Born: {new Date(participant.date_of_birth).toLocaleDateString()}</span>
                      )}
                    </div>
                    {participant.notes && (
                      <p className="text-sm text-gray-500 mt-2">{participant.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!participant.is_self && (
                    <>
                      <button
                        onClick={() => handleEdit(participant)}
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium px-3 py-1 rounded hover:bg-indigo-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleArchive(participant.id)}
                        className="text-gray-600 hover:text-gray-700 text-sm font-medium px-3 py-1 rounded hover:bg-gray-100"
                      >
                        Archive
                      </button>
                      <button
                        onClick={() => handleDelete(participant.id, participant.display_name)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1 rounded hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 text-sm mb-1">Privacy Note</h4>
        <p className="text-sm text-blue-800">
          Participants you add are only visible to you. Each participant's test results are kept separate and private to your account.
        </p>
      </div>
    </div>
  )
}
