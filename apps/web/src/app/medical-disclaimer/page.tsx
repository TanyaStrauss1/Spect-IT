/**
 * Medical Disclaimer Page
 * Comprehensive medical disclaimer for Spect-IT vision screening app
 */

'use client'

import Link from 'next/link'

export default function MedicalDisclaimerPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Medical Disclaimer
          </h1>
          <p className="text-gray-600 mb-8">
            Last Updated: September 22, 2026
          </p>

          <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
            {/* Critical Notice */}
            <section className="bg-amber-50 border-2 border-amber-500 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">⚠️ Critical Notice: Screening Only</h2>
              <p className="font-semibold text-lg">
                <strong>SPECT-IT PROVIDES SCREENING SERVICES ONLY.</strong> This application is designed to perform 
                preliminary vision and hearing screenings and is <strong>NOT</strong> a substitute for professional 
                medical examination, diagnosis, or treatment.
              </p>
            </section>

            {/* Not a Medical Device */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Not a Medical Device</h2>
              <p>
                Spect-IT is not a registered medical device and has not been evaluated or approved by any regulatory 
                authority (including the FDA, CE, or similar agencies) as a medical device. The Service is intended 
                solely for informational and educational purposes.
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>
                  <strong>Not for diagnosis:</strong> Spect-IT does not diagnose, treat, cure, or prevent any disease, 
                  medical condition, or eye disorder.
                </li>
                <li>
                  <strong>Not for treatment decisions:</strong> Results from Spect-IT should not be used to make 
                  treatment decisions without professional medical consultation.
                </li>
                <li>
                  <strong>Not for dispensing:</strong> Results cannot be used to order eyewear, contact lenses, or 
                  any medical devices without a valid prescription from a licensed professional.
                </li>
              </ul>
            </section>

            {/* Not Dispensable Prescriptions */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Screening Results Are Not Dispensable Prescriptions</h2>
              <p>
                Any refractive screening estimates (sphere, cylinder, axis) or other measurements provided by 
                Spect-IT are <strong>screening approximations only</strong> and are <strong>NOT dispensable 
                prescriptions</strong>.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mt-4">
                <p className="font-semibold">What this means:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>You cannot use Spect-IT results to order eyeglasses</li>
                  <li>You cannot use Spect-IT results to order contact lenses</li>
                  <li>You cannot use Spect-IT results to order hearing aids</li>
                  <li>You must obtain a valid prescription from a licensed eye care professional or audiologist</li>
                </ul>
              </div>
              <p className="mt-4">
                A comprehensive professional examination, including refraction, medical assessment, and consideration 
                of your individual health status, is required before a dispensable prescription can be issued.
              </p>
            </section>

            {/* No Doctor-Patient Relationship */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. No Doctor-Patient Relationship</h2>
              <p>
                Use of Spect-IT does not create any doctor-patient, optometrist-patient, audiologist-patient, or 
                healthcare provider-patient relationship. The Service does not provide medical advice, and no 
                licensed healthcare professionals are involved in generating or interpreting your screening results 
                through the app.
              </p>
              <p className="mt-4">
                All content, information, and screening results provided through Spect-IT are for <strong>informational 
                purposes only</strong> and should not be considered professional medical advice.
              </p>
            </section>

            {/* Professional Care Required */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Professional Care Required</h2>
              <p>
                You <strong>must</strong> consult with a licensed healthcare professional for:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li><strong>Comprehensive examinations:</strong> Regular eye and hearing examinations by qualified professionals</li>
                <li><strong>Medical diagnoses:</strong> Accurate diagnosis of any vision or hearing conditions</li>
                <li><strong>Dispensable prescriptions:</strong> Valid prescriptions for corrective lenses, contact lenses, or hearing aids</li>
                <li><strong>Treatment plans:</strong> Appropriate treatment recommendations for any diagnosed conditions</li>
                <li><strong>Medical advice:</strong> Personalized medical advice based on your individual health status</li>
              </ul>
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p className="font-semibold text-gray-900 mb-2">Recommended Healthcare Professionals:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Optometrist:</strong> For comprehensive eye examinations, prescriptions, and primary eye care</li>
                  <li><strong>Ophthalmologist:</strong> For medical eye care, eye surgery, and treatment of eye diseases</li>
                  <li><strong>Audiologist:</strong> For hearing evaluations, hearing aids, and hearing-related care</li>
                </ul>
              </div>
            </section>

            {/* Screening Limitations */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Limitations of Screening</h2>
              <p>
                Vision and hearing screening, including digital screening performed by Spect-IT, has inherent limitations:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li><strong>False positives/negatives:</strong> Screening may indicate issues that don't exist or miss issues that do exist</li>
                <li><strong>Environmental factors:</strong> Lighting, screen calibration, ambient noise, and other factors affect accuracy</li>
                <li><strong>Device limitations:</strong> Different devices (phones, tablets, monitors) have varying capabilities and accuracies</li>
                <li><strong>User compliance:</strong> Proper positioning, distance, and test execution affect results</li>
                <li><strong>No eye health assessment:</strong> Screening does not detect eye diseases, infections, or other medical conditions</li>
                <li><strong>No comprehensive refraction:</strong> Screening estimates are not as accurate as professional refraction</li>
              </ul>
            </section>

            {/* When to Seek Professional Care */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. When to Seek Professional Care</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.1 Routine Care</h3>
              <p>
                <strong>Everyone should have regular professional eye and hearing examinations, regardless of screening results:</strong>
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Children: Annual eye exams starting at age 3</li>
                <li>Adults (18-64): Eye exam every 2 years, or annually if you wear corrective lenses</li>
                <li>Adults (65+): Annual eye exams</li>
                <li>Hearing: Baseline hearing test at age 50, then every 3 years</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.2 When Screening Indicates Concerns</h3>
              <p>
                If your Spect-IT screening results indicate potential vision or hearing concerns, schedule an 
                appointment with a licensed professional for comprehensive evaluation.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.3 Emergency Symptoms</h3>
              <div className="bg-red-50 border-2 border-red-500 p-6 rounded-lg">
                <p className="font-bold text-red-900 text-lg mb-4">
                  🚨 Seek immediate medical attention if you experience:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-red-900">
                  <li><strong>Sudden vision loss</strong> or significant vision changes</li>
                  <li><strong>Flashes of light</strong> or sudden increase in floaters</li>
                  <li><strong>Eye pain,</strong> redness, or discharge</li>
                  <li><strong>Severe headache</strong> with vision changes</li>
                  <li><strong>Distortion or dark areas</strong> in central vision</li>
                  <li><strong>Eye trauma</strong> or chemical exposure</li>
                  <li><strong>Sudden hearing loss</strong></li>
                </ul>
                <p className="mt-4 font-semibold text-red-900">
                  For emergencies, call emergency services or visit an emergency room. Do not rely on Spect-IT 
                  for emergency situations.
                </p>
              </div>
            </section>

            {/* No Emergency Services */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Not for Emergencies</h2>
              <p>
                Spect-IT is <strong>not designed for emergencies</strong> and does not provide emergency medical services. 
                The Service should not be used if you are experiencing urgent symptoms requiring immediate medical attention.
              </p>
              <p className="mt-4">
                If you have a medical emergency, call emergency services (911 in the US) or go to the nearest emergency room.
              </p>
            </section>

            {/* Accuracy and Reliability */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. No Guarantee of Accuracy</h2>
              <p>
                While we strive to provide helpful screening tools, we make <strong>no guarantees or warranties</strong> 
                regarding the accuracy, reliability, completeness, or timeliness of any screening results or information 
                provided through Spect-IT.
              </p>
              <p className="mt-4">
                Screening results may be affected by numerous factors including device quality, environmental conditions, 
                user technique, and software limitations. Professional examinations are always more accurate and comprehensive.
              </p>
            </section>

            {/* User Responsibility */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. User Responsibility</h2>
              <p>
                By using Spect-IT, you acknowledge and agree that:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>You are using the Service at your own risk</li>
                <li>You will not rely solely on screening results for medical decisions</li>
                <li>You will seek professional care for comprehensive examinations and dispensable prescriptions</li>
                <li>You will not use screening results to order eyewear, contact lenses, or hearing aids without a valid prescription</li>
                <li>You will seek immediate medical attention for urgent symptoms</li>
                <li>You understand the limitations of screening technology</li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Limitation of Liability</h2>
              <p className="uppercase font-semibold">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, SPECT-IT, ITS AFFILIATES, DIRECTORS, EMPLOYEES, AND AGENTS 
                SHALL NOT BE LIABLE FOR ANY DAMAGES, INJURIES, LOSSES, OR CLAIMS ARISING OUT OF OR RELATED TO YOUR 
                USE OF THE SERVICE, YOUR RELIANCE ON SCREENING RESULTS, OR YOUR FAILURE TO SEEK PROFESSIONAL MEDICAL CARE.
              </p>
              <p className="mt-4">
                See our <Link href="/terms" className="text-indigo-600 hover:underline">Terms of Service</Link> for 
                complete limitation of liability provisions.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Questions About This Disclaimer</h2>
              <p>
                If you have questions about this Medical Disclaimer, please contact us at:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg mt-4">
                <p className="font-semibold">Spect-IT Medical Disclaimer Inquiries</p>
                <p>Email: <a href="mailto:tanstrauss@gmail.com" className="text-indigo-600 hover:underline">tanstrauss@gmail.com</a></p>
              </div>
            </section>

            {/* Acknowledgment */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-lg mt-12">
              <h3 className="text-lg font-bold text-gray-900 mb-2">⚠️ Acknowledgment Required</h3>
              <p className="text-sm text-gray-700">
                By using Spect-IT, you acknowledge that you have read, understood, and agree to this Medical Disclaimer. 
                You acknowledge that Spect-IT provides screening services only, that screening results are not dispensable 
                prescriptions, and that you will seek professional care for comprehensive examinations, diagnoses, and 
                dispensable prescriptions.
              </p>
              <p className="text-sm text-gray-700 mt-4">
                See also: <Link href="/terms" className="text-indigo-600 hover:underline">Terms of Service</Link> and{' '}
                <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
