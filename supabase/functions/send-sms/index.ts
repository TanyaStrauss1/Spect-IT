// Spect-IT Edge Function: send-sms (Twilio)
// Deploy: supabase functions deploy send-sms
// Secrets: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { to, body } = await req.json()
    if (!to || !body) throw new Error("Missing required fields: to, body")

    const sid = Deno.env.get("TWILIO_ACCOUNT_SID")
    const token = Deno.env.get("TWILIO_AUTH_TOKEN")
    const from = Deno.env.get("TWILIO_FROM_NUMBER")

    if (!sid || !token || !from) {
      console.log("[send-sms] not configured — would SMS:", to)
      return json({ success: false, configured: false, message: "SMS not configured. Set TWILIO_* secrets." })
    }

    const auth = btoa(`${sid}:${token}`)
    const params = new URLSearchParams({ To: to, From: from, Body: body })
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || "Twilio API error")
    return json({ success: true, provider: "twilio", sid: data.sid })
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
