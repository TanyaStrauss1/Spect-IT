'use client'

import { useState, Fragment } from 'react'
import { useParticipants } from '@/lib/participants/participant-context'
import { Button } from '@/components/ui'

export function ParticipantSwitcher() {
  const { participants, activeParticipant, setActiveParticipant } = useParticipants()
  const [isOpen, setIsOpen] = useState(false)

  if (participants.length === 0) {
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border-2 border-indigo-200 hover:border-indigo-400 transition-colors"
      >
        <span className="text-2xl">👤</span>
        <div className="text-left">
          <div className="text-xs text-gray-500 uppercase font-semibold">Testing as</div>
          <div className="text-sm font-bold text-gray-900">{activeParticipant?.display_name || 'Select participant'}</div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
            <div className="p-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Select Participant</h3>
              <p className="text-xs text-gray-500 mt-1">Who is taking the test?</p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {participants.map((participant) => (
                <button
                  key={participant.id}
                  onClick={() => {
                    setActiveParticipant(participant)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-l-4 ${
                    activeParticipant?.id === participant.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {participant.is_self ? '👤' : participant.role === 'child' ? '👶' : participant.role === 'student' ? '🎓' : '👥'}
                    </span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{participant.display_name}</div>
                      {participant.role && (
                        <div className="text-xs text-gray-500 capitalize">{participant.role}</div>
                      )}
                      {participant.age && (
                        <div className="text-xs text-gray-500">Age: {participant.age}</div>
                      )}
                    </div>
                    {activeParticipant?.id === participant.id && (
                      <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
