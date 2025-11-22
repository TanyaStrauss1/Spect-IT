// Supabase Edge Function: Handle Referral Logic
// Manages optometrist referrals based on test results

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

    const { testResults, userId, userLocation } = await req.json()

    // Determine if referral is needed
    const referralNeeded = shouldRefer(testResults)

    if (!referralNeeded.needed) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          referral_needed: false,
          message: 'No referral needed at this time'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Find suitable optometrists
    const optometrists = await findOptometrists(
      supabaseClient,
      userLocation,
      referralNeeded.specialization
    )

    // Create referral record
    const { data: referralData, error: referralError } = await supabaseClient
      .from('referrals')
      .insert({
        user_id: userId,
        test_results_id: testResults.id,
        urgency: referralNeeded.urgency,
        reason: referralNeeded.reason,
        recommended_specialists: optometrists.map(o => o.id),
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (referralError) throw referralError

    return new Response(
      JSON.stringify({ 
        success: true,
        referral_needed: true,
        referral: referralData,
        optometrists: optometrists,
        urgency: referralNeeded.urgency,
        message: getReferralMessage(referralNeeded.urgency)
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

// Determine if referral is needed based on test results
function shouldRefer(testResults: any) {
  const referral = {
    needed: false,
    urgency: 'routine' as 'urgent' | 'routine' | 'preventive',
    reason: '',
    specialization: 'general'
  }

  // Check visual acuity
  const acuity = parseFloat(testResults.visual_acuity || 0)
  if (acuity < 0.3) {
    referral.needed = true
    referral.urgency = 'urgent'
    referral.reason = 'Severe visual impairment detected'
    referral.specialization = 'retinal_specialist'
  } else if (acuity < 0.5) {
    referral.needed = true
    referral.urgency = 'urgent'
    referral.reason = 'Significant visual impairment'
    referral.specialization = 'general'
  } else if (acuity < 0.8) {
    referral.needed = true
    referral.urgency = 'routine'
    referral.reason = 'Moderate visual impairment'
    referral.specialization = 'general'
  }

  // Check astigmatism
  if (testResults.astigmatism) {
    const astigPower = Math.abs(parseFloat(testResults.astigmatism.power) || 0)
    if (astigPower > 3.0) {
      referral.needed = true
      referral.urgency = 'routine'
      referral.reason = 'High astigmatism requiring correction'
      referral.specialization = 'contact_lens_specialist'
    }
  }

  // Check for other risk factors
  if (testResults.risk_factors && testResults.risk_factors.length > 2) {
    referral.needed = true
    referral.urgency = 'routine'
    referral.reason = 'Multiple risk factors detected'
  }

  return referral
}

// Find suitable optometrists based on location and specialization
async function findOptometrists(
  supabase: any,
  userLocation: { lat: number; lng: number },
  specialization: string
) {
  // Query optometrists from database
  let query = supabase
    .from('optometrists')
    .select('*')
    .eq('active', true)

  if (specialization !== 'general') {
    query = query.contains('specializations', [specialization])
  }

  const { data: optometrists, error } = await query

  if (error) throw error

  // Calculate distances and sort
  const optometristsWithDistance = optometrists.map((opt: any) => ({
    ...opt,
    distance: calculateDistance(
      userLocation,
      { lat: opt.latitude, lng: opt.longitude }
    )
  }))

  // Sort by distance and return top 5
  return optometristsWithDistance
    .sort((a: any, b: any) => a.distance - b.distance)
    .slice(0, 5)
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(
  loc1: { lat: number; lng: number },
  loc2: { lat: number; lng: number }
) {
  const R = 6371 // Earth's radius in km
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180
  const dLon = (loc2.lng - loc1.lng) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Get user-friendly referral message
function getReferralMessage(urgency: string) {
  const messages = {
    urgent: 'Please schedule an eye examination within 1 week. Your vision test indicates significant concerns that require professional attention.',
    routine: 'We recommend scheduling an eye examination within 2-4 weeks. Your test results suggest professional evaluation would be beneficial.',
    preventive: 'Consider scheduling a routine eye examination within 1-3 months for preventive care and optimal eye health.'
  }
  return messages[urgency as keyof typeof messages] || messages.routine
}

