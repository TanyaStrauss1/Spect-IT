// Spect-IT Edge Function: provider-auth
// Validates practice console PIN. Set secret: SPECTIT_PROVIDER_PIN
// Deploy: supabase functions deploy provider-auth

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const { pin, practiceId } = await req.json()
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
