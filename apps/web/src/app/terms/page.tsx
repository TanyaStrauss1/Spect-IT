/**
 * Terms of Service Page
 * Store-ready terms of service for Spect-IT vision screening app
 */

'use client'

import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-600 mb-8">
            Last Updated: September 18, 2026
          </p>

          <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p>
                Welcome to Spect-IT. By accessing or using our vision and hearing screening application and 
                services (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you 
                do not agree to these Terms, do not use the Service.
              </p>
              <p className="mt-4">
                These Terms constitute a legally binding agreement between you and Spect-IT ("we," "our," or "us").
              </p>
            </section>

            {/* Medical Disclaimer and Service Description */}
            <section className="bg-amber-50 border-2 border-amber-500 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Medical Disclaimer and Service Description</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.1 Screening Only – Not Medical Diagnosis or Dispensable Prescription</h3>
              <p className="font-semibold">
                <strong>SPECT-IT PROVIDES SCREENING SERVICES ONLY.</strong> The Service is designed to perform 
                preliminary vision and hearing screenings and is <strong>NOT</strong> a substitute for professional 
                medical examination, diagnosis, or treatment.
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>
                  <strong>Not a Medical Device:</strong> Spect-IT is not a registered medical device and is not 
                  intended to diagnose, treat, cure, or prevent any disease or medical condition.
                </li>
                <li>
                  <strong>Not Dispensable Prescriptions:</strong> Any refractive screening estimates (sphere, cylinder, 
                  axis) or hearing thresholds provided by the Service are <strong>screening approximations only</strong> 
                  and are <strong>NOT dispensable prescriptions</strong>. They cannot be used to order eyewear, contact 
                  lenses, or hearing aids.
                </li>
                <li>
                  <strong>No Doctor-Patient Relationship:</strong> Use of the Service does not create a doctor-patient, 
                  optometrist-patient, or healthcare provider-patient relationship.
                </li>
                <li>
                  <strong>Professional Care Required:</strong> You must consult with a licensed optometrist, ophthalmologist, 
                  or audiologist for comprehensive examinations, medical diagnoses, dispensable prescriptions, and treatment 
                  decisions.
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.2 Informational Purposes Only</h3>
              <p>
                All screening results, content, and information provided through the Service are for <strong>informational 
                and educational purposes only</strong>. Results should be shared with and reviewed by a qualified healthcare 
                professional before making any health-related decisions.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.3 No Emergency Services</h3>
              <p>
                The Service is not for emergencies. If you experience sudden vision loss, eye pain, severe headaches, 
                flashes of light, or other urgent symptoms, seek immediate medical attention. Call emergency services 
                or visit an emergency room.
              </p>
            </section>

            {/* Eligibility */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Eligibility</h2>
              <p>You must be at least 13 years old to use the Service. By using the Service, you represent and warrant that:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>You are at least 13 years of age</li>
                <li>You have the legal capacity to enter into these Terms</li>
                <li>Your use of the Service complies with all applicable laws and regulations</li>
                <li>All information you provide is accurate and current</li>
              </ul>
              <p className="mt-4">
                Users aged 13-17 should use the Service under parental or guardian supervision.
              </p>
            </section>

            {/* Account Registration and Security */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Account Registration and Security</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.1 Account Creation</h3>
              <p>
                To access certain features, you must create an account. You agree to provide accurate, complete, 
                and current information and to keep your account information updated.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.2 Account Security</h3>
              <p>You are responsible for:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Maintaining the confidentiality of your password</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized access or security breach</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.3 Account Termination</h3>
              <p>
                We reserve the right to suspend or terminate your account at any time for violation of these Terms, 
                fraudulent activity, or any other reason at our sole discretion. You may delete your account at any 
                time by contacting us at <a href="mailto:tanstrauss@gmail.com" className="text-indigo-600 hover:underline">tanstrauss@gmail.com</a>.
              </p>
            </section>

            {/* Acceptable Use */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Acceptable Use</h2>
              <p>You agree NOT to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Use the Service for any unlawful purpose or in violation of these Terms</li>
                <li>Misrepresent screening results as medical diagnoses or dispensable prescriptions</li>
                <li>Use the Service to order eyewear, contact lenses, or hearing aids without a valid prescription from a licensed professional</li>
                <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                <li>Use automated systems (bots, scrapers) to access the Service without permission</li>
                <li>Transmit viruses, malware, or other harmful code</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Collect or store personal information about other users</li>
                <li>Impersonate any person or entity</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.1 Our Rights</h3>
              <p>
                The Service, including all content, features, functionality, software, algorithms, trademarks, and 
                logos, is owned by Spect-IT and is protected by copyright, trademark, and other intellectual property 
                laws. You are granted a limited, non-exclusive, non-transferable license to access and use the Service 
                for personal, non-commercial purposes.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.2 Your Data</h3>
              <p>
                You retain ownership of your personal information and screening results. By using the Service, you 
                grant us a limited license to store, process, and display your data as necessary to provide the Service 
                and as described in our <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.3 Feedback</h3>
              <p>
                If you provide feedback, suggestions, or ideas about the Service, you grant us a perpetual, irrevocable, 
                royalty-free license to use and incorporate such feedback without compensation or attribution.
              </p>
            </section>

            {/* Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Privacy</h2>
              <p>
                Your privacy is important to us. Our collection and use of your information is governed by our{' '}
                <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>, which is 
                incorporated into these Terms by reference. Key privacy highlights:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li><strong>On-Device Processing:</strong> Vision and hearing tests are processed on your device. We do not capture or store images or video of your face or eyes.</li>
                <li><strong>Camera Access:</strong> Camera access is required for vision screening but all processing is local. No images are transmitted or stored.</li>
                <li><strong>Data Storage:</strong> Only anonymized numerical test results are stored securely using industry-standard encryption.</li>
                <li><strong>No Sale of Data:</strong> We do not sell your personal information.</li>
              </ul>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Third-Party Services and Links</h2>
              <p>
                The Service may contain links to third-party websites, services, or integrations (e.g., specialist 
                directories, marketplace retailers). We do not control and are not responsible for the content, 
                privacy practices, or terms of these third parties. Your use of third-party services is at your own 
                risk and subject to their terms and policies.
              </p>
            </section>

            {/* Disclaimer of Warranties */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Disclaimer of Warranties</h2>
              <p className="uppercase font-semibold">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS 
                OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
                PURPOSE, NON-INFRINGEMENT, OR ACCURACY.
              </p>
              <p className="mt-4">We do not warrant that:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>The Service will be uninterrupted, secure, or error-free</li>
                <li>Screening results will be accurate, complete, or reliable</li>
                <li>Any errors or defects will be corrected</li>
                <li>The Service will meet your specific requirements</li>
              </ul>
              <p className="mt-4">
                <strong>Some jurisdictions do not allow the exclusion of implied warranties, so some of the above 
                exclusions may not apply to you.</strong>
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Limitation of Liability</h2>
              <p className="uppercase font-semibold">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, SPECT-IT, ITS AFFILIATES, DIRECTORS, EMPLOYEES, AND AGENTS 
                SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, 
                INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR USE, ARISING OUT OF OR RELATED TO YOUR USE 
                OF THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              </p>
              <p className="mt-4 uppercase font-semibold">
                IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS EXCEED THE AMOUNT YOU PAID TO USE THE 
                SERVICE IN THE TWELVE (12) MONTHS PRIOR TO THE CLAIM, OR $100 USD, WHICHEVER IS GREATER.
              </p>
              <p className="mt-4">
                <strong>Some jurisdictions do not allow the limitation of liability for incidental or consequential 
                damages, so some of the above limitations may not apply to you.</strong>
              </p>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless Spect-IT, its affiliates, directors, employees, 
                and agents from and against any claims, liabilities, damages, losses, costs, or expenses (including 
                reasonable attorneys' fees) arising out of or related to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
                <li>Your misuse of screening results (e.g., treating them as dispensable prescriptions)</li>
              </ul>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify you of significant changes by 
                posting the updated Terms on this page and updating the "Last Updated" date. Your continued use of 
                the Service after changes constitutes acceptance of the updated Terms.
              </p>
            </section>

            {/* Governing Law and Dispute Resolution */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Governing Law and Dispute Resolution</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction where 
                Spect-IT operates, without regard to conflict of law principles. Any disputes arising from these Terms 
                or the Service shall be resolved through good-faith negotiations. If negotiations fail, disputes may 
                be resolved through binding arbitration or in the courts of appropriate jurisdiction.
              </p>
            </section>

            {/* Severability */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Severability</h2>
              <p>
                If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions 
                shall remain in full force and effect.
              </p>
            </section>

            {/* Entire Agreement */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Entire Agreement</h2>
              <p>
                These Terms, together with our <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link> and 
                any other legal notices or policies published on the Service, constitute the entire agreement between 
                you and Spect-IT regarding the Service.
              </p>
            </section>

            {/* Contact Us */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Contact Us</h2>
              <p>
                If you have questions, concerns, or feedback about these Terms or the Service, please contact us at:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg mt-4">
                <p className="font-semibold">Spect-IT Support</p>
                <p>Email: <a href="mailto:tanstrauss@gmail.com" className="text-indigo-600 hover:underline">tanstrauss@gmail.com</a></p>
              </div>
            </section>

            {/* Medical Screening Reminder */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-lg mt-12">
              <h3 className="text-lg font-bold text-gray-900 mb-2">⚠️ Medical Screening Reminder</h3>
              <p className="text-sm text-gray-700">
                By using Spect-IT, you acknowledge and agree that:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-sm text-gray-700">
                <li>Spect-IT provides <strong>screening services only</strong></li>
                <li>Screening results are <strong>not medical diagnoses or dispensable prescriptions</strong></li>
                <li>You will consult with a licensed healthcare professional for comprehensive examinations, diagnoses, and dispensable prescriptions</li>
                <li>You will not use screening results to order eyewear, contact lenses, or hearing aids without a valid prescription from a licensed professional</li>
                <li>You will seek immediate medical attention for any urgent symptoms</li>
              </ul>
              <p className="text-sm text-gray-700 mt-4">
                See our <Link href="/medical-disclaimer" className="text-indigo-600 hover:underline">Medical Disclaimer</Link> for more information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
