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
    <Card className={`hover:shadow-lg transition-shadow ${disabled ? 'opacity-75' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="text-4xl">{icon}</div>
          {completed && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Completed
            </span>
          )}
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>⏱️ {duration}</span>
          {score !== undefined && (
            <span className="font-semibold text-[#667eea]">Score: {score}</span>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onStart} 
          className="w-full" 
          variant={completed ? 'secondary' : 'primary'}
          disabled={disabled}
        >
          {completed ? 'Retake Test' : 'Start Test'}
        </Button>
      </CardFooter>
    </Card>
  )
}

