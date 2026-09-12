/**
 * Journey Modal Component
 * Displays guided screening journey with progress tracking
 */

'use client'

import { useRouter } from 'next/navigation'
import { useJourney, RECOMMENDED_TESTS, type TestDefinition } from '@/lib/journey/useJourney'
import { Button } from '@/components/ui'

interface JourneyModalProps {
  isOpen: boolean
  onClose: () => void
}

export function JourneyModal({ isOpen, onClose }: JourneyModalProps) {
  const router = useRouter()
  const { progress, calculateProgress, resetProgress, isTestAvailable } = useJourney()
  
  if (!isOpen) return null

  const progressData = calculateProgress()
  const nextTest = RECOMMENDED_TESTS.find(t => 
    !progress.completed.includes(t.id) && isTestAvailable(t.id)
  )

  const essentialTests = RECOMMENDED_TESTS.filter(t => t.category === 'essential')
  const recommendedTests = RECOMMENDED_TESTS.filter(t => t.category === 'recommended')
  const advancedTests = RECOMMENDED_TESTS.filter(t => t.category === 'advanced')
  const summaryTests = RECOMMENDED_TESTS.filter(t => t.category === 'summary')

  const startTest = (test: TestDefinition) => {
    onClose()
    router.push(test.route)
  }

  const handleResetProgress = () => {
    if (confirm('Are you sure you want to reset all progress? Your test results will be preserved.')) {
      resetProgress()
    }
  }

  const renderTestCard = (test: TestDefinition) => {
    const isCompleted = progress.completed.includes(test.id)
    const isInProgress = progress.inProgress === test.id
    const canStart = isTestAvailable(test.id)

    let statusBadge
    if (isCompleted) {
      statusBadge = <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">✓ Complete</span>
    } else if (isInProgress) {
      statusBadge = <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">⏳ In progress</span>
    } else {
      statusBadge = <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">○ Not started</span>
    }

    return (
      <div 
        key={test.id}
        className={`p-4 rounded-lg border-2 transition-all ${
          isCompleted 
            ? 'border-green-200 bg-green-50' 
            : isInProgress 
              ? 'border-yellow-200 bg-yellow-50'
              : 'border-gray-200 bg-white hover:border-indigo-300'
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{test.icon}</span>
            <div>
              <h4 className="font-semibold text-gray-900">{test.name}</h4>
              <p className="text-xs text-gray-500">{test.duration}</p>
            </div>
          </div>
          {statusBadge}
        </div>
        <p className="text-sm text-gray-600 mb-3">
          <strong>Why:</strong> {test.why}
        </p>
        <div className="flex gap-2">
          {isCompleted ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => startTest(test)}
              className="text-xs"
            >
              Retake
            </Button>
          ) : canStart ? (
            <Button
              size="sm"
              onClick={() => startTest(test)}
              className="text-xs bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label={`Start ${test.name} test`}
            >
              Start
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="text-xs"
            >
              Requires previous tests
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="journey-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 my-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 id="journey-modal-title" className="text-3xl font-bold text-gray-900 mb-2">Your Vision Screening Journey</h2>
            <p className="text-gray-600">
              Complete a comprehensive suite of clinical-grade vision tests. Results are screening only — not a diagnosis.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded text-3xl leading-none font-light p-2"
            aria-label="Close journey modal"
          >
            ×
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500"
              style={{ width: `${progressData.percentage}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <strong>{progressData.completed} of {progressData.total} tests completed</strong>
            {progressData.remaining > 0 && ` (${progressData.remaining} remaining)`}
            {progressData.remaining === 0 && ' — All done!'}
          </div>
        </div>

        {/* Next Recommended Test */}
        {nextTest && (
          <div className="mb-8 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🎯</span> Recommended Next
            </h3>
            <div className="p-4 bg-white rounded-lg border-2 border-indigo-300">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{nextTest.icon}</span>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{nextTest.name}</h4>
                    <p className="text-sm text-gray-500">{nextTest.duration}</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                <strong>Why now:</strong> {nextTest.why}
              </p>
              <Button
                onClick={() => startTest(nextTest)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
              >
                Start {nextTest.name}
              </Button>
            </div>
          </div>
        )}

        {/* All Tests */}
        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
          {/* Essential Tests */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Essential Tests</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {essentialTests.map(renderTestCard)}
            </div>
          </div>

          {/* Recommended Tests */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Recommended Tests</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {recommendedTests.map(renderTestCard)}
            </div>
          </div>

          {/* Advanced Tests */}
          {advancedTests.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Advanced Tests</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {advancedTests.map(renderTestCard)}
              </div>
            </div>
          )}

          {/* Summary Tests */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Summary & Screening Estimate</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {summaryTests.map(renderTestCard)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleResetProgress}
            className="text-sm"
          >
            Reset Progress
          </Button>
          <Button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
