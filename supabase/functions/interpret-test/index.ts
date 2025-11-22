// Supabase Edge Function: Interpret Test Results
// Analyzes test outputs and generates screening summaries

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { testResults, userId } = await req.json()

    // Interpret test results
    const interpretation = interpretTestResults(testResults)
    
    // Generate screening summary
    const summary = generateScreeningSummary(interpretation, testResults)
    
    // Determine referral necessity
    const referral = determineReferral(interpretation)

    // Save interpretation to database
    const { data, error } = await supabaseClient
      .from('test_interpretations')
      .insert({
        user_id: userId,
        test_results: testResults,
        interpretation: interpretation,
        summary: summary,
        referral_needed: referral.needed,
        referral_reason: referral.reason,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ 
        success: true,
        interpretation,
        summary,
        referral,
        id: data.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

// Interpret test results with medical-grade logic
function interpretTestResults(results: any) {
  const interpretation: any = {
    overall_health: 'good',
    risk_factors: [],
    recommendations: [],
    severity: 'normal'
  }

  // Visual Acuity Interpretation
  if (results.visual_acuity) {
    const acuity = parseFloat(results.visual_acuity)
    if (acuity < 0.5) {
      interpretation.risk_factors.push('Severe visual impairment detected')
      interpretation.severity = 'high'
      interpretation.recommendations.push('Immediate professional eye examination recommended')
    } else if (acuity < 0.8) {
      interpretation.risk_factors.push('Moderate visual impairment')
      interpretation.severity = 'moderate'
      interpretation.recommendations.push('Schedule eye examination within 2 weeks')
    }
  }

  // Astigmatism Interpretation
  if (results.astigmatism) {
    const astigPower = parseFloat(results.astigmatism.power || 0)
    if (astigPower > 2.0) {
      interpretation.risk_factors.push('Significant astigmatism detected')
      interpretation.recommendations.push('Consider corrective lenses')
    }
  }

  // Color Vision Interpretation
  if (results.color_vision) {
    if (results.color_vision.deficiency_type !== 'normal') {
      interpretation.risk_factors.push(`Color vision deficiency: ${results.color_vision.deficiency_type}`)
      interpretation.recommendations.push('Consult with optometrist for color vision assessment')
    }
  }

  // Determine overall health
  if (interpretation.risk_factors.length > 2) {
    interpretation.overall_health = 'needs_attention'
  } else if (interpretation.risk_factors.length > 0) {
    interpretation.overall_health = 'monitor'
  }

  return interpretation
}

// Generate comprehensive screening summary
function generateScreeningSummary(interpretation: any, results: any) {
  const summary = {
    title: 'Vision Screening Summary',
    date: new Date().toISOString(),
    overall_assessment: interpretation.overall_health,
    test_results: {
      visual_acuity: results.visual_acuity || 'Not tested',
      astigmatism: results.astigmatism ? `${results.astigmatism.power}D @ ${results.astigmatism.axis}°` : 'Not tested',
      color_vision: results.color_vision?.deficiency_type || 'Normal',
      contrast_sensitivity: results.contrast_sensitivity || 'Not tested',
      visual_field: results.visual_field || 'Not tested'
    },
    key_findings: interpretation.risk_factors,
    recommendations: interpretation.recommendations,
    next_steps: generateNextSteps(interpretation)
  }

  return summary
}

// Determine if referral is needed
function determineReferral(interpretation: any) {
  const referral = {
    needed: false,
    urgency: 'routine',
    reason: '',
    timeframe: ''
  }

  if (interpretation.severity === 'high') {
    referral.needed = true
    referral.urgency = 'urgent'
    referral.reason = 'Significant vision impairment detected'
    referral.timeframe = 'Within 1 week'
  } else if (interpretation.severity === 'moderate') {
    referral.needed = true
    referral.urgency = 'routine'
    referral.reason = 'Moderate vision concerns detected'
    referral.timeframe = 'Within 2-4 weeks'
  } else if (interpretation.risk_factors.length > 0) {
    referral.needed = true
    referral.urgency = 'routine'
    referral.reason = 'Preventive care recommended'
    referral.timeframe = 'Within 1-3 months'
  }

  return referral
}

// Generate actionable next steps
function generateNextSteps(interpretation: any) {
  const steps = []

  if (interpretation.severity === 'high') {
    steps.push('Schedule immediate eye examination')
    steps.push('Avoid activities requiring sharp vision until examined')
  } else if (interpretation.severity === 'moderate') {
    steps.push('Schedule eye examination within 2 weeks')
    steps.push('Monitor vision changes')
  } else {
    steps.push('Continue regular eye health monitoring')
    steps.push('Schedule annual comprehensive eye exam')
  }

  if (interpretation.risk_factors.some((r: string) => r.includes('astigmatism'))) {
    steps.push('Consider corrective lenses or glasses')
  }

  return steps
}

