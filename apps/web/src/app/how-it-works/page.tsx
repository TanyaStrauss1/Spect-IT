/**
 * How It Works Page - Detailed explanation
 */

'use client'

import { HowItWorksSection } from '@/components/sections/HowItWorksSection'
import { Card, CardContent } from '@/components/ui'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center">
            How Spect-IT Works
          </h1>
          
          <HowItWorksSection />

          {/* Technical Details */}
          <section className="mt-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Technical Architecture
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3">LiDAR Depth Sensing</h3>
                  <p className="text-gray-600">
                    Uses native LiDAR sensors on supported devices (iPad Pro, iPhone Pro) for 
                    accurate distance measurement. Falls back to camera-based depth estimation 
                    on all other devices.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3">Computer Vision</h3>
                  <p className="text-gray-600">
                    MediaPipe Face Mesh for eye landmark detection, pupil geometry extraction, 
                    and real-time eye tracking. TensorFlow.js for on-device ML inference.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3">AI Screening Engine</h3>
                  <p className="text-gray-600">
                    Validated ML models analyze test results to provide screening-level 
                    prescription estimates with confidence scores and quality flags.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3">Privacy-First</h3>
                  <p className="text-gray-600">
                    All processing happens on-device. No images or video are sent to servers. 
                    Only anonymized test results are stored (with user consent).
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

