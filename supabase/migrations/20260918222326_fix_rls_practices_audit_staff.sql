-- Spect-IT: enable RLS + least-privilege staff-scoped policies for practices,
-- practice_staff, and audit_log. Mutations stay service-role (edge functions).
-- Also harden trigger function search_path.

ALTER TABLE public.practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- practice_staff already has RLS enabled; add SELECT for own memberships only.
DROP POLICY IF EXISTS practice_staff_select_own ON public.practice_staff;
CREATE POLICY practice_staff_select_own
  ON public.practice_staff
  FOR SELECT
  TO authenticated
  USING (
    auth_user_id = auth.uid()
    OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

-- practices: members may read practices they belong to (non-disabled).
DROP POLICY IF EXISTS practices_select_member ON public.practices;
CREATE POLICY practices_select_member
  ON public.practices
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.practice_staff ps
      WHERE ps.practice_place_id = practices.practice_place_id
        AND ps.status <> 'disabled'
        AND (
          ps.auth_user_id = auth.uid()
          OR lower(ps.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        )
    )
  );

-- audit_log: practice admins may read their practice audit trail.
-- No INSERT/UPDATE/DELETE for anon/authenticated (service role only).
DROP POLICY IF EXISTS audit_log_select_practice_admin ON public.audit_log;
CREATE POLICY audit_log_select_practice_admin
  ON public.audit_log
  FOR SELECT
  TO authenticated
  USING (
    practice_place_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.practice_staff ps
      WHERE ps.practice_place_id = audit_log.practice_place_id
        AND ps.role = 'admin'
        AND ps.status <> 'disabled'
        AND (
          ps.auth_user_id = auth.uid()
          OR lower(ps.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        )
    )
  );

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
