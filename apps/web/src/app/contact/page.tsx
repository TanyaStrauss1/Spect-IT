/**
 * Contact Page
 * Contact information for Spect-IT vision screening service
 */

'use client'

import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Get in touch with the Spect-IT team.
          </p>

          <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
            {/* General Inquiries */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">General Inquiries</h2>
              <p>
                For questions about Spect-IT vision screening services, product information, or general support, 
                please reach out to us via email:
              </p>
              <div className="bg-blue-50 p-6 rounded-lg mt-4">
                <p className="font-semibold text-gray-900 mb-2">Contact Information</p>
                <p className="mb-2">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:tanya@spect-it.com" className="text-indigo-600 hover:underline">
                    tanya@spect-it.com
                  </a>
                </p>
                <p className="text-sm text-gray-600 mt-4">
                  We aim to respond to all inquiries within 2-3 business days.
                </p>
              </div>
            </section>

            {/* About Our Service */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About Our Service</h2>
              <p>
                Spect-IT provides digital vision screening tools through a web-based platform. We are based 
                in South Africa and serve users globally, with a focus on making vision screening accessible 
                in emerging markets.
              </p>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded mt-4">
                <p className="text-sm font-semibold text-gray-900">Important Notice</p>
                <p className="text-sm text-gray-700 mt-2">
                  Spect-IT is a screening tool, not a medical practice. We do not provide medical diagnoses, 
                  prescriptions, or treatment. All screening results should be reviewed with a licensed eye 
                  care professional. See our{' '}
                  <Link href="/medical-disclaimer" className="text-indigo-600 hover:underline">
                    Medical Disclaimer
                  </Link>
                  {' '}for more information.
                </p>
              </div>
            </section>

            {/* Support & Technical Issues */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Support & Technical Issues</h2>
              <p>
                If you're experiencing technical difficulties with the Spect-IT platform, including:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>Issues with test calibration or camera access</li>
                <li>Problems viewing or downloading your screening results</li>
                <li>Account login or registration difficulties</li>
                <li>Browser compatibility concerns</li>
              </ul>
              <p className="mt-4">
                Please email{' '}
                <a href="mailto:tanya@spect-it.com" className="text-indigo-600 hover:underline">
                  tanya@spect-it.com
                </a>{' '}
                with details about your issue, including your device type, browser version, and a description 
                of the problem.
              </p>
            </section>

            {/* Privacy & Data Concerns */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy & Data Concerns</h2>
              <p>
                We take your privacy seriously. All vision processing happens on your device, and we do not 
                capture, store, or transmit images or video of your face or eyes.
              </p>
              <p className="mt-4">
                For questions about how we handle your personal information, data access requests, or concerns 
                about privacy, please review our{' '}
                <Link href="/privacy" className="text-indigo-600 hover:underline">
                  Privacy Policy
                </Link>{' '}
                or contact us at{' '}
                <a href="mailto:tanya@spect-it.com" className="text-indigo-600 hover:underline">
                  tanya@spect-it.com
                </a>
                .
              </p>
            </section>

            {/* Medical Questions */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Medical Questions</h2>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-sm font-semibold text-gray-900">⚠️ Medical Emergencies</p>
                <p className="text-sm text-gray-700 mt-2">
                  If you are experiencing a medical emergency or sudden vision loss, please contact emergency 
                  services or visit your nearest hospital immediately. Do not rely on Spect-IT for emergency 
                  medical situations.
                </p>
              </div>
              <p className="mt-6">
                Spect-IT provides screening services only. We cannot provide medical advice, diagnoses, or 
                prescriptions. For questions about your vision health, screening results interpretation, or 
                treatment options, please consult with a licensed eye care professional such as an optometrist 
                or ophthalmologist.
              </p>
            </section>

            {/* Feedback & Suggestions */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Feedback & Suggestions</h2>
              <p>
                We're constantly working to improve Spect-IT and make vision screening more accessible. 
                If you have suggestions for new features, improvements to existing tests, or feedback about 
                your experience, we'd love to hear from you.
              </p>
              <p className="mt-4">
                Send your feedback to{' '}
                <a href="mailto:tanya@spect-it.com" className="text-indigo-600 hover:underline">
                  tanya@spect-it.com
                </a>
                .
              </p>
            </section>

            {/* Response Time */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Response Time</h2>
              <p>
                We aim to respond to all inquiries within 2-3 business days. During periods of high volume, 
                responses may take slightly longer. Thank you for your patience.
              </p>
              <p className="mt-4">
                For urgent technical issues that prevent you from using the service, please include "URGENT" 
                in your email subject line.
              </p>
            </section>

            {/* Additional Resources */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-8 rounded-lg mt-12">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📚 Additional Resources</h3>
              <p className="mb-6">
                Before contacting us, you may find answers in our existing documentation:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/how-it-works"
                  className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <h4 className="font-semibold text-gray-900 mb-2">How It Works</h4>
                  <p className="text-sm text-gray-600">
                    Learn about our screening process and technology
                  </p>
                </Link>
                <Link
                  href="/tests"
                  className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <h4 className="font-semibold text-gray-900 mb-2">Vision Tests</h4>
                  <p className="text-sm text-gray-600">
                    Explore available screening tests and what they measure
                  </p>
                </Link>
                <Link
                  href="/privacy"
                  className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <h4 className="font-semibold text-gray-900 mb-2">Privacy Policy</h4>
                  <p className="text-sm text-gray-600">
                    Understand how we protect your personal information
                  </p>
                </Link>
                <Link
                  href="/medical-disclaimer"
                  className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <h4 className="font-semibold text-gray-900 mb-2">Medical Disclaimer</h4>
                  <p className="text-sm text-gray-600">
                    Important information about screening limitations
                  </p>
                </Link>
              </div>
            </div>

            {/* Legal Notice */}
            <div className="bg-gray-100 border-l-4 border-gray-400 p-6 rounded-lg mt-8">
              <p className="text-sm text-gray-700">
                <strong>Legal Notice:</strong> By using Spect-IT, you agree to our{' '}
                <Link href="/terms" className="text-indigo-600 hover:underline">Terms of Service</Link>,{' '}
                <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>,{' '}
                <Link href="/cookies" className="text-indigo-600 hover:underline">Cookie Policy</Link>, and{' '}
                <Link href="/medical-disclaimer" className="text-indigo-600 hover:underline">Medical Disclaimer</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
