/**
 * Cookie Consent Banner
 * Minimal, honest cookie consent that links to /cookies policy
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from './ui'

const CONSENT_KEY = 'spect-it-cookie-consent'

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY)
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    setShowBanner(false)
  }

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined')
    setShowBanner(false)
  }

  if (!showBanner) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white border-t border-gray-700 shadow-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm leading-relaxed">
              <strong>Cookie Notice:</strong> Spect-IT uses essential cookies to maintain your session and security. 
              We do not use advertising or tracking cookies. By continuing to use our service, you consent to our use of essential cookies. 
              {' '}
              <Link href="/cookies" className="text-cyan-400 hover:text-cyan-300 underline">
                Learn more
              </Link>
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Button
              onClick={handleDecline}
              variant="outline"
              size="sm"
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              Decline Optional
            </Button>
            <Button
              onClick={handleAccept}
              size="sm"
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
