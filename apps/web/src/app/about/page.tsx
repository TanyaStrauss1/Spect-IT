/**
 * About Page
 * Company and product overview for Spect-IT
 */

'use client'

import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About Spect-IT
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Making vision screening accessible to everyone, everywhere.
          </p>

          <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
            {/* Our Mission */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p>
                Spect-IT is on a mission to democratize access to vision screening through cutting-edge technology. 
                We believe that everyone deserves to understand their vision health, regardless of their location 
                or economic circumstances.
              </p>
              <p className="mt-4">
                By leveraging smartphone cameras, depth sensing (on supported devices), and advanced algorithms, we're 
                bringing preliminary vision screening capabilities to the palm of your hand. Our goal is to help identify 
                potential vision concerns early and connect people with the professional care they need.
              </p>
            </section>

            {/* What We Do */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Do</h2>
              <p>
                Spect-IT provides <strong>digital vision screening tools</strong> that help you assess your vision 
                health through a series of evidence-based tests performed on your smartphone or computer.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Our Screening Services Include:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">👁️ Visual Acuity</h4>
                  <p className="text-sm">Measure how clearly you see at various distances</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">🔍 Refractive Screening</h4>
                  <p className="text-sm">Estimate nearsightedness, farsightedness, and astigmatism</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">🎨 Color Vision</h4>
                  <p className="text-sm">Screen for color vision deficiencies</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">◐ Contrast Sensitivity</h4>
                  <p className="text-sm">Assess your ability to distinguish objects from backgrounds</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">📐 Visual Field</h4>
                  <p className="text-sm">Map your peripheral vision coverage</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">👂 Hearing Tests</h4>
                  <p className="text-sm">Basic hearing threshold screening</p>
                </div>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded mt-6">
                <p className="text-sm font-semibold text-gray-900">Important: Screening Only</p>
                <p className="text-sm text-gray-700 mt-2">
                  Spect-IT provides screening services only. Our results are informational and not dispensable 
                  prescriptions. Always consult with a licensed eye care professional for comprehensive examinations 
                  and medical care. See our{' '}
                  <Link href="/medical-disclaimer" className="text-indigo-600 hover:underline">Medical Disclaimer</Link> for more information.
                </p>
              </div>
            </section>

            {/* How It Works */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p>
                Spect-IT uses your device's camera and screen to perform vision screening tests. Our technology:
              </p>
              <ol className="list-decimal pl-6 mt-4 space-y-3">
                <li>
                  <strong>Measures your viewing distance</strong> using depth sensors (TrueDepth/ARKit on supported 
                  devices) or camera-based distance estimation to ensure accurate test scaling
                </li>
                <li>
                  <strong>Detects your face position and eye landmarks</strong> to ensure proper alignment during tests
                </li>
                <li>
                  <strong>Presents calibrated test patterns</strong> optimized for your device's screen specifications
                </li>
                <li>
                  <strong>Records your responses</strong> to determine visual acuity, refractive estimates, and other measurements
                </li>
                <li>
                  <strong>Generates a screening report</strong> that you can review and share with your eye care provider
                </li>
              </ol>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mt-6">
                <p className="text-sm font-semibold text-gray-900">Privacy-First Design</p>
                <p className="text-sm text-gray-700 mt-2">
                  All vision processing happens on your device. We do not capture, store, or transmit images or video 
                  of your face or eyes. Only anonymized numerical test results are stored. Learn more in our{' '}
                  <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>.
                </p>
              </div>
            </section>

            {/* Technology */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Technology</h2>
              <p>
                Spect-IT leverages modern smartphone capabilities to deliver accurate and accessible vision screening:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>
                  <strong>Depth & Distance Measurement:</strong> On supported devices, we use TrueDepth/ARKit sensors 
                  (for eye transforms, gaze, depth, and head pose) or camera-based distance estimation to help ensure 
                  tests are properly scaled
                </li>
                <li>
                  <strong>Face Detection & Eye Tracking:</strong> Real-time face positioning and eye landmark detection 
                  ensure accurate test administration
                </li>
                <li>
                  <strong>Device Calibration:</strong> We account for screen size, pixel density, and display 
                  characteristics to standardize test presentations
                </li>
                <li>
                  <strong>On-Device Processing:</strong> All visual analysis happens locally on your device for maximum 
                  privacy and security
                </li>
                <li>
                  <strong>Progressive Web App:</strong> Works across platforms—iOS, Android, desktop—with no app store required
                </li>
              </ul>
            </section>

            {/* Who We Serve */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Who We Serve</h2>
              <p>
                Spect-IT is designed for a global audience, with special focus on emerging markets where access to 
                professional eye care may be limited:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="border-l-4 border-indigo-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Individuals</h4>
                  <p className="text-sm">
                    Monitor your vision health between professional exams and identify when it's time to see an eye 
                    care professional.
                  </p>
                </div>
                
                <div className="border-l-4 border-indigo-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Families</h4>
                  <p className="text-sm">
                    Keep track of your family's vision health, including children who may need early screening for 
                    vision problems.
                  </p>
                </div>
                
                <div className="border-l-4 border-indigo-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Schools & Organizations</h4>
                  <p className="text-sm">
                    Conduct preliminary vision screenings in educational settings to identify students who may need 
                    professional evaluation.
                  </p>
                </div>
                
                <div className="border-l-4 border-indigo-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Remote & Underserved Areas</h4>
                  <p className="text-sm">
                    Bring vision screening capabilities to communities with limited access to eye care professionals.
                  </p>
                </div>
              </div>
            </section>

            {/* Our Commitment */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment</h2>
              <p>
                We are committed to:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>
                  <strong>Accessibility:</strong> Making vision screening available to everyone, regardless of location 
                  or economic status
                </li>
                <li>
                  <strong>Privacy:</strong> Protecting your personal information and processing vision data on-device 
                  whenever possible
                </li>
                <li>
                  <strong>Transparency:</strong> Being clear about what our screening can and cannot do, and when 
                  professional care is needed
                </li>
                <li>
                  <strong>Quality:</strong> Continuously improving our screening algorithms and test protocols based 
                  on user feedback and research
                </li>
                <li>
                  <strong>Education:</strong> Empowering users with information about vision health and connecting 
                  them with professional care
                </li>
              </ul>
            </section>

            {/* Get Started */}
            <section className="bg-gradient-to-r from-indigo-50 to-blue-50 p-8 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Get Started</h2>
              <p className="mb-6">
                Ready to screen your vision? Start with a quick visual acuity test or explore our full suite of 
                screening tools.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/tests"
                  className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Start Screening
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-block bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  Learn How It Works
                </Link>
              </div>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p>
                Have questions or feedback? We'd love to hear from you.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg mt-4">
                <p className="font-semibold">Spect-IT Team</p>
                <p>Email: <a href="mailto:tanstrauss@gmail.com" className="text-indigo-600 hover:underline">tanstrauss@gmail.com</a></p>
              </div>
            </section>

            {/* Legal Notice */}
            <div className="bg-gray-100 border-l-4 border-gray-400 p-6 rounded-lg mt-12">
              <p className="text-sm text-gray-700">
                <strong>Legal Notice:</strong> Spect-IT provides screening services only. Results are not medical 
                diagnoses or dispensable prescriptions. Always consult with licensed eye care professionals for 
                comprehensive examinations and medical care. By using Spect-IT, you agree to our{' '}
                <Link href="/terms" className="text-indigo-600 hover:underline">Terms of Service</Link>,{' '}
                <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>, and{' '}
                <Link href="/medical-disclaimer" className="text-indigo-600 hover:underline">Medical Disclaimer</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
