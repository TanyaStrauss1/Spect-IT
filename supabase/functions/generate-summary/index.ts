// Supabase Edge Function: Generate Screening Summary
// Creates comprehensive, user-friendly test summaries

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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

    const { testId, userId } = await req.json()

    // Fetch test results
    const { data: testData, error: testError } = await supabaseClient
      .from('test_results')
      .select('*')
      .eq('id', testId)
      .eq('user_id', userId)
      .single()

    if (testError) throw testError

    // Generate summary
    const summary = generateSummary(testData)

    // Save summary
    const { data: summaryData, error: summaryError } = await supabaseClient
      .from('test_summaries')
      .insert({
        user_id: userId,
        test_id: testId,
        summary: summary,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (summaryError) throw summaryError

    return new Response(
      JSON.stringify({ success: true, summary, id: summaryData.id }),
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

function generateSummary(testData: any) {
  return {
    date: new Date(testData.created_at).toLocaleDateString(),
    tests_completed: getCompletedTests(testData),
    overall_score: calculateOverallScore(testData),
    key_insights: generateInsights(testData),
    recommendations: generateRecommendations(testData),
    printable_format: generatePrintableFormat(testData)
  }
}

function getCompletedTests(testData: any) {
  const tests = []
  if (testData.visual_acuity) tests.push('Visual Acuity')
  if (testData.color_vision) tests.push('Color Vision')
  if (testData.astigmatism) tests.push('Astigmatism')
  if (testData.contrast_sensitivity) tests.push('Contrast Sensitivity')
  if (testData.visual_field) tests.push('Visual Field')
  if (testData.prescription) tests.push('Prescription Measurement')
  return tests
}

function calculateOverallScore(testData: any) {
  let score = 0
  let count = 0

  if (testData.visual_acuity) {
    const acuity = parseFloat(testData.visual_acuity) || 0
    score += Math.min(acuity * 100, 100)
    count++
  }

  if (testData.color_vision?.deficiency_type === 'normal') {
    score += 100
    count++
  }

  if (testData.astigmatism) {
    const astig = Math.abs(parseFloat(testData.astigmatism.power) || 0)
    score += Math.max(0, 100 - (astig * 20))
    count++
  }

  return count > 0 ? Math.round(score / count) : 0
}

function generateInsights(testData: any) {
  const insights = []

  if (testData.visual_acuity) {
    const acuity = parseFloat(testData.visual_acuity)
    if (acuity >= 1.0) {
      insights.push('Excellent visual acuity - 20/20 vision')
    } else if (acuity >= 0.8) {
      insights.push('Good visual acuity - minor correction may be beneficial')
    } else {
      insights.push('Visual acuity below optimal - professional examination recommended')
    }
  }

  if (testData.astigmatism) {
    const power = Math.abs(parseFloat(testData.astigmatism.power) || 0)
    if (power > 1.0) {
      insights.push(`Astigmatism detected: ${power.toFixed(2)}D - corrective lenses recommended`)
    }
  }

  return insights
}

function generateRecommendations(testData: any) {
  const recommendations = []

  const acuity = parseFloat(testData.visual_acuity || 0)
  if (acuity < 0.8) {
    recommendations.push('Schedule comprehensive eye examination')
  }

  if (testData.astigmatism && Math.abs(parseFloat(testData.astigmatism.power) || 0) > 1.0) {
    recommendations.push('Consider prescription glasses or contact lenses')
  }

  if (recommendations.length === 0) {
    recommendations.push('Continue regular eye health monitoring')
    recommendations.push('Schedule annual comprehensive eye exam')
  }

  return recommendations
}

function generatePrintableFormat(testData: any) {
  return `
SPECT-IT VISION SCREENING REPORT
Generated: ${new Date().toLocaleString()}

TEST RESULTS:
${testData.visual_acuity ? `Visual Acuity: ${testData.visual_acuity}` : ''}
${testData.color_vision ? `Color Vision: ${testData.color_vision.deficiency_type || 'Normal'}` : ''}
${testData.astigmatism ? `Astigmatism: ${testData.astigmatism.power}D @ ${testData.astigmatism.axis}°` : ''}

RECOMMENDATIONS:
${generateRecommendations(testData).map(r => `- ${r}`).join('\n')}

DISCLAIMER: This is a screening tool and not a substitute for professional eye examination.
  `.trim()
}

