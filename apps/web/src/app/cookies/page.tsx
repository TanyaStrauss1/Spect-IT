/**
 * Cookie Policy Page
 * Cookie usage policy for Spect-IT vision screening app
 */

'use client'

import Link from 'next/link'

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Cookie Policy
          </h1>
          <p className="text-gray-600 mb-8">
            Last Updated: September 22, 2026
          </p>

          <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p>
                This Cookie Policy explains how Spect-IT ("we," "our," or "us") uses cookies and similar tracking 
                technologies on our vision and hearing screening application and services (the "Service"). This 
                policy should be read together with our{' '}
                <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>.
              </p>
              <p className="mt-4">
                By using our Service, you consent to the use of cookies as described in this Cookie Policy.
              </p>
            </section>

            {/* What Are Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. What Are Cookies?</h2>
              <p>
                Cookies are small text files that are stored on your device (computer, smartphone, or tablet) when 
                you visit a website or use an application. Cookies help websites and apps remember information about 
                your visit, such as your preferences, login status, and activities.
              </p>
              <p className="mt-4">
                Cookies can be "session cookies" (deleted when you close your browser) or "persistent cookies" 
                (remain on your device until they expire or you delete them).
              </p>
            </section>

            {/* Types of Cookies We Use */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Types of Cookies We Use</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.1 Essential Cookies</h3>
              <p>
                These cookies are necessary for the Service to function properly. They enable core functionality 
                such as authentication, security, and session management.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <p className="font-semibold text-gray-900 mb-2">Examples of essential cookies:</p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Authentication cookies (to keep you logged in)</li>
                  <li>Security cookies (to prevent fraud and protect your account)</li>
                  <li>Session management cookies (to maintain your active session)</li>
                  <li>Load balancing cookies (to distribute traffic across servers)</li>
                </ul>
              </div>
              <p className="mt-4">
                <strong>You cannot opt out of essential cookies</strong> because they are necessary for the Service 
                to work. If you disable these cookies through your browser settings, some features of the Service 
                may not function properly.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.2 Functional Cookies</h3>
              <p>
                These cookies enable enhanced functionality and personalization, such as remembering your preferences, 
                language settings, and test history.
              </p>
              <div className="bg-green-50 p-4 rounded-lg mt-4">
                <p className="font-semibold text-gray-900 mb-2">Examples of functional cookies:</p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>User preference cookies (remembering your settings and choices)</li>
                  <li>Device calibration cookies (storing screen specifications for accurate tests)</li>
                  <li>Test progress cookies (saving your position in multi-step tests)</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.3 Performance and Analytics Cookies</h3>
              <p>
                These cookies collect information about how you use the Service, such as which pages you visit, 
                how long you spend on each page, and any errors you encounter. This data helps us improve the 
                Service and user experience.
              </p>
              <div className="bg-purple-50 p-4 rounded-lg mt-4">
                <p className="font-semibold text-gray-900 mb-2">Examples of analytics cookies:</p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Page view tracking (understanding which features are most used)</li>
                  <li>Performance metrics (identifying slow-loading pages or errors)</li>
                  <li>Usage patterns (analyzing how users navigate the Service)</li>
                </ul>
              </div>
              <p className="mt-4">
                We use anonymized or aggregated analytics data whenever possible to protect your privacy.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.4 Advertising and Marketing Cookies</h3>
              <p>
                Currently, <strong>Spect-IT does not use advertising or marketing cookies</strong>. We do not track 
                you across other websites for advertising purposes, and we do not sell your personal information to 
                third parties.
              </p>
              <p className="mt-4">
                If we introduce advertising or marketing cookies in the future, we will update this Cookie Policy 
                and provide you with clear options to opt out.
              </p>
            </section>

            {/* Third-Party Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Third-Party Cookies</h2>
              <p>
                We may use third-party service providers who set cookies on our behalf to help us operate and 
                improve the Service. These third parties may include:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>
                  <strong>Hosting and Infrastructure:</strong> Supabase and other cloud service providers use 
                  cookies to maintain secure connections and deliver the Service reliably.
                </li>
                <li>
                  <strong>Analytics:</strong> We may use analytics services to understand how users interact with 
                  the Service and identify areas for improvement.
                </li>
                <li>
                  <strong>Authentication:</strong> Our authentication provider uses cookies to manage secure login 
                  and session management.
                </li>
              </ul>
              <p className="mt-4">
                These third parties are bound by confidentiality agreements and are only permitted to use cookies 
                for the specific purposes we authorize. They are not allowed to use your information for their own 
                purposes or share it with other third parties.
              </p>
            </section>

            {/* Local Storage and Similar Technologies */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Local Storage and Similar Technologies</h2>
              <p>
                In addition to cookies, we may use similar technologies such as:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>
                  <strong>Local Storage:</strong> HTML5 local storage allows us to store data locally on your device, 
                  such as test results, user preferences, and device calibration settings. This data persists even 
                  after you close your browser.
                </li>
                <li>
                  <strong>Session Storage:</strong> Similar to local storage but data is cleared when you close the 
                  browser tab or window.
                </li>
                <li>
                  <strong>IndexedDB:</strong> A more advanced client-side storage system for storing larger amounts 
                  of structured data, such as test history and screening results.
                </li>
              </ul>
              <p className="mt-4">
                These technologies serve similar purposes to cookies but offer greater storage capacity and 
                functionality. They are subject to the same privacy protections as cookies.
              </p>
            </section>

            {/* Managing Your Cookie Preferences */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Managing Your Cookie Preferences</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.1 Browser Settings</h3>
              <p>
                Most web browsers allow you to control cookies through their settings. You can typically:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>View which cookies are stored on your device</li>
                <li>Delete existing cookies</li>
                <li>Block all cookies or only third-party cookies</li>
                <li>Set preferences for specific websites</li>
              </ul>
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p className="font-semibold text-gray-900 mb-2">Common browser cookie settings:</p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                  <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
                  <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                  <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.2 Mobile Device Settings</h3>
              <p>
                On mobile devices, you can manage cookies and tracking through your device settings:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>iOS:</strong> Settings → Safari → Advanced → Website Data or Block All Cookies</li>
                <li><strong>Android:</strong> Settings → Site Settings → Cookies (location varies by browser)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.3 Impact of Disabling Cookies</h3>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                <p className="font-semibold text-gray-900 mb-2">⚠️ Important:</p>
                <p className="text-sm text-gray-700">
                  If you disable or delete cookies, some features of the Service may not function properly. For 
                  example, you may not be able to stay logged in, save your test results, or maintain your preferences. 
                  Essential cookies are required for the Service to work.
                </p>
              </div>
            </section>

            {/* Do Not Track */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Do Not Track (DNT)</h2>
              <p>
                Some browsers support "Do Not Track" (DNT) signals that request websites not to track your browsing 
                activity. Currently, <strong>there is no universal standard for how websites should respond to DNT signals</strong>, 
                and we do not currently respond to DNT signals.
              </p>
              <p className="mt-4">
                However, we are committed to respecting your privacy. You can control cookies and tracking through 
                your browser settings and device permissions as described above.
              </p>
            </section>

            {/* Your Privacy Rights */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Your Privacy Rights</h2>
              <p>
                Depending on your location, you may have specific rights regarding cookies and tracking technologies, 
                including:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li><strong>Right to Access:</strong> You can request information about the cookies and data we collect</li>
                <li><strong>Right to Deletion:</strong> You can request deletion of cookies and associated data</li>
                <li><strong>Right to Opt-Out:</strong> You can opt out of non-essential cookies</li>
                <li><strong>Right to Withdraw Consent:</strong> You can withdraw your consent to cookies at any time</li>
              </ul>
              <p className="mt-4">
                To exercise these rights or for questions about cookies, contact us at{' '}
                <a href="mailto:tanstrauss@gmail.com" className="text-indigo-600 hover:underline">tanstrauss@gmail.com</a>.
              </p>
            </section>

            {/* Changes to This Cookie Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to This Cookie Policy</h2>
              <p>
                We may update this Cookie Policy from time to time to reflect changes in our practices or legal 
                requirements. We will notify you of significant changes by posting the updated policy on this page 
                and updating the "Last Updated" date.
              </p>
              <p className="mt-4">
                Continued use of the Service after changes constitutes acceptance of the updated Cookie Policy.
              </p>
            </section>

            {/* Contact Us */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h2>
              <p>
                If you have questions, concerns, or requests regarding this Cookie Policy or our use of cookies, 
                please contact us at:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg mt-4">
                <p className="font-semibold">Spect-IT Cookie Policy Inquiries</p>
                <p>Email: <a href="mailto:tanstrauss@gmail.com" className="text-indigo-600 hover:underline">tanstrauss@gmail.com</a></p>
              </div>
            </section>

            {/* Additional Resources */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mt-12">
              <h3 className="text-lg font-bold text-gray-900 mb-2">📚 Additional Resources</h3>
              <p className="text-sm text-gray-700 mb-4">
                For more information about how we collect, use, and protect your personal information, please see:
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <Link href="/privacy" className="text-indigo-600 hover:underline font-semibold">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-indigo-600 hover:underline font-semibold">
                  Terms of Service
                </Link>
                <Link href="/medical-disclaimer" className="text-indigo-600 hover:underline font-semibold">
                  Medical Disclaimer
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
