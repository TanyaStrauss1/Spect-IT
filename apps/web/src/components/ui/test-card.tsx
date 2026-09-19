/**
 * Test Card Component
 * Displays vision test options
 */

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card'
import { Button } from './button'

export interface TestCardProps {
  title: string
  description: string
  icon: string
  duration: string
  onStart: () => void
  completed?: boolean
  score?: number
  disabled?: boolean
}

export const TestCard: React.FC<TestCardProps> = ({
  title,
  description,
  icon,
  duration,
  onStart,
  completed = false,
  score,
  disabled = false
}) => {
  return (
    <Card className="hover:shadow-clinical-lg hover:border-cyan-200 transition-all hover:-translate-y-1 group">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="text-3xl opacity-80 group-hover:opacity-100 transition-opacity">{icon}</div>
          {completed && (
            <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-semibold border border-green-200">
              Completed
            </span>
          )}
        </div>
        <CardTitle className="text-slate-900 font-semibold">{title}</CardTitle>
        <CardDescription className="text-slate-600">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span className="bg-slate-50 px-2 py-1 rounded-full text-xs font-medium border border-slate-200">{duration}</span>
          {score !== undefined && (
            <span className="font-semibold text-cyan-600">Score: {score}</span>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onStart} className="w-full" variant={completed ? 'secondary' : 'primary'} disabled={disabled}>
          {completed ? 'Retake Test' : 'Start Test'}
        </Button>
      </CardFooter>
    </Card>
  )
}

