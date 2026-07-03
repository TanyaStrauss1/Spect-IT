// Spect-IT Edge Function: provider-api
// Practice console: list appointments + update status (service role, token-gated).
// Requires SPECTIT_PROVIDER_PIN for token verification.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { verifyToken } from "../_shared/provider-token.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const ALLOWED_STATUS = new Set(["confirmed", "declined", "cancelled", "completed"])

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { token, action, practicePlaceId, apptId, status } = await req.json()
    const auth = await verifyToken(token)
    if (!auth.valid) {
      return json({ error: "Unauthorized", reason: auth.reason }, 401)
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    )

    if (action === "list") {
      let q = supabase.from("appointments").select("*").order("appt_date", { ascending: true })
      const filter = practicePlaceId || (auth.practiceId !== "*" ? auth.practiceId : null)
      if (filter) q = q.eq("practice_place_id", filter)
      const { data, error } = await q
      if (error) throw error
      return json({ appointments: data || [] })
    }

    if (action === "setStatus") {
      if (!apptId || !status) throw new Error("apptId and status are required")
      if (!ALLOWED_STATUS.has(status)) throw new Error("Invalid status")
      const { error } = await supabase
        .from("appointments")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("appt_id", apptId)
      if (error) throw error
      return json({ success: true })
    }

    throw new Error(`Unknown action: ${action}`)
  } catch (error) {
    return json({ error: (error as Error).message }, 400)
  }
})

function json(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  })
}
