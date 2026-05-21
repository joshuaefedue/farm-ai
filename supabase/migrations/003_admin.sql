-- ═══════════════════════════════════════════════════════════════════════════
-- Acre Farm OS — Admin schema additions
-- Adds: is_admin flag on profiles, suspended on organizations,
--       admin-bypass RLS policies
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Add is_admin to profiles ─────────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- ── Add suspended + plan_expires_at to organizations ─────────────────────────
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS suspended      BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS suspended_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspended_note TEXT,
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;

-- ── Helper: is current user a platform admin? ─────────────────────────────────
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid()),
    FALSE
  )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ── Admin RLS policies — profiles ────────────────────────────────────────────
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (is_platform_admin());

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (is_platform_admin());

-- ── Admin RLS policies — organizations ───────────────────────────────────────
CREATE POLICY "Admins can read all orgs"
  ON organizations FOR SELECT
  USING (is_platform_admin());

CREATE POLICY "Admins can update all orgs"
  ON organizations FOR UPDATE
  USING (is_platform_admin());

CREATE POLICY "Admins can delete orgs"
  ON organizations FOR DELETE
  USING (is_platform_admin());

-- ── Admin RLS policies — all data tables ─────────────────────────────────────
CREATE POLICY "Admins can read all members"
  ON organization_members FOR SELECT USING (is_platform_admin());

CREATE POLICY "Admins can read all batches"
  ON batches FOR SELECT USING (is_platform_admin());

CREATE POLICY "Admins can read all orders"
  ON orders FOR SELECT USING (is_platform_admin());

CREATE POLICY "Admins can read all alerts"
  ON alerts FOR SELECT USING (is_platform_admin());

CREATE POLICY "Admins can read all vaccinations"
  ON vaccinations FOR SELECT USING (is_platform_admin());

CREATE POLICY "Admins can read all houses"
  ON houses FOR SELECT USING (is_platform_admin());

CREATE POLICY "Admins can read all inventory"
  ON inventory_items FOR SELECT USING (is_platform_admin());

-- ── Admin stats function ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION admin_stats()
RETURNS JSON AS $$
DECLARE
  v_total_orgs     INT;
  v_active_orgs    INT;
  v_suspended_orgs INT;
  v_total_birds    BIGINT;
  v_monthly_rev    NUMERIC;
  v_new_orgs_7d    INT;
BEGIN
  IF NOT is_platform_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT COUNT(*) INTO v_total_orgs     FROM organizations;
  SELECT COUNT(*) INTO v_active_orgs    FROM organizations WHERE NOT suspended;
  SELECT COUNT(*) INTO v_suspended_orgs FROM organizations WHERE suspended;
  SELECT COALESCE(SUM(current_count),0) INTO v_total_birds
    FROM batches WHERE status <> 'sold';
  SELECT COALESCE(SUM(subtotal),0) INTO v_monthly_rev
    FROM orders
    WHERE order_date >= date_trunc('month', CURRENT_DATE);
  SELECT COUNT(*) INTO v_new_orgs_7d
    FROM organizations
    WHERE created_at >= NOW() - INTERVAL '7 days';

  RETURN json_build_object(
    'total_orgs',     v_total_orgs,
    'active_orgs',    v_active_orgs,
    'suspended_orgs', v_suspended_orgs,
    'total_birds',    v_total_birds,
    'monthly_rev',    v_monthly_rev,
    'new_orgs_7d',    v_new_orgs_7d
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Index for admin queries ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = TRUE;
CREATE INDEX IF NOT EXISTS idx_orgs_suspended     ON organizations(suspended, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orgs_plan          ON organizations(plan, created_at DESC);
