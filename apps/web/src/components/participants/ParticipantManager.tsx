'use client'

import { useState, useMemo, useRef } from 'react'
import { useParticipants, Participant } from '@/lib/participants/participant-context'
import { Button } from '@/components/ui'

type ViewMode = 'cards' | 'table'

export function ParticipantManager() {
  const { participants, createParticipant, updateParticipant, archiveParticipant, deleteParticipant } = useParticipants()
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    display_name: '',
    date_of_birth: '',
    age: '',
    role: 'child' as 'self' | 'child' | 'student' | 'family' | 'other',
    notes: '',
  })

  // Filtered and searched participants
  const filteredParticipants = useMemo(() => {
    return participants.filter(p => {
      const matchesSearch = p.display_name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = roleFilter === 'all' || p.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [participants, searchQuery, roleFilter])

  const studentCount = participants.filter(p => p.role === 'student').length
  const hasStudents = studentCount > 0

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

  const parseCSV = (text: string): Array<{ name: string; age?: number; dob?: string; notes?: string }> => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const nameIndex = headers.findIndex(h => h.includes('name'))
    const ageIndex = headers.findIndex(h => h.includes('age'))
    const dobIndex = headers.findIndex(h => h.includes('dob') || h.includes('birth'))
    const notesIndex = headers.findIndex(h => h.includes('note'))

    if (nameIndex === -1) return []

    const students = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      if (values.length > nameIndex && values[nameIndex]) {
        students.push({
          name: values[nameIndex],
          age: ageIndex >= 0 && values[ageIndex] ? parseInt(values[ageIndex]) : undefined,
          dob: dobIndex >= 0 && values[dobIndex] ? values[dobIndex] : undefined,
          notes: notesIndex >= 0 && values[notesIndex] ? values[notesIndex] : undefined,
        })
      }
    }
    return students
  }

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const students = parseCSV(text)
      
      if (students.length === 0) {
        alert('No valid students found in CSV. Please ensure your CSV has a "name" column.')
        return
      }

      if (!confirm(`Import ${students.length} student(s)? This will create new participant records.`)) {
        return
      }

      setIsImporting(true)
      setImportProgress({ current: 0, total: students.length })

      for (let i = 0; i < students.length; i++) {
        const student = students[i]
        await createParticipant({
          display_name: student.name,
          age: student.age,
          date_of_birth: student.dob,
          role: 'student',
          notes: student.notes,
          is_self: false,
          archived: false,
        })
        setImportProgress({ current: i + 1, total: students.length })
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      alert(`Successfully imported ${students.length} student(s)!`)
      setIsImporting(false)
      setImportProgress({ current: 0, total: 0 })
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('CSV import error:', error)
      alert('Failed to import CSV. Please check the file format.')
      setIsImporting(false)
      setImportProgress({ current: 0, total: 0 })
    }
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
          <p className="text-sm text-gray-600 mt-1">
            {hasStudents 
              ? `Track vision screening for your classroom (${studentCount} student${studentCount !== 1 ? 's' : ''})`
              : 'Add family members, students, or others to track their vision screening results'}
          </p>
        </div>
        {!isAddingNew && (
          <div className="flex gap-2">
            <Button
              onClick={() => setIsAddingNew(true)}
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              + Add Participant
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
              title="Import students from CSV"
            >
              📄 Import CSV
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCSVImport}
              className="hidden"
            />
          </div>
        )}
      </div>

      {isImporting && (
        <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-purple-900">
                Importing students... {importProgress.current} of {importProgress.total}
              </p>
              <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Controls */}
      {participants.length > 3 && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search by name</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All roles</option>
                <option value="self">Self</option>
                <option value="child">Child</option>
                <option value="student">Student</option>
                <option value="family">Family</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredParticipants.length} of {participants.length} participant{participants.length !== 1 ? 's' : ''}
            </p>
            {hasStudents && (
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1 rounded text-sm font-medium ${viewMode === 'cards' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  📇 Cards
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 rounded text-sm font-medium ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  📊 Table
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* Participant List */}
      {participants.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">👥</div>
          <p className="text-lg font-semibold mb-2">No participants yet</p>
          <p className="text-sm mb-4">Get started by adding participants:</p>
          <div className="flex gap-4 justify-center text-left max-w-2xl mx-auto">
            <div className="flex-1 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-semibold text-blue-900 mb-1">👨‍👩‍👧 For Families</p>
              <p className="text-xs text-blue-800">Add children or family members to track their vision health over time</p>
            </div>
            <div className="flex-1 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="font-semibold text-purple-900 mb-1">👩‍🏫 For Teachers</p>
              <p className="text-xs text-purple-800">Add your classroom roster using the CSV import for efficient screening</p>
            </div>
          </div>
        </div>
      ) : filteredParticipants.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-lg font-semibold mb-2">No matches found</p>
          <p className="text-sm">Try adjusting your search or filter</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Age</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Date of Birth</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Notes</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.map((participant) => (
                <tr key={participant.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {participant.is_self ? '👤' : participant.role === 'child' ? '👶' : participant.role === 'student' ? '🎓' : '👥'}
                      </span>
                      <span className="font-medium text-gray-900">{participant.display_name}</span>
                      {participant.is_self && (
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">You</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 capitalize">{participant.role || '-'}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{participant.age || '-'}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {participant.date_of_birth ? new Date(participant.date_of_birth).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500 max-w-xs truncate">{participant.notes || '-'}</td>
                  <td className="py-3 px-4 text-right">
                    {!participant.is_self && (
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => handleEdit(participant)}
                          className="text-indigo-600 hover:text-indigo-700 text-xs font-medium px-2 py-1 rounded hover:bg-indigo-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleArchive(participant.id)}
                          className="text-gray-600 hover:text-gray-700 text-xs font-medium px-2 py-1 rounded hover:bg-gray-100"
                        >
                          Archive
                        </button>
                        <button
                          onClick={() => handleDelete(participant.id, participant.display_name)}
                          className="text-red-600 hover:text-red-700 text-xs font-medium px-2 py-1 rounded hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredParticipants.map((participant) => (
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
          ))}
        </div>
      )}

      <div className="mt-6 space-y-4">
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="font-semibold text-purple-900 text-sm mb-2">📄 CSV Import Format</h4>
          <p className="text-sm text-purple-800 mb-2">
            Your CSV file should have a header row with a "name" column (required). Optional columns: age, dob, notes.
          </p>
          <div className="bg-white p-2 rounded border border-purple-200 text-xs font-mono text-gray-700">
            name,age,dob,notes<br/>
            Emma Johnson,8,2016-03-15,Glasses for reading<br/>
            Liam Smith,9,,Sits in front row<br/>
            Olivia Davis,7,2017-08-22,
          </div>
          <p className="text-xs text-purple-700 mt-2">
            All imported participants will be assigned the "student" role automatically.
          </p>
        </div>
        
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 text-sm mb-1">Privacy Note</h4>
          <p className="text-sm text-blue-800">
            Participants you add are only visible to you. Each participant's test results are kept separate and private to your account.
          </p>
        </div>
      </div>
    </div>
  )
}
