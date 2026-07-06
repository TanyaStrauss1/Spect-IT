// Spect-IT Edge Function: provider-admin
// Admin-only operations: create practices, manage staff, and audit actions.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import {
  createAdminClient,
  getAuthUser,
  getPracticeName,
  getProviderUrl,
  normalizeEmail,
  sendProviderMagicLink,
  sendProviderSms,
} from "../_shared/provider-helpers.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-spectit-admin-secret",
}

type Actor = {
  user_id: string | null
  email: string | null
  mode: "spectit_admin" | "practice_admin"
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { action } = body || {}
    const supabase = createAdminClient()

    if (!action) return json({ error: "action is required" }, 400)

    if (action === "create_practice") {
      const actor = await requireSpectitAdmin(req, supabase)
      const practicePlaceId = String(body.practicePlaceId || "").trim()
      const name = String(body.name || "").trim()
      const adminEmail = normalizeEmail(body.adminEmail)
      const adminPhone = String(body.adminPhone || "").trim() || null

      if (!practicePlaceId) throw new Error("practicePlaceId is required")
      if (!name) throw new Error("name is required")
      if (!adminEmail) throw new Error("adminEmail is required")

      const now = new Date().toISOString()

      const { error: practiceError } = await supabase.from("practices").upsert(
        {
          practice_place_id: practicePlaceId,
          name,
          created_by_email: actor.email || "spectit-admin",
          created_at: now,
        },
        { onConflict: "practice_place_id" },
      )
      if (practiceError) throw practiceError

      const { error: staffError } = await supabase.from("practice_staff").upsert(
        {
          practice_place_id: practicePlaceId,
          email: adminEmail,
          phone: adminPhone,
          role: "admin",
          status: "invited",
          invited_at: now,
          invited_by_email: actor.email || "spectit-admin",
          updated_at: now,
          disabled_at: null,
          disabled_by_email: null,
        },
        { onConflict: "practice_place_id,email" },
      )
      if (staffError) throw staffError

      await sendProviderMagicLink(adminEmail)

      const sms = await sendProviderSms(
        adminPhone,
        `You are the admin for the Spect-IT practice console (${name}). Check your email for your secure sign-in link, then open ${getProviderUrl()}.`,
      )

      await writeAudit(supabase, {
        practice_place_id: practicePlaceId,
        actor,
        action: "create_practice",
        metadata: { name, adminEmail, smsSent: sms.sent, smsConfigured: sms.configured },
      })

      return json({
        success: true,
        practicePlaceId,
        name,
        invited: adminEmail,
        smsSent: sms.sent,
        smsConfigured: sms.configured,
      })
    }

    // Everything below requires a practice admin session.
    const actor = await requirePracticeAdmin(req, supabase, body.practicePlaceId)
    const practicePlaceId = String(body.practicePlaceId || "").trim()

    if (action === "resend_invite") {
      const email = normalizeEmail(body.email)
      if (!practicePlaceId) throw new Error("practicePlaceId is required")
      if (!email) throw new Error("email is required")

      const { data: row, error } = await supabase
        .from("practice_staff")
        .select("email,phone,full_name,role,status")
        .eq("practice_place_id", practicePlaceId)
        .eq("email", email)
        .maybeSingle()
      if (error) throw error
      if (!row) throw new Error("Staff member not found")
      if (row.status === "disabled") throw new Error("Staff member is disabled")

      await sendProviderMagicLink(email)
      const practiceName = await getPracticeName(supabase, practicePlaceId)
      const sms = await sendProviderSms(
        row.phone,
        `Your Spect-IT sign-in link has been re-sent for ${practiceName}. Open ${getProviderUrl()} after checking your inbox.`,
      )

      await writeAudit(supabase, {
        practice_place_id: practicePlaceId,
        actor,
        action: "resend_invite",
        metadata: { email, smsSent: sms.sent, smsConfigured: sms.configured },
      })

      return json({ success: true, email, smsSent: sms.sent, smsConfigured: sms.configured })
    }

    if (action === "set_staff_role") {
      const email = normalizeEmail(body.email)
      const nextRole = body.role === "admin" ? "admin" : "staff"
      if (!practicePlaceId) throw new Error("practicePlaceId is required")
      if (!email) throw new Error("email is required")

      const { error } = await supabase
        .from("practice_staff")
        .update({ role: nextRole, updated_at: new Date().toISOString() })
        .eq("practice_place_id", practicePlaceId)
        .eq("email", email)
        .neq("status", "disabled")
      if (error) throw error

      await writeAudit(supabase, {
        practice_place_id: practicePlaceId,
        actor,
        action: "set_staff_role",
        metadata: { email, role: nextRole },
      })

      return json({ success: true, email, role: nextRole })
    }

    if (action === "disable_staff") {
      const email = normalizeEmail(body.email)
      if (!practicePlaceId) throw new Error("practicePlaceId is required")
      if (!email) throw new Error("email is required")

      const now = new Date().toISOString()
      const { error } = await supabase
        .from("practice_staff")
        .update({
          status: "disabled",
          disabled_at: now,
          disabled_by_email: actor.email || null,
          updated_at: now,
        })
        .eq("practice_place_id", practicePlaceId)
        .eq("email", email)
      if (error) throw error

      await writeAudit(supabase, {
        practice_place_id: practicePlaceId,
        actor,
        action: "disable_staff",
        metadata: { email },
      })

      return json({ success: true, email })
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

async function requireSpectitAdmin(
  req: Request,
  supabase: ReturnType<typeof createAdminClient>,
): Promise<Actor> {
  const configuredSecret = String(Deno.env.get("SPECTIT_ADMIN_SECRET") || "").trim()
  const presentedSecret =
    req.headers.get("x-spectit-admin-secret") || req.headers.get("X-Spectit-Admin-Secret")
  if (configuredSecret && presentedSecret && presentedSecret === configuredSecret) {
    return { user_id: null, email: "spectit-admin-secret", mode: "spectit_admin" }
  }

  const allowlist = new Set(
    String(Deno.env.get("SPECTIT_ADMIN_EMAILS") || "")
      .split(",")
      .map((s) => normalizeEmail(s))
      .filter(Boolean),
  )
  const user = await getAuthUser(req, supabase)
  const email = user?.email ? normalizeEmail(user.email) : null
  if (email && allowlist.has(email)) {
    return { user_id: user!.id, email, mode: "spectit_admin" }
  }
  throw new Error("Spect-IT admin authorization required")
}

async function requirePracticeAdmin(
  req: Request,
  supabase: ReturnType<typeof createAdminClient>,
  practicePlaceId: string | null | undefined,
): Promise<Actor> {
  const practiceId = String(practicePlaceId || "").trim()
  if (!practiceId) throw new Error("practicePlaceId is required")

  const user = await getAuthUser(req, supabase)
  if (!user?.email) throw new Error("Unauthorized")
  const email = normalizeEmail(user.email)

  const { data, error } = await supabase
    .from("practice_staff")
    .select("role,status")
    .eq("practice_place_id", practiceId)
    .eq("email", email)
    .maybeSingle()
  if (error) throw error
  if (!data || data.status === "disabled") throw new Error("Unauthorized")
  if (data.role !== "admin") throw new Error("Only practice admins can manage staff")

  return { user_id: user.id, email, mode: "practice_admin" }
}

async function writeAudit(
  supabase: ReturnType<typeof createAdminClient>,
  args: {
    practice_place_id: string | null
    actor: Actor
    action: string
    metadata: Record<string, unknown>
  },
) {
  const { practice_place_id, actor, action, metadata } = args
  await supabase.from("audit_log").insert({
    practice_place_id: practice_place_id || null,
    actor_user_id: actor.user_id,
    actor_email: actor.email,
    action,
    metadata,
  })
}

