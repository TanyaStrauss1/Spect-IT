// Spect-IT Edge Function: provider-auth
// Handles temporary shared-PIN access plus provider magic-link requests.
// Deploy: supabase functions deploy provider-auth

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import {
  createAdminClient,
  getPracticeName,
  getProviderUrl,
  listMemberships,
  maskEmail,
  normalizeEmail,
  sendProviderMagicLink,
  sendProviderSms,
} from "../_shared/provider-helpers.ts"
import { signToken } from "../_shared/provider-token.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { action, pin, practiceId, email } = body

    if (action === "request_magic_link") {
      const normalizedEmail = normalizeEmail(email)
      if (!normalizedEmail) {
        return json({ success: false, error: "Email is required." }, 400)
      }

      const admin = createAdminClient()
      const memberships = await listMemberships(admin, normalizedEmail)
      if (!memberships.length) {
        return json(
          {
            success: false,
            error: "No provider access found for this email. Ask a practice admin to invite you first.",
          },
          404,
        )
      }

      await sendProviderMagicLink(normalizedEmail)

      const practiceName = await getPracticeName(
        admin,
        memberships[0]?.practice_place_id || "",
      )
      const sms = await sendProviderSms(
        memberships.find((m: { phone?: string }) => !!m.phone)?.phone,
        `Your Spect-IT sign-in link has been emailed for ${practiceName}. Open ${getProviderUrl()} after checking your inbox.`,
      )

      return json({
        success: true,
        email: maskEmail(normalizedEmail),
        memberships: memberships.length,
        smsSent: sms.sent,
        smsConfigured: sms.configured,
      })
    }

    const expected = Deno.env.get("SPECTIT_PROVIDER_PIN")
    if (!expected) {
      return json({ success: false, configured: false, message: "Provider PIN not configured on server." })
    }
    if (!pin || pin !== expected) {
      return json({ success: false, error: "Invalid access code" }, 401)
    }

    const token = await signToken({ practiceId: practiceId || "*", exp: Date.now() + 8 * 3600 * 1000 })
    return json({ success: true, token, expiresIn: 28800 })
  } catch (error) {
    return json({ success: false, error: error.message }, 400)
  }
})

function json(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  })
}
