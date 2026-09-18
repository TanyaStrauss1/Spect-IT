/**
 * Vision Scan PDF Generator
 * Generates printable PDF summaries for Vision Scan results
 */

import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import { type VisionScanResult } from '@spect-it/cv'

export interface PDFGenerationOptions {
  participantName?: string
  includeMethodology?: boolean
}

/**
 * Generate HTML content for Vision Scan PDF
 */
function generatePDFHTML(
  result: VisionScanResult,
  options: PDFGenerationOptions = {}
): string {
  const { participantName, includeMethodology = true } = options
  
  const testDate = new Date(result.timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const capabilityMode = result.deviceQualification.useSensorBasedMeasurements ? 'Full' : 'Degraded'
  const distanceMethod = result.calibration.usedSensorData 
    ? 'Sensor (TrueDepth/LiDAR)' 
    : 'IPD/face-width estimation'
  
  // Extract methodology details from test_data if available
  const methodology = result.methodology || {
    distanceMethod: result.calibration.usedSensorData ? 'sensor' : 'ipd-first-with-face-width-fallback',
    gazeMethod: 'eye-landmarks-relative-to-face-bounds',
    vergenceMethod: 'ipd-change-with-face-width-fallback'
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Vision Scan Results</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1F2937;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      margin-bottom: 24px;
      border-bottom: 3px solid #4F46E5;
      padding-bottom: 16px;
    }
    
    .header h1 {
      font-size: 24pt;
      color: #4F46E5;
      margin-bottom: 8px;
    }
    
    .header .subtitle {
      font-size: 10pt;
      color: #6B7280;
    }
    
    .participant-info {
      background: #EEF2FF;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
    }
    
    .participant-info strong {
      color: #4F46E5;
    }
    
    .status-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 10pt;
      margin: 16px 0;
    }
    
    .status-refer {
      background: #FEF2F2;
      color: #DC2626;
      border: 2px solid #DC2626;
    }
    
    .status-pass {
      background: #F0FDF4;
      color: #059669;
      border: 2px solid #059669;
    }
    
    .section {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 14pt;
      font-weight: 700;
      color: #1F2937;
      margin-bottom: 12px;
      padding-bottom: 4px;
      border-bottom: 2px solid #E5E7EB;
    }
    
    .summary-box {
      background: #F9FAFB;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #4F46E5;
      margin-bottom: 16px;
    }
    
    .summary-text {
      font-size: 11pt;
      line-height: 1.6;
      margin-bottom: 12px;
    }
    
    .confidence-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
      padding: 8px 12px;
      border-radius: 6px;
    }
    
    .confidence-label {
      font-weight: 600;
      color: #6B7280;
    }
    
    .confidence-value {
      font-size: 12pt;
      font-weight: 700;
      color: #4F46E5;
    }
    
    .module-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .module-card {
      background: white;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #E5E7EB;
    }
    
    .module-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    
    .module-name {
      font-weight: 600;
      font-size: 10pt;
      color: #1F2937;
    }
    
    .module-status {
      font-weight: 600;
      font-size: 9pt;
    }
    
    .module-note {
      font-size: 9pt;
      color: #6B7280;
      line-height: 1.4;
    }
    
    .disclaimer-box {
      background: #FEF2F2;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #DC2626;
      margin: 20px 0;
      page-break-inside: avoid;
    }
    
    .disclaimer-title {
      font-weight: 700;
      color: #DC2626;
      margin-bottom: 8px;
      font-size: 11pt;
    }
    
    .disclaimer-text {
      font-size: 10pt;
      color: #7F1D1D;
      line-height: 1.6;
    }
    
    .methodology-box {
      background: #F3F4F6;
      padding: 12px;
      border-radius: 8px;
      margin-top: 12px;
      page-break-inside: avoid;
    }
    
    .methodology-title {
      font-weight: 600;
      font-size: 10pt;
      color: #4B5563;
      margin-bottom: 8px;
    }
    
    .methodology-item {
      font-size: 9pt;
      color: #6B7280;
      margin-left: 12px;
      line-height: 1.5;
    }
    
    .footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 2px solid #E5E7EB;
      text-align: center;
      font-size: 9pt;
      color: #9CA3AF;
    }
    
    @media print {
      body {
        padding: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>VISION SCAN SCREENING RESULTS</h1>
    <div class="subtitle">Ocular Function Screening Report</div>
  </div>

  ${participantName ? `
  <div class="participant-info">
    <strong>Participant:</strong> ${participantName}<br>
    <strong>Test Date:</strong> ${testDate}
  </div>
  ` : `
  <div class="participant-info">
    <strong>Test Date:</strong> ${testDate}
  </div>
  `}

  <div style="text-align: center;">
    <div class="status-badge ${result.recommendsProfessionalExam ? 'status-refer' : 'status-pass'}">
      ${result.recommendsProfessionalExam ? '⚠️ PROFESSIONAL EXAMINATION RECOMMENDED' : '✓ NO SIGNIFICANT ISSUES DETECTED'}
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Screening Summary</h2>
    <div class="summary-box">
      <div class="summary-text">${result.screeningSummary}</div>
      <div class="confidence-row">
        <span class="confidence-label">Data Quality:</span>
        <span class="confidence-value">${(result.qualityAssessment.overallConfidence * 100).toFixed(0)}%</span>
      </div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Module Results</h2>
    
    <div class="module-grid">
      <div class="module-card">
        <div class="module-header">
          <span class="module-name">Device Qualification</span>
          <span class="module-status" style="color: #3B82F6;">${result.deviceQualification.overallQuality}</span>
        </div>
        <div class="module-note">
          Lighting: ${result.deviceQualification.lightingScore}/100,
          Distance: ${result.deviceQualification.distanceScore}/100,
          Stability: ${result.deviceQualification.stabilityScore}/100
        </div>
      </div>

      <div class="module-card">
        <div class="module-header">
          <span class="module-name">Eye Calibration</span>
          <span class="module-status" style="color: ${result.calibration.isValid ? '#10B981' : '#F59E0B'};">
            ${result.calibration.isValid ? 'Valid' : 'Below Threshold'}
          </span>
        </div>
        <div class="module-note">
          Average error ${result.calibration.averageError.toFixed(1)}px,
          max error ${result.calibration.maxError.toFixed(1)}px
          ${!result.calibration.usedSensorData ? ' (face-based estimate)' : ''}
        </div>
      </div>

      <div class="module-card">
        <div class="module-header">
          <span class="module-name">Resting Alignment</span>
          <span class="module-status" style="color: ${result.alignment.alignmentIndex >= 70 ? '#10B981' : '#F59E0B'};">
            Index: ${result.alignment.alignmentIndex.toFixed(0)}
          </span>
        </div>
        <div class="module-note">${result.alignment.screeningNote}</div>
      </div>

      <div class="module-card">
        <div class="module-header">
          <span class="module-name">Ocular Motility</span>
          <span class="module-status" style="color: ${result.motility.excessiveHeadMotion ? '#F59E0B' : '#10B981'};">
            ${result.motility.excessiveHeadMotion ? 'Limited' : 'Normal'}
          </span>
        </div>
        <div class="module-note">${result.motility.screeningNote}</div>
      </div>

      <div class="module-card">
        <div class="module-header">
          <span class="module-name">Convergence</span>
          <span class="module-status" style="color: ${result.convergence.nearPoint ? '#10B981' : '#F59E0B'};">
            ${result.convergence.nearPoint ? `${result.convergence.nearPoint.toFixed(0)}mm` : 'Inconclusive'}
          </span>
        </div>
        <div class="module-note">${result.convergence.screeningNote}</div>
      </div>

      <div class="module-card">
        <div class="module-header">
          <span class="module-name">Measurement Mode</span>
          <span class="module-status" style="color: ${capabilityMode === 'Full' ? '#10B981' : '#F59E0B'};">
            ${capabilityMode}
          </span>
        </div>
        <div class="module-note">
          ${capabilityMode === 'Full' 
            ? 'Sensor-based measurements for highest accuracy' 
            : 'Camera-based estimates (no depth sensor)'}
        </div>
      </div>
    </div>
  </div>

  ${includeMethodology ? `
  <div class="section">
    <h2 class="section-title">Technical Methodology</h2>
    <div class="methodology-box">
      <div class="methodology-title">Measurement Methods</div>
      <div class="methodology-item">• Camera: Live front-facing camera feed</div>
      <div class="methodology-item">• Face Detection: expo-face-detector (Google ML Vision)</div>
      <div class="methodology-item">• Distance: ${distanceMethod}</div>
      <div class="methodology-item">• Gaze Estimation: ${methodology.gazeMethod || 'Eye landmarks relative to face bounds'}</div>
      <div class="methodology-item">• Vergence: ${methodology.vergenceMethod || 'IPD change (preferred) / face-width fallback'}</div>
      <div class="methodology-item">• Temporal Smoothing: EMA + median filter + flicker rejection</div>
      <div class="methodology-item">• Quality Gating: Per-module confidence with selective repeat</div>
    </div>
  </div>
  ` : ''}

  <div class="disclaimer-box">
    <div class="disclaimer-title">⚠️ Important Medical Disclaimer</div>
    <div class="disclaimer-text">
      <strong>This is a screening tool, not a diagnostic test.</strong><br><br>
      
      Vision Scan does NOT:<br>
      • Diagnose eye diseases or medical conditions<br>
      • Provide spectacle prescriptions (glasses or contact lenses)<br>
      • Replace comprehensive eye examinations by licensed professionals<br><br>
      
      Results flag potential issues that may warrant professional examination by a licensed optometrist or ophthalmologist. 
      Always consult a qualified eye care professional for clinical diagnosis, treatment, and prescription eyewear.
    </div>
  </div>

  <div class="footer">
    Generated by Spect-IT Vision Scan<br>
    ${testDate}
  </div>
</body>
</html>
  `.trim()
}

/**
 * Generate and export Vision Scan PDF
 */
export async function generateVisionScanPDF(
  result: VisionScanResult,
  options: PDFGenerationOptions = {}
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if sharing is available
    const isSharingAvailable = await Sharing.isAvailableAsync()
    
    if (!isSharingAvailable) {
      return {
        success: false,
        error: 'PDF sharing is not available on this device'
      }
    }

    // Generate HTML content
    const html = generatePDFHTML(result, options)
    
    // Create PDF
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false
    })

    // Share the PDF
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Vision Scan Results',
      UTI: 'com.adobe.pdf'
    })

    return { success: true }
  } catch (error) {
    console.error('Error generating PDF:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate PDF'
    }
  }
}

/**
 * Generate PDF for printing (without automatic sharing)
 */
export async function printVisionScanPDF(
  result: VisionScanResult,
  options: PDFGenerationOptions = {}
): Promise<{ success: boolean; error?: string }> {
  try {
    const html = generatePDFHTML(result, options)
    
    await Print.printAsync({
      html
    })

    return { success: true }
  } catch (error) {
    console.error('Error printing PDF:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to print PDF'
    }
  }
}
