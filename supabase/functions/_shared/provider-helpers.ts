import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const providerUrl =
  Deno.env.get("SPECTIT_PROVIDER_URL") || "https://www.spect-it.com/provider"

export function normalizeEmail(email: string) {
  return String(email || "").trim().toLowerCase()
}

export function createAdminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  )
}

export function createOtpClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  )
}

export async function getAuthUser(req: Request, admin = createAdminClient()) {
  const authHeader = req.headers.get("Authorization") || req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return null

  const token = authHeader.slice("Bearer ".length).trim()
  if (!token) return null

  try {
    const { data, error } = await admin.auth.getUser(token)
    if (error || !data.user?.email) return null
    return data.user
  } catch {
    return null
  }
}

export async function listMemberships(admin: ReturnType<typeof createAdminClient>, email: string) {
  const normalized = normalizeEmail(email)
  const { data, error } = await admin
    .from("practice_staff")
    .select("*")
    .eq("email", normalized)
    .neq("status", "disabled")
    .order("practice_place_id", { ascending: true })

  if (error) throw error
  return data || []
}

export async function activateMemberships(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
  authUserId: string,
) {
  const normalized = normalizeEmail(email)
  const now = new Date().toISOString()
  const { error } = await admin
    .from("practice_staff")
    .update({
      auth_user_id: authUserId,
      status: "active",
      activated_at: now,
      updated_at: now,
    })
    .eq("email", normalized)
    .neq("status", "disabled")

  if (error) throw error
}

export async function sendProviderMagicLink(email: string) {
  const client = createOtpClient()
  const normalized = normalizeEmail(email)
  const { error } = await client.auth.signInWithOtp({
    email: normalized,
    options: {
      emailRedirectTo: providerUrl,
      shouldCreateUser: true,
    },
  })
  if (error) throw error
}

export async function sendProviderSms(to: string | null | undefined, body: string) {
  if (!to) {
    return { attempted: false, configured: false, sent: false }
  }

  const sid = Deno.env.get("TWILIO_ACCOUNT_SID")
  const token = Deno.env.get("TWILIO_AUTH_TOKEN")
  const from = Deno.env.get("TWILIO_FROM_NUMBER")

  if (!sid || !token || !from) {
    return { attempted: true, configured: false, sent: false }
  }

  const auth = btoa(`${sid}:${token}`)
  const params = new URLSearchParams({ To: to, From: from, Body: body })
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    },
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || "Twilio API error")
  return { attempted: true, configured: true, sent: true, sid: data.sid }
}

export async function getPracticeName(
  admin: ReturnType<typeof createAdminClient>,
  practicePlaceId: string,
) {
  if (!practicePlaceId) return "your practice"

  const { data } = await admin
    .from("appointments")
    .select("practice_name")
    .eq("practice_place_id", practicePlaceId)
    .limit(1)
    .maybeSingle()

  return data?.practice_name || "your practice"
}

export function getProviderUrl() {
  return providerUrl
}

export function maskEmail(email: string) {
  const [name, domain] = normalizeEmail(email).split("@")
  if (!domain) return email
  if (name.length <= 2) return `${name[0] || "*"}*@${domain}`
  return `${name.slice(0, 2)}***@${domain}`
}
