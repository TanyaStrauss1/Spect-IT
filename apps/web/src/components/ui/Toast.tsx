/**
 * Advanced Toast Notification System
 * Provides beautiful, accessible toast notifications
 */

'use client'

import { Toaster, toast } from 'react-hot-toast'

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#fff',
          color: '#333',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  )
}

// Export toast functions for easy use
export { toast }
export const showSuccess = (message: string) => toast.success(message)
export const showError = (message: string) => toast.error(message)
export const showInfo = (message: string) => toast(message)
export const showLoading = (message: string) => toast.loading(message)

