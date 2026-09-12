/**
 * Toast Notifications
 * Simple toast notification system
 */

'use client'

export function ToastProvider() {
  return null // Toast provider - update with your preferred toast library
}

export const toast = {
  success: (message: string) => console.log('Success:', message),
  error: (message: string) => console.error('Error:', message),
  loading: (message: string) => console.log('Loading:', message),
}
