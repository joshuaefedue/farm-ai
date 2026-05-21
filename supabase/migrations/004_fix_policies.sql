-- ═══════════════════════════════════════════════════════════════════════════
-- Acre Farm OS — Fix onboarding RLS policies (idempotent — safe to re-run)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Organizations: allow authenticated users to create a new org ──────────────
-- Previously there was no INSERT policy, so the very first INSERT during
-- onboarding was blocked by RLS even for a valid signed-in user.
DROP POLICY IF EXISTS "Authenticated users can create orgs" ON organizations;
CREATE POLICY "Authenticated users can create orgs"
  ON organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ── Organization members: allow self-insert (bootstrap) ───────────────────────
-- The previous INSERT policy checked that the inserting user was already an
-- owner/manager of the org — a chicken-and-egg problem when creating the very
-- first member record during onboarding.
-- New policy: you may insert a row where user_id = your own uid (self-join),
-- OR you are already an owner/manager of that org (adding someone else).
DROP POLICY IF EXISTS "Owners/managers can insert members" ON organization_members;
CREATE POLICY "Owners/managers can insert members"
  ON organization_members FOR INSERT
  WITH CHECK (
    -- Anyone can add themselves (bootstrap new org, or accept an invite)
    user_id = auth.uid()
    OR
    -- Existing owners/managers can add others
    org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner','manager') AND active = TRUE
    )
  );
