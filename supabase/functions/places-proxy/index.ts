// Spect-IT Edge Function: places-proxy
// Proxies Google Places / Geocoding API (browser REST calls fail CORS).
// Secret: GOOGLE_PLACES_API_KEY

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const BASE = "https://maps.googleapis.com/maps/api"

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY")
    if (!apiKey) {
      return json({ status: "ERROR", error: "Google Places API key not configured on server." }, 503)
    }

    const body = await req.json()
    const { action } = body

    let url: string
    switch (action) {
      case "geocode": {
        const address = String(body.address || "").trim()
        if (!address) throw new Error("address is required")
        const params = new URLSearchParams({ address, key: apiKey })
        if (body.region) params.set("region", String(body.region))
        url = `${BASE}/geocode/json?${params}`
        break
      }
      case "textsearch": {
        const query = String(body.query || "").trim()
        if (!query) throw new Error("query is required")
        url = `${BASE}/place/textsearch/json?${new URLSearchParams({ query, key: apiKey })}`
        break
      }
      case "nearbysearch": {
        const lat = Number(body.lat)
        const lng = Number(body.lng)
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error("lat and lng are required")
        const radius = Math.min(Math.max(Number(body.radius) || 50000, 1), 50000)
        const params = new URLSearchParams({
          location: `${lat},${lng}`,
          radius: String(radius),
          key: apiKey,
        })
        if (body.keyword) params.set("keyword", String(body.keyword))
        url = `${BASE}/place/nearbysearch/json?${params}`
        break
      }
      case "details": {
        const placeId = String(body.placeId || body.place_id || "").trim()
        if (!placeId) throw new Error("placeId is required")
        const fields = String(body.fields || "name,formatted_address,formatted_phone_number,international_phone_number,website,opening_hours,rating,user_ratings_total,reviews,geometry")
        url = `${BASE}/place/details/json?${new URLSearchParams({ place_id: placeId, fields, key: apiKey })}`
        break
      }
      default:
        throw new Error(`Unknown action: ${action}`)
    }

    const res = await fetch(url)
    const data = await res.json()
    return json(data)
  } catch (error) {
    return json({ status: "ERROR", error: (error as Error).message }, 400)
  }
})

function json(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  })
}
