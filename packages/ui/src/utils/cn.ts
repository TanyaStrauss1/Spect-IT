/**
 * Class name utility (clsx + tailwind-merge)
 * Combines class names with Tailwind conflict resolution
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

