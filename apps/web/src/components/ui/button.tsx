/**
 * Button Component (Web - shadcn/ui style)
 */

import React from 'react'
import { cn } from '../utils/cn'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-clinical font-semibold transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-gradient-to-r from-cyan-600 to-teal-600 text-white hover:from-cyan-700 hover:to-teal-700 shadow-clinical hover:shadow-clinical-lg': variant === 'primary',
            'bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200': variant === 'secondary',
            'border-2 border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50': variant === 'outline',
            'hover:bg-slate-100 text-slate-700': variant === 'ghost',
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4': size === 'md',
            'h-12 px-6 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

