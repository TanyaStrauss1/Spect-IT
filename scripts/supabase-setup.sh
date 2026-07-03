#!/usr/bin/env bash
# Spect-IT — one-shot Supabase setup (run after: supabase login)
set -euo pipefail
cd "$(dirname "$0")/.."

PROJECT_REF="isebsxoofvbypjwbuymw"

echo "→ Linking project ${PROJECT_REF}..."
supabase link --project-ref "$PROJECT_REF"

echo "→ Deploying edge functions..."
supabase functions deploy send-email
supabase functions deploy send-sms
supabase functions deploy provider-auth

echo ""
echo "→ Secrets (you will be prompted if not in env):"
if [ -z "${SPECTIT_PROVIDER_PIN:-}" ]; then
  read -rsp "Practice console PIN (SPECTIT_PROVIDER_PIN): " SPECTIT_PROVIDER_PIN
  echo
fi
supabase secrets set "SPECTIT_PROVIDER_PIN=${SPECTIT_PROVIDER_PIN}"

if [ -n "${RESEND_API_KEY:-}" ]; then
  supabase secrets set "RESEND_API_KEY=${RESEND_API_KEY}"
  supabase secrets set "EMAIL_FROM=${EMAIL_FROM:-Spect-IT <onboarding@resend.dev>}"
  echo "   Resend email configured."
else
  echo "   Skip Resend (set RESEND_API_KEY env var to enable email)."
fi

if [ -n "${TWILIO_ACCOUNT_SID:-}" ]; then
  supabase secrets set "TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}"
  supabase secrets set "TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}"
  supabase secrets set "TWILIO_FROM_NUMBER=${TWILIO_FROM_NUMBER}"
  echo "   Twilio SMS configured."
fi

echo ""
echo "✓ CLI setup done."
echo ""
echo "Still required in Supabase Dashboard → SQL Editor:"
echo "  1. Run website/CREATE_APPOINTMENTS_TABLE.sql"
echo "  2. Run website/CREATE_APPOINTMENTS_RLS_V2.sql (optional)"
echo ""
echo "SQL Editor: https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"
