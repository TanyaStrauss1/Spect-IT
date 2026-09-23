/**
 * Privacy Policy Page
 * Store-ready privacy policy for Spect-IT vision screening app
 */

'use client'

import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-600 mb-8">
            Last Updated: September 18, 2026
          </p>

          <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p>
                Spect-IT ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you use our 
                vision and hearing screening application and services (collectively, the "Service").
              </p>
              <p className="mt-4">
                <strong>Important:</strong> Spect-IT provides <strong>screening services only</strong>. We do not 
                provide medical diagnoses, dispensable prescriptions, or replace comprehensive professional eye 
                or hearing care. All screening results are informational and should be reviewed with a qualified 
                healthcare professional.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.1 Account Information</h3>
              <p>When you create an account, we collect:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Email address</li>
                <li>Password (encrypted)</li>
                <li>Account creation and last login timestamps</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.2 Screening Data</h3>
              <p>When you use our vision or hearing screening tests, we collect:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Test results (visual acuity, refractive screening estimates, contrast sensitivity, color vision, hearing thresholds)</li>
                <li>Device information (screen size, pixel density, operating system)</li>
                <li>Test environment metadata (viewing distance, lighting conditions if measured)</li>
                <li>Test timestamps and completion status</li>
                <li>Quality scores and confidence metrics</li>
              </ul>
              <p className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <strong>Privacy-First Design:</strong> All vision processing happens <strong>on your device</strong>. 
                We <strong>do not</strong> capture, store, or transmit images or video of your face or eyes. Only 
                anonymized numerical test results are stored.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.3 Camera Access</h3>
              <p>
                Our Vision Scan feature requires camera access on mobile devices to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Detect your face position and eye landmarks for accurate test positioning</li>
                <li>Measure viewing distance using depth sensors (TrueDepth/ARKit on supported devices) or camera-based depth estimation</li>
                <li>Ensure proper alignment during visual acuity and refractive screening tests</li>
              </ul>
              <p className="mt-4">
                <strong>Camera data is processed entirely on your device and is never stored or transmitted.</strong> 
                You can revoke camera permissions at any time through your device settings.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.4 Usage Data</h3>
              <p>We automatically collect:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Device type, operating system, and browser information</li>
                <li>IP address and general location (city/country level)</li>
                <li>Pages visited and features used</li>
                <li>Error logs and performance metrics</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.5 Optional Data</h3>
              <p>You may choose to provide:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Age and demographic information (to improve screening accuracy)</li>
                <li>Previous prescription information (for comparison purposes)</li>
                <li>Feedback and support messages</li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Provide, operate, and maintain our screening services</li>
                <li>Store and display your test results and screening history</li>
                <li>Improve and optimize our screening algorithms and user experience</li>
                <li>Communicate with you about your account and service updates</li>
                <li>Respond to your support requests and inquiries</li>
                <li>Detect, prevent, and address technical issues and security concerns</li>
                <li>Aggregate and analyze usage patterns (with anonymized data) to improve our Service</li>
                <li>Comply with legal obligations and protect our rights</li>
              </ul>
            </section>

            {/* Data Storage and Security */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Storage and Security</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.1 Infrastructure</h3>
              <p>
                Your data is stored securely using Supabase (an open-source Firebase alternative built on PostgreSQL), 
                with servers located in secure data centers. We implement industry-standard security measures including:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Encryption in transit (TLS/SSL) and at rest</li>
                <li>Row-level security policies to isolate user data</li>
                <li>Regular security audits and updates</li>
                <li>Secure authentication with encrypted passwords</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.2 Data Retention</h3>
              <p>
                We retain your account and screening data for as long as your account is active. You may request 
                deletion of your data at any time by contacting us at <a href="mailto:tanstrauss@gmail.com" className="text-indigo-600 hover:underline">tanstrauss@gmail.com</a>.
              </p>
            </section>

            {/* Data Sharing and Disclosure */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Sharing and Disclosure</h2>
              <p>
                <strong>We do not sell your personal information.</strong> We may share your information only in the 
                following circumstances:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li><strong>With Your Consent:</strong> When you explicitly authorize sharing (e.g., exporting results to share with your eye care provider)</li>
                <li><strong>Service Providers:</strong> With trusted third-party service providers who assist in operating our Service (hosting, analytics, customer support), under strict confidentiality agreements</li>
                <li><strong>Legal Compliance:</strong> When required by law, court order, or government request</li>
                <li><strong>Safety and Protection:</strong> To protect the rights, property, or safety of Spect-IT, our users, or the public</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (with notice to affected users)</li>
              </ul>
            </section>

            {/* Your Rights and Choices */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights and Choices</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                <li><strong>Export:</strong> Download your screening results in a portable format</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications (note: we may still send service-related emails)</li>
                <li><strong>Revoke Permissions:</strong> Withdraw camera or other permissions through your device settings</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, contact us at <a href="mailto:tanstrauss@gmail.com" className="text-indigo-600 hover:underline">tanstrauss@gmail.com</a>.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Children's Privacy</h2>
              <p>
                Our Service is intended for users aged 13 and older. We do not knowingly collect personal information 
                from children under 13. If you believe we have inadvertently collected information from a child under 13, 
                please contact us immediately at <a href="mailto:tanstrauss@gmail.com" className="text-indigo-600 hover:underline">tanstrauss@gmail.com</a>.
              </p>
              <p className="mt-4">
                For users aged 13-17, we recommend parental guidance when using the Service and reviewing screening results 
                with a parent or guardian.
              </p>
            </section>

            {/* International Users */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. International Users</h2>
              <p>
                Spect-IT is designed for global use, with a focus on emerging markets. Your information may be 
                transferred to and processed in countries other than your own. By using our Service, you consent 
                to the transfer of your information to countries that may have different data protection laws than 
                your jurisdiction.
              </p>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Third-Party Services</h2>
              <p>
                Our Service may contain links to external websites or integrate with third-party services (e.g., 
                specialist directories, marketplace retailers). We are not responsible for the privacy practices of 
                these third parties. Please review their privacy policies before providing them with your information.
              </p>
            </section>

            {/* Changes to This Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of significant changes by 
                posting the updated policy on this page and updating the "Last Updated" date. Continued use of the 
                Service after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Contact Us */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
              <p>
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, 
                please contact us at:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg mt-4">
                <p className="font-semibold">Spect-IT Privacy Team</p>
                <p>Email: <a href="mailto:tanstrauss@gmail.com" className="text-indigo-600 hover:underline">tanstrauss@gmail.com</a></p>
              </div>
            </section>

            {/* Medical Screening Reminder */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-lg mt-12">
              <h3 className="text-lg font-bold text-gray-900 mb-2">⚠️ Medical Screening Reminder</h3>
              <p className="text-sm text-gray-700">
                Spect-IT provides <strong>screening services only</strong> and is not a substitute for professional 
                eye or hearing care. All screening results are informational and <strong>not dispensable prescriptions</strong>. 
                Always consult with a licensed optometrist, ophthalmologist, or audiologist for comprehensive examinations, 
                medical diagnoses, and dispensable prescriptions. See our{' '}
                <Link href="/terms" className="text-indigo-600 hover:underline">Terms of Service</Link> and{' '}
                <Link href="/medical-disclaimer" className="text-indigo-600 hover:underline">Medical Disclaimer</Link> for more information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
