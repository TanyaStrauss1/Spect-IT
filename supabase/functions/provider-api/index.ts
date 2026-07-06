// Spect-IT Edge Function: provider-api
// Practice console backend for appointments, memberships, and staff invites.
// Supports both legacy shared-PIN sessions and real Supabase staff sessions.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import {
  activateMemberships,
  createAdminClient,
  getAuthUser,
  getPracticeName,
  getProviderUrl,
  listPracticeSummaries,
  listMemberships,
  normalizeEmail,
  sendProviderMagicLink,
  sendProviderSms,
} from "../_shared/provider-helpers.ts"
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
    const body = await req.json()
    const { token, action, practicePlaceId, apptId, status, email, fullName, phone, role } = body
    const supabase = createAdminClient()
    const actor = await getActor(req, token, supabase)
    if (!actor) {
      return json({ error: "Unauthorized" }, 401)
    }

    if (action === "session") {
      const availablePractices = await listAccessiblePractices(supabase, actor)
      const selectedPracticeId = resolveSelectedPractice(actor, practicePlaceId, availablePractices)
      const selectedRole = selectedPracticeId ? getRoleForPractice(actor, selectedPracticeId) : null
      const legacyPinDisabled = actor.mode === "legacy" && selectedPracticeId
        ? await hasActiveAdmin(supabase, selectedPracticeId)
        : false
      const staff = selectedPracticeId && canInvite(actor, selectedPracticeId)
        ? await listStaffForPractice(supabase, selectedPracticeId)
        : []

      return json({
        mode: actor.mode,
        email: actor.email,
        memberships: actor.memberships,
        availablePractices,
        selectedPracticeId,
        selectedRole,
        canInvite: selectedPracticeId
          ? (actor.mode === "legacy" ? !legacyPinDisabled : canInvite(actor, selectedPracticeId))
          : actor.mode === "legacy",
        legacyPinDisabled,
        staff,
      })
    }

    if (action === "list") {
      let q = supabase.from("appointments").select("*").order("appt_date", { ascending: true })
      const selectedPracticeId = resolveSelectedPractice(actor, practicePlaceId)

      if (actor.mode === "legacy") {
        const filter = selectedPracticeId || (actor.practiceId !== "*" ? actor.practiceId : null)
        if (filter) q = q.eq("practice_place_id", filter)
      } else if (selectedPracticeId) {
        ensurePracticeAccess(actor, selectedPracticeId)
        q = q.eq("practice_place_id", selectedPracticeId)
      } else {
        const ids = actor.memberships.map((m) => m.practice_place_id).filter(Boolean)
        if (!ids.length) return json({ appointments: [] })
        q = q.in("practice_place_id", ids)
      }

      const { data, error } = await q
      if (error) throw error
      return json({ appointments: data || [] })
    }

    if (action === "setStatus") {
      if (!apptId || !status) throw new Error("apptId and status are required")
      if (!ALLOWED_STATUS.has(status)) throw new Error("Invalid status")

      if (actor.mode !== "legacy") {
        const { data: appt, error: apptError } = await supabase
          .from("appointments")
          .select("practice_place_id")
          .eq("appt_id", apptId)
          .maybeSingle()
        if (apptError) throw apptError
        ensurePracticeAccess(actor, appt?.practice_place_id || "")
      }

      const { error } = await supabase
        .from("appointments")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("appt_id", apptId)
      if (error) throw error
      return json({ success: true })
    }

    if (action === "invite_staff") {
      const selectedPracticeId = resolveSelectedPractice(
        actor,
        practicePlaceId,
        actor.mode === "legacy" ? await listAccessiblePractices(supabase, actor) : [],
      )
      if (!selectedPracticeId) {
        throw new Error("Select a practice before inviting staff.")
      }
      if (actor.mode === "legacy" && await hasActiveAdmin(supabase, selectedPracticeId)) {
        return json(
          { error: "Shared access code is disabled for this practice. Ask the admin to invite staff." },
          403,
        )
      }
      if (!canInvite(actor, selectedPracticeId)) {
        return json({ error: "Only practice admins can invite staff." }, 403)
      }

      const normalizedEmail = normalizeEmail(email)
      if (!normalizedEmail) throw new Error("Staff email is required")
      const nextRole = role === "admin" ? "admin" : "staff"
      const now = new Date().toISOString()
      const inviter = actor.email || "legacy-provider-access"
      const { data: existing } = await supabase
        .from("practice_staff")
        .select("status,auth_user_id,phone,full_name")
        .eq("practice_place_id", selectedPracticeId)
        .eq("email", normalizedEmail)
        .maybeSingle()

      const { error } = await supabase.from("practice_staff").upsert(
        {
          practice_place_id: selectedPracticeId,
          email: normalizedEmail,
          full_name: String(fullName || "").trim() || existing?.full_name || null,
          phone: String(phone || "").trim() || existing?.phone || null,
          auth_user_id: existing?.auth_user_id || null,
          role: nextRole,
          status: existing?.status === "active" ? "active" : "invited",
          invited_at: now,
          invited_by_email: inviter,
          updated_at: now,
        },
        { onConflict: "practice_place_id,email" },
      )
      if (error) throw error

      await sendProviderMagicLink(normalizedEmail)

      const practiceName = await getPracticeName(supabase, selectedPracticeId)
      const sms = await sendProviderSms(
        String(phone || "").trim() || null,
        `You have been invited to the Spect-IT practice console for ${practiceName}. Check your email for your secure sign-in link, then open ${getProviderUrl()}.`,
      )

      const staff = await listStaffForPractice(supabase, selectedPracticeId)
      await writeAudit(supabase, {
        practice_place_id: selectedPracticeId,
        actorEmail: actor.email || inviter,
        actorUserId: null,
        action: "invite_staff",
        metadata: { invited: normalizedEmail, role: nextRole, smsSent: sms.sent, smsConfigured: sms.configured },
      })
      return json({
        success: true,
        invited: normalizedEmail,
        smsSent: sms.sent,
        smsConfigured: sms.configured,
        staff,
      })
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

async function getActor(
  req: Request,
  token: string | null | undefined,
  supabase: ReturnType<typeof createAdminClient>,
) {
  const legacy = await verifyToken(token)
  if (legacy.valid) {
    return {
      mode: "legacy" as const,
      email: null,
      practiceId: legacy.practiceId || "*",
      memberships: [],
    }
  }

  const user = await getAuthUser(req, supabase)
  if (!user?.email) return null

  await activateMemberships(supabase, user.email, user.id)
  const memberships = await listMemberships(supabase, user.email)
  if (!memberships.length) return null

  return {
    mode: "staff" as const,
    email: normalizeEmail(user.email),
    practiceId: null,
    memberships,
  }
}

function resolveSelectedPractice(
  actor: { mode: "legacy" | "staff"; practiceId: string | null; memberships: Array<{ practice_place_id: string }> },
  requestedPracticeId: string | null | undefined,
  availablePractices: Array<{ practice_place_id: string }> = [],
) {
  const requested = String(requestedPracticeId || "").trim()
  if (requested) return requested
  if (actor.mode === "legacy") {
    if (actor.practiceId && actor.practiceId !== "*") return actor.practiceId
    if (availablePractices.length === 1) return availablePractices[0].practice_place_id
    return ""
  }
  if (availablePractices.length === 1) return availablePractices[0].practice_place_id
  if (actor.memberships.length === 1) return actor.memberships[0].practice_place_id
  return ""
}

function ensurePracticeAccess(
  actor: { mode: "legacy" | "staff"; practiceId: string | null; memberships: Array<{ practice_place_id: string }> },
  practicePlaceId: string,
) {
  if (actor.mode === "legacy") return
  if (!practicePlaceId) throw new Error("Practice is required")
  if (!actor.memberships.some((m) => m.practice_place_id === practicePlaceId)) {
    throw new Error("You do not have access to that practice.")
  }
}

function getRoleForPractice(
  actor: { mode: "legacy" | "staff"; memberships: Array<{ practice_place_id: string; role: string }> },
  practicePlaceId: string,
) {
  if (actor.mode === "legacy") return "admin"
  return actor.memberships.find((m) => m.practice_place_id === practicePlaceId)?.role || null
}

function canInvite(
  actor: { mode: "legacy" | "staff"; memberships: Array<{ practice_place_id: string; role: string }> },
  practicePlaceId: string,
) {
  if (actor.mode === "legacy") return true
  return actor.memberships.some((m) => m.practice_place_id === practicePlaceId && m.role === "admin")
}

async function listStaffForPractice(
  supabase: ReturnType<typeof createAdminClient>,
  practicePlaceId: string,
) {
  const { data, error } = await supabase
    .from("practice_staff")
    .select("practice_place_id,email,full_name,phone,role,status,invited_at,activated_at")
    .eq("practice_place_id", practicePlaceId)
    .order("role", { ascending: true })
    .order("email", { ascending: true })

  if (error) throw error
  return data || []
}

async function hasActiveAdmin(
  supabase: ReturnType<typeof createAdminClient>,
  practicePlaceId: string,
) {
  const { data, error } = await supabase
    .from("practice_staff")
    .select("email")
    .eq("practice_place_id", practicePlaceId)
    .eq("role", "admin")
    .neq("status", "disabled")
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return !!data?.email
}

async function writeAudit(
  supabase: ReturnType<typeof createAdminClient>,
  args: {
    practice_place_id: string | null
    actorEmail: string | null
    actorUserId: string | null
    action: string
    metadata: Record<string, unknown>
  },
) {
  await supabase.from("audit_log").insert({
    practice_place_id: args.practice_place_id,
    actor_email: args.actorEmail,
    actor_user_id: args.actorUserId,
    action: args.action,
    metadata: args.metadata,
  })
}

async function listAccessiblePractices(
  supabase: ReturnType<typeof createAdminClient>,
  actor: { mode: "legacy" | "staff"; practiceId: string | null; memberships: Array<{ practice_place_id: string }> },
) {
  if (actor.mode === "legacy") {
    if (actor.practiceId && actor.practiceId !== "*") {
      return await listPracticeSummaries(supabase, [actor.practiceId])
    }
    return await listPracticeSummaries(supabase)
  }

  const practiceIds = actor.memberships.map((membership) => membership.practice_place_id)
  return await listPracticeSummaries(supabase, practiceIds)
}
