/**
 * Home Page - World-Class Spect-IT Landing
 * LiDAR-Enhanced Digital Vision Screening for Emerging Markets
 */

'use client'

import { HeroSection } from '@/components/sections/HeroSection'
import { HowItWorksSection } from '@/components/sections/HowItWorksSection'
import { TrustSignalsSection } from '@/components/sections/TrustSignalsSection'
import { TestGridSection } from '@/components/sections/TestGridSection'
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <HowItWorksSection />
      <TestGridSection />
      <TrustSignalsSection />
      <MedicalDisclaimer />
    </div>
  )
}
