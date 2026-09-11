/**
 * Pre-Test Checklist Component
 * Displays safety and setup checklist before starting a test
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RECOMMENDED_TESTS, CHECKLIST_ITEMS, type TestDefinition } from '@/lib/journey/useJourney'
import { Button } from '@/components/ui'

interface PreTestChecklistProps {
  testId: string
  isOpen: boolean
  onClose: () => void
  onProceed?: () => void
}

export function PreTestChecklist({ testId, isOpen, onClose, onProceed }: PreTestChecklistProps) {
  const router = useRouter()
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  
  if (!isOpen) return null

  const test = RECOMMENDED_TESTS.find(t => t.id === testId)
  if (!test) {
    console.warn('Test not found:', testId)
    return null
  }

  const handleCheckItem = (itemId: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const allChecked = () => {
    const requiredItems = test.requires.map(req => CHECKLIST_ITEMS[req]?.id).filter(Boolean)
    const safetyItems = ['safety', 'screen']
    const allItems = [...requiredItems, ...safetyItems]
    return allItems.every(item => checkedItems.has(item))
  }

  const handleProceed = () => {
    if (!allChecked()) {
      alert('Please check all items before proceeding.')
      return
    }

    if (onProceed) {
      onProceed()
    } else {
      onClose()
      router.push(test.route)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {test.icon} {test.name}
            </h2>
            <p className="text-gray-600">Before you begin, please confirm the following:</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none font-light"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Test-Specific Checklist */}
        <div className="space-y-3 mb-6">
          {test.requires.map(req => {
            const item = CHECKLIST_ITEMS[req]
            if (!item) return null

            return (
              <div 
                key={item.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  checkedItems.has(item.id)
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => handleCheckItem(item.id)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{item.text}</div>
                    <div className="text-sm text-gray-600 mt-1">{item.detail}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={checkedItems.has(item.id)}
                    onChange={(e) => {
                      e.stopPropagation()
                      handleCheckItem(item.id)
                    }}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Safety Checklist */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mb-6">
          <h4 className="font-bold text-amber-900 mb-3">Safety Checklist</h4>
          <div className="space-y-3">
            <div 
              className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                checkedItems.has('safety')
                  ? 'border-amber-600 bg-white'
                  : 'border-amber-300 bg-amber-50/50 hover:bg-white'
              }`}
              onClick={() => handleCheckItem('safety')}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">🛑</span>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Safe, stationary setting</div>
                  <div className="text-sm text-gray-600">Never take tests while driving or operating machinery</div>
                </div>
                <input
                  type="checkbox"
                  checked={checkedItems.has('safety')}
                  onChange={(e) => {
                    e.stopPropagation()
                    handleCheckItem('safety')
                  }}
                  className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500 cursor-pointer"
                />
              </div>
            </div>
            
            <div 
              className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                checkedItems.has('screen')
                  ? 'border-amber-600 bg-white'
                  : 'border-amber-300 bg-amber-50/50 hover:bg-white'
              }`}
              onClick={() => handleCheckItem('screen')}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">📱</span>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Screen brightness 70%+ and clean</div>
                  <div className="text-sm text-gray-600">Ensure your screen is bright and free of smudges</div>
                </div>
                <input
                  type="checkbox"
                  checked={checkedItems.has('screen')}
                  onChange={(e) => {
                    e.stopPropagation()
                    handleCheckItem('screen')
                  }}
                  className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleProceed}
            disabled={!allChecked()}
            className={`flex-1 ${
              allChecked()
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            I'm Ready — Start Test
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          You can skip this checklist in the future by going directly to the test page.
        </p>
      </div>
    </div>
  )
}
