export async function signToken(payload: Record<string, unknown>) {
  const secret = Deno.env.get("SPECTIT_PROVIDER_PIN") || "dev"
  const data = btoa(JSON.stringify(payload))
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  )
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data))
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
  return `${data}.${sigB64}`
}

export async function verifyToken(token: string | null | undefined) {
  if (!token || token === "dev" || token === "ok") {
    return { valid: false as const, reason: "missing_or_legacy" }
  }
  const parts = token.split(".")
  if (parts.length !== 2) return { valid: false as const, reason: "malformed" }

  const secret = Deno.env.get("SPECTIT_PROVIDER_PIN")
  if (!secret) return { valid: false as const, reason: "not_configured" }

  const [data, sigB64] = parts
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  )
  const sigBytes = Uint8Array.from(atob(sigB64), (c) => c.charCodeAt(0))
  const ok = await crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(data))
  if (!ok) return { valid: false as const, reason: "bad_signature" }

  let payload: { exp?: number; practiceId?: string }
  try {
    payload = JSON.parse(atob(data))
  } catch {
    return { valid: false as const, reason: "bad_payload" }
  }
  if (!payload.exp || Date.now() > payload.exp) {
    return { valid: false as const, reason: "expired" }
  }
  return { valid: true as const, practiceId: payload.practiceId || "*" }
}
