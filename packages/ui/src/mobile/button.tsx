/**
 * Button Component (Mobile - NativeBase)
 */

import React from 'react'
import { Button as NBButton, IButtonProps } from 'native-base'

export interface MobileButtonProps extends IButtonProps {
  variant?: 'primary' | 'secondary' | 'outline'
  children: React.ReactNode
}

export const MobileButton: React.FC<MobileButtonProps> = ({
  variant = 'primary',
  children,
  ...props
}) => {
  const variantStyles = {
    primary: {
      bg: '#667eea',
      _pressed: { bg: '#5568d3' }
    },
    secondary: {
      bg: 'gray.200',
      _pressed: { bg: 'gray.300' }
    },
    outline: {
      variant: 'outline',
      borderColor: 'gray.300'
    }
  }

  return (
    <NBButton
      {...variantStyles[variant]}
      _text={{ color: variant === 'outline' ? 'gray.700' : 'white', fontWeight: 'medium' }}
      {...props}
    >
      {children}
    </NBButton>
  )
}

