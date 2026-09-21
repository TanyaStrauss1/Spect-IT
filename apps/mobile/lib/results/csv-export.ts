/**
 * CSV Export for Longitudinal Vision Data
 * Generates CSV files for baseline + trends export
 */

import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system'
import { type TestResult } from './clinical-summary'
import { convertSnellenToLogMAR } from './clinical-summary'
import { filterResultsByType, TEST_TYPE_ID } from '@spect-it/cv'

export interface CSVExportOptions {
  participantName?: string
  includeMetadata?: boolean
  includeQualityScores?: boolean
}

/**
 * Generate CSV content from test results
 */
function generateCSV(results: TestResult[], options: CSVExportOptions = {}): string {
  const { participantName, includeMetadata = true, includeQualityScores = true } = options
  
  let csv = ''
  
  // Header
  if (includeMetadata) {
    csv += `Spect-IT Wellness Screening Export\n`
    if (participantName) {
      csv += `Participant: ${participantName}\n`
    }
    csv += `Export Date: ${new Date().toISOString()}\n`
    csv += `\n`
    csv += `SCREENING ONLY - NOT A DIAGNOSIS OR PRESCRIPTION\n`
    csv += `Results should be confirmed by a licensed optometrist or ophthalmologist\n`
    csv += `\n\n`
  }
  
  // Visual Acuity Section
  const acuityResults = filterResultsByType(results, TEST_TYPE_ID.VISUAL_ACUITY)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  
  if (acuityResults.length > 0) {
    csv += `VISUAL ACUITY HISTORY\n`
    csv += `Date,Left Eye (OS) Snellen,Left Eye logMAR,Right Eye (OD) Snellen,Right Eye logMAR,Both Eyes Snellen,Both Eyes logMAR\n`
    
    acuityResults.forEach(r => {
      const date = new Date(r.created_at).toISOString()
      const leftSnellen = r.test_data?.leftEye?.finalSnellen || r.results?.leftEye?.snellen || ''
      const rightSnellen = r.test_data?.rightEye?.finalSnellen || r.results?.rightEye?.snellen || ''
      const bothSnellen = r.test_data?.finalSnellen || r.results?.snellen || ''
      
      const leftLogMAR = leftSnellen ? convertSnellenToLogMAR(leftSnellen)?.toFixed(2) || '' : ''
      const rightLogMAR = rightSnellen ? convertSnellenToLogMAR(rightSnellen)?.toFixed(2) || '' : ''
      const bothLogMAR = bothSnellen ? convertSnellenToLogMAR(bothSnellen)?.toFixed(2) || '' : ''
      
      csv += `${date},${leftSnellen},${leftLogMAR},${rightSnellen},${rightLogMAR},${bothSnellen},${bothLogMAR}\n`
    })
    csv += `\n`
  }
  
  // Contrast Sensitivity Section
  const contrastResults = filterResultsByType(results, TEST_TYPE_ID.CONTRAST_SENSITIVITY)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  
  if (contrastResults.length > 0) {
    csv += `CONTRAST SENSITIVITY HISTORY\n`
    csv += `Date,Score (%),Assessment\n`
    
    contrastResults.forEach(r => {
      const date = new Date(r.created_at).toISOString()
      const score = r.score ? (r.score * 100).toFixed(1) : ''
      const assessment = r.test_data?.assessment || ''
      
      csv += `${date},${score},${assessment}\n`
    })
    csv += `\n`
  }
  
  // Vision Scan Section
  const visionScanResults = filterResultsByType(results, TEST_TYPE_ID.VISION_SCAN)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  
  if (visionScanResults.length > 0) {
    csv += `VISION SCAN HISTORY (Ocular Function Screening)\n`
    csv += `Date,Alignment Index,Convergence Near Point (mm),Overall Confidence (%),Recommends Professional Exam,Distance Method,Capability Mode\n`
    
    visionScanResults.forEach(r => {
      const date = new Date(r.created_at).toISOString()
      const alignmentIndex = r.test_data?.alignment?.alignmentIndex?.toFixed(0) || ''
      const nearPoint = r.test_data?.convergence?.nearPoint?.toFixed(0) || ''
      const confidence = r.test_data?.qualityAssessment?.overallConfidence 
        ? (r.test_data.qualityAssessment.overallConfidence * 100).toFixed(0)
        : ''
      const recommendsExam = r.test_data?.recommendsProfessionalExam ? 'Yes' : 'No'
      const distanceMethod = r.test_data?.methodology?.distanceMethod || ''
      const capabilityMode = r.test_data?.deviceQualification?.useSensorBasedMeasurements ? 'Full (Sensor)' : 'Degraded (Camera)'
      
      csv += `${date},${alignmentIndex},${nearPoint},${confidence},${recommendsExam},${distanceMethod},${capabilityMode}\n`
    })
    csv += `\n`
    
    if (includeQualityScores) {
      csv += `VISION SCAN QUALITY METRICS\n`
      csv += `Date,Lighting Score,Distance Score,Stability Score,Calibration Valid,Calibration Avg Error (px),Calibration Max Error (px)\n`
      
      visionScanResults.forEach(r => {
        const date = new Date(r.created_at).toISOString()
        const lightingScore = r.test_data?.deviceQualification?.lightingScore || ''
        const distanceScore = r.test_data?.deviceQualification?.distanceScore || ''
        const stabilityScore = r.test_data?.deviceQualification?.stabilityScore || ''
        const calibValid = r.test_data?.calibration?.isValid ? 'Yes' : 'No'
        const avgError = r.test_data?.calibration?.averageError?.toFixed(1) || ''
        const maxError = r.test_data?.calibration?.maxError?.toFixed(1) || ''
        
        csv += `${date},${lightingScore},${distanceScore},${stabilityScore},${calibValid},${avgError},${maxError}\n`
      })
      csv += `\n`
    }
  }
  
  // Color Vision Section
  const colorResults = filterResultsByType(results, TEST_TYPE_ID.COLOR_VISION)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  
  if (colorResults.length > 0) {
    csv += `COLOR VISION HISTORY\n`
    csv += `Date,Screening Result\n`
    
    colorResults.forEach(r => {
      const date = new Date(r.created_at).toISOString()
      const result = r.test_data?.screeningResult || ''
      
      csv += `${date},${result}\n`
    })
    csv += `\n`
  }
  
  // Hearing Screening Section
  const hearingResults = results.filter(r => 
    r.test_type === 'hearing-screening' ||
    r.test_type === 'Hearing Screening'
  ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  
  if (hearingResults.length > 0) {
    csv += `HEARING SCREENING HISTORY\n`
    csv += `Date,Overall Status,Left Ear Pass Count,Right Ear Pass Count,Total Frequencies\n`
    
    hearingResults.forEach(r => {
      const date = new Date(r.created_at).toISOString()
      const status = r.test_data?.overallStatus || r.results?.overallStatus || ''
      const leftPass = r.test_data?.leftEarPassCount || r.results?.leftEarPassCount || ''
      const rightPass = r.test_data?.rightEarPassCount || r.results?.rightEarPassCount || ''
      const totalFreq = r.test_data?.totalFrequencies || r.results?.totalFrequencies || ''
      
      csv += `${date},${status},${leftPass},${rightPass},${totalFreq}\n`
    })
    csv += `\n`
    csv += `Note: Hearing screening uses relative device volumes, NOT calibrated dB HL. Screening only.\n`
    csv += `\n`
  }
  
  // Footer
  csv += `\n`
  csv += `SCREENING DISCLAIMER\n`
  csv += `These results are wellness screening assessments for informational purposes only.\n`
  csv += `NOT medical diagnoses, clinical examinations, or dispensable prescriptions.\n`
  csv += `Always consult a licensed optometrist or ophthalmologist for comprehensive eye examinations,\n`
  csv += `clinical diagnoses, treatment decisions, and prescription eyewear.\n`
  csv += `\n`
  csv += `Export generated by Spect-IT Wellness Screening\n`
  csv += `https://spect-it.com\n`
  
  return csv
}

/**
 * Export test results as CSV
 */
export async function exportToCSV(
  results: TestResult[],
  options: CSVExportOptions = {}
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if sharing is available
    const isSharingAvailable = await Sharing.isAvailableAsync()
    
    if (!isSharingAvailable) {
      return {
        success: false,
        error: 'CSV sharing is not available on this device'
      }
    }

    // Generate CSV content
    const csvContent = generateCSV(results, options)
    
    // Create temporary file
    const fileName = `spect-it-export-${new Date().toISOString().split('T')[0]}.csv`
    const fileUri = `${FileSystem.cacheDirectory}${fileName}`
    
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8
    })

    // Share the CSV file
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: 'Export Wellness Screening Data',
      UTI: 'public.comma-separated-values-text'
    })

    return { success: true }
  } catch (error) {
    console.error('Error exporting CSV:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to export CSV'
    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Generate baseline + trends summary CSV
 */
export async function exportBaselineTrendsCSV(
  results: TestResult[],
  options: CSVExportOptions = {}
): Promise<{ success: boolean; error?: string }> {
  try {
    const isSharingAvailable = await Sharing.isAvailableAsync()
    
    if (!isSharingAvailable) {
      return {
        success: false,
        error: 'CSV sharing is not available on this device'
      }
    }

    let csv = ''
    
    if (options.includeMetadata !== false) {
      csv += `Spect-IT Baseline + Trends Export\n`
      if (options.participantName) {
        csv += `Participant: ${options.participantName}\n`
      }
      csv += `Export Date: ${new Date().toISOString()}\n`
      csv += `\n`
      csv += `SCREENING ONLY - NOT A DIAGNOSIS OR PRESCRIPTION\n`
      csv += `\n\n`
    }
    
    // Baseline (first test) vs Latest (most recent test)
    csv += `BASELINE vs LATEST COMPARISON\n`
    csv += `\n`
    
    const acuityResults = filterResultsByType(results, TEST_TYPE_ID.VISUAL_ACUITY)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    
    if (acuityResults.length >= 2) {
      const baseline = acuityResults[0]
      const latest = acuityResults[acuityResults.length - 1]
      
      csv += `Visual Acuity (Distance)\n`
      csv += `Metric,Baseline (${new Date(baseline.created_at).toLocaleDateString()}),Latest (${new Date(latest.created_at).toLocaleDateString()}),Change\n`
      
      const baselineLeftSnellen = baseline.test_data?.leftEye?.finalSnellen || baseline.results?.leftEye?.snellen
      const latestLeftSnellen = latest.test_data?.leftEye?.finalSnellen || latest.results?.leftEye?.snellen
      const baselineLeftLogMAR = baselineLeftSnellen ? convertSnellenToLogMAR(baselineLeftSnellen) : null
      const latestLeftLogMAR = latestLeftSnellen ? convertSnellenToLogMAR(latestLeftSnellen) : null
      const leftChange = baselineLeftLogMAR !== null && latestLeftLogMAR !== null 
        ? (latestLeftLogMAR - baselineLeftLogMAR).toFixed(2)
        : 'N/A'
      
      csv += `Left Eye (OS),${baselineLeftSnellen || 'N/A'},${latestLeftSnellen || 'N/A'},${leftChange} logMAR\n`
      
      const baselineRightSnellen = baseline.test_data?.rightEye?.finalSnellen || baseline.results?.rightEye?.snellen
      const latestRightSnellen = latest.test_data?.rightEye?.finalSnellen || latest.results?.rightEye?.snellen
      const baselineRightLogMAR = baselineRightSnellen ? convertSnellenToLogMAR(baselineRightSnellen) : null
      const latestRightLogMAR = latestRightSnellen ? convertSnellenToLogMAR(latestRightSnellen) : null
      const rightChange = baselineRightLogMAR !== null && latestRightLogMAR !== null 
        ? (latestRightLogMAR - baselineRightLogMAR).toFixed(2)
        : 'N/A'
      
      csv += `Right Eye (OD),${baselineRightSnellen || 'N/A'},${latestRightSnellen || 'N/A'},${rightChange} logMAR\n`
      csv += `\n`
      csv += `Note: Negative change = improvement (lower logMAR = better vision)\n`
      csv += `\n`
    }
    
    const visionScanResults = filterResultsByType(results, TEST_TYPE_ID.VISION_SCAN)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    
    if (visionScanResults.length >= 2) {
      const baseline = visionScanResults[0]
      const latest = visionScanResults[visionScanResults.length - 1]
      
      csv += `Vision Scan (Ocular Function)\n`
      csv += `Metric,Baseline (${new Date(baseline.created_at).toLocaleDateString()}),Latest (${new Date(latest.created_at).toLocaleDateString()}),Change\n`
      
      const baselineAlignment = baseline.test_data?.alignment?.alignmentIndex
      const latestAlignment = latest.test_data?.alignment?.alignmentIndex
      const alignmentChange = baselineAlignment !== undefined && latestAlignment !== undefined
        ? (latestAlignment - baselineAlignment).toFixed(0)
        : 'N/A'
      
      csv += `Alignment Index,${baselineAlignment?.toFixed(0) || 'N/A'},${latestAlignment?.toFixed(0) || 'N/A'},${alignmentChange}\n`
      
      const baselineNearPoint = baseline.test_data?.convergence?.nearPoint
      const latestNearPoint = latest.test_data?.convergence?.nearPoint
      const nearPointChange = baselineNearPoint !== undefined && latestNearPoint !== undefined
        ? (latestNearPoint - baselineNearPoint).toFixed(0)
        : 'N/A'
      
      csv += `Convergence Near Point (mm),${baselineNearPoint?.toFixed(0) || 'N/A'},${latestNearPoint?.toFixed(0) || 'N/A'},${nearPointChange}\n`
      
      const baselineConfidence = baseline.test_data?.qualityAssessment?.overallConfidence
      const latestConfidence = latest.test_data?.qualityAssessment?.overallConfidence
      const confidenceChange = baselineConfidence !== undefined && latestConfidence !== undefined
        ? ((latestConfidence - baselineConfidence) * 100).toFixed(0)
        : 'N/A'
      
      csv += `Data Quality (%),${baselineConfidence !== undefined ? (baselineConfidence * 100).toFixed(0) : 'N/A'},${latestConfidence !== undefined ? (latestConfidence * 100).toFixed(0) : 'N/A'},${confidenceChange}%\n`
      csv += `\n`
    }
    
    // Full longitudinal data
    csv += `\n\n`
    csv += generateCSV(results, { ...options, includeMetadata: false })
    
    // Save and share
    const fileName = `spect-it-baseline-trends-${new Date().toISOString().split('T')[0]}.csv`
    const fileUri = `${FileSystem.cacheDirectory}${fileName}`
    
    await FileSystem.writeAsStringAsync(fileUri, csv, {
      encoding: FileSystem.EncodingType.UTF8
    })

    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: 'Export Baseline + Trends',
      UTI: 'public.comma-separated-values-text'
    })

    return { success: true }
  } catch (error) {
    console.error('Error exporting baseline trends CSV:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export baseline trends CSV'
    }
  }
}
