// Spect-IT Edge Function: send-email
// Deploy: supabase functions deploy send-email
// Secrets: RESEND_API_KEY, EMAIL_FROM (e.g. Spect-IT <noreply@spect-it.com>)

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
    const { to, subject, text, html } = await req.json()
    if (!to || !subject) {
      throw new Error("Missing required fields: to, subject")
    }

    const body = html || text || ""
    const resendKey = Deno.env.get("RESEND_API_KEY")
    const from = Deno.env.get("EMAIL_FROM") || "Spect-IT <onboarding@resend.dev>"

    if (resendKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: Array.isArray(to) ? to : [to],
          subject,
          html: html || `<pre style="font-family:sans-serif;white-space:pre-wrap">${escapeHtml(text || "")}</pre>`,
          text: text || stripHtml(html || ""),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Resend API error")
      return json({ success: true, provider: "resend", id: data.id })
    }

    // Dev / unconfigured: acknowledge without sending (client falls back to mailto)
    console.log("[send-email] not configured — would send to:", to, subject)
    return json({ success: false, configured: false, message: "Email service not configured. Set RESEND_API_KEY." })
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

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function stripHtml(s: string) {
  return s.replace(/<[^>]+>/g, "")
}
