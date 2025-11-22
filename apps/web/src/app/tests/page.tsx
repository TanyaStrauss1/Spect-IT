/**
 * Tests Page - All Vision Tests
 */

'use client'

import { TestGridSection } from '@/components/sections/TestGridSection'

export default function TestsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Vision Tests
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Complete comprehensive vision screening with six professional-grade tests
          </p>
        </div>
        <TestGridSection />
      </div>
    </div>
  )
}

