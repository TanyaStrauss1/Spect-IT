/**
 * Result Card Component
 * Displays test results
 */

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './card'

export interface ResultCardProps {
  testName: string
  score: string | number
  status: 'good' | 'moderate' | 'poor'
  details?: string
  recommendation?: string
  date: string
}

export const ResultCard: React.FC<ResultCardProps> = ({
  testName,
  score,
  status,
  details,
  recommendation,
  date
}) => {
  const statusColors = {
    good: 'bg-green-100 text-green-800 border-green-200',
    moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    poor: 'bg-red-100 text-red-800 border-red-200'
  }

  return (
    <Card className={`border-2 ${statusColors[status]}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{testName}</CardTitle>
          <span className="text-sm opacity-75">{date}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <span className="text-3xl font-bold">{score}</span>
            {typeof score === 'number' && <span className="text-sm ml-2">/ 100</span>}
          </div>
          {details && (
            <p className="text-sm opacity-90">{details}</p>
          )}
          {recommendation && (
            <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-md">
              <p className="text-sm font-semibold mb-1">💡 Recommendation:</p>
              <p className="text-sm">{recommendation}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

