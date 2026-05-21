-- ═══════════════════════════════════════════════════════════════════════════
-- Acre Farm OS — Initial Schema (idempotent — safe to re-run)
-- Multi-tenant poultry ERP. Every table is scoped to org_id with RLS.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Helper: slugify ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION slugify(input TEXT)
RETURNS TEXT AS $$
  SELECT lower(regexp_replace(trim(input), '[^a-zA-Z0-9]+', '-', 'g'))
$$ LANGUAGE SQL IMMUTABLE;

-- ── Organizations (farms) ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organizations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  reg_number       TEXT,
  state            TEXT,
  lga              TEXT,
  address          TEXT,
  owner_name       TEXT,
  owner_phone      TEXT,
  wa_number        TEXT,
  established_year INT,
  size_ha          NUMERIC(8,2),
  bird_capacity    INT,
  plan             TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro','enterprise')),
  logo_url         TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── User profiles (mirrors auth.users) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  avatar_url TEXT,
  phone      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on new user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Organization members ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organization_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'readonly'
              CHECK (role IN ('owner','manager','vet','sales','logistics','readonly')),
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  invited_by  UUID REFERENCES auth.users(id),
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (org_id, user_id)
);

-- ── Helper: get current user's org IDs ───────────────────────────────────────
CREATE OR REPLACE FUNCTION user_org_ids()
RETURNS SETOF UUID AS $$
  SELECT org_id FROM organization_members
  WHERE user_id = auth.uid() AND active = TRUE
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ── Houses ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS houses (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  type       TEXT,
  capacity   INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Batches ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS batches (
  id             TEXT PRIMARY KEY,
  org_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name           TEXT,
  breed          TEXT,
  type           TEXT NOT NULL CHECK (type IN ('layer','broiler','dual')),
  arrival_date   DATE,
  house_id       UUID REFERENCES houses(id),
  house_name     TEXT,
  start_count    INT,
  current_count  INT,
  mortality_pct  NUMERIC(5,2),
  fcr            NUMERIC(5,2),
  egg_rate       NUMERIC(5,2),
  avg_weight     NUMERIC(5,3),
  status         TEXT NOT NULL DEFAULT 'growing'
                 CHECK (status IN ('laying','growing','sold')),
  supplier       TEXT,
  cost_per_bird  NUMERIC(10,2),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Batch daily logs ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS batch_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  batch_id   TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  log_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  log_type   TEXT NOT NULL CHECK (log_type IN ('mortality','feed','eggs','weight')),
  value      NUMERIC(10,3) NOT NULL,
  notes      TEXT,
  logged_by  UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (batch_id, log_date, log_type)
);

-- ── Vaccinations ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vaccinations (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id             UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  batch_id           TEXT REFERENCES batches(id),
  vaccine            TEXT NOT NULL,
  route              TEXT,
  scheduled_date     DATE NOT NULL,
  administered_date  DATE,
  status             TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','done')),
  birds_count        INT,
  lot_number         TEXT,
  notes              TEXT,
  administered_by    UUID REFERENCES auth.users(id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Orders ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              TEXT PRIMARY KEY,
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  order_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  customer        TEXT NOT NULL,
  channel         TEXT,
  items           TEXT,
  subtotal        NUMERIC(14,2) NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','confirmed','out_for_delivery','delivered','cancelled')),
  payment         TEXT NOT NULL DEFAULT 'unpaid'
                  CHECK (payment IN ('unpaid','invoiced','paid')),
  payment_method  TEXT,
  phone           TEXT,
  is_coop         BOOLEAN NOT NULL DEFAULT FALSE,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Inventory items ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  category      TEXT,
  unit          TEXT,
  quantity      NUMERIC(12,3) NOT NULL DEFAULT 0,
  reorder_level NUMERIC(12,3),
  unit_cost     NUMERIC(12,2),
  supplier      TEXT,
  location      TEXT,
  expiry_date   DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Alerts ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  level      TEXT NOT NULL CHECK (level IN ('danger','warning','info','success')),
  title      TEXT NOT NULL,
  meta       TEXT,
  icon       TEXT,
  read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Notification settings (per org) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notification_settings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  settings   JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── updated_at triggers ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS organizations_updated_at ON organizations;
CREATE TRIGGER organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS batches_updated_at ON batches;
CREATE TRIGGER batches_updated_at BEFORE UPDATE ON batches
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS inventory_updated_at ON inventory_items;
CREATE TRIGGER inventory_updated_at BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- Row Level Security
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE organizations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE houses               ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches              ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders               ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- ── Profiles ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own profile"   ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (id = auth.uid());

-- ── Organizations ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Members can view their orgs" ON organizations;
DROP POLICY IF EXISTS "Owners can update org"       ON organizations;
CREATE POLICY "Members can view their orgs"
  ON organizations FOR SELECT
  USING (id IN (SELECT user_org_ids()));
CREATE POLICY "Owners can update org"
  ON organizations FOR UPDATE
  USING (id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid() AND role = 'owner' AND active = TRUE
  ));

-- ── Organization members ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Members can view their org's members"  ON organization_members;
DROP POLICY IF EXISTS "Owners/managers can insert members"    ON organization_members;
DROP POLICY IF EXISTS "Owners/managers can update members"    ON organization_members;
CREATE POLICY "Members can view their org's members"
  ON organization_members FOR SELECT
  USING (org_id IN (SELECT user_org_ids()));
CREATE POLICY "Owners/managers can insert members"
  ON organization_members FOR INSERT
  WITH CHECK (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid() AND role IN ('owner','manager') AND active = TRUE
  ));
CREATE POLICY "Owners/managers can update members"
  ON organization_members FOR UPDATE
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid() AND role IN ('owner','manager') AND active = TRUE
  ));

-- ── Houses ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Members can select houses"  ON houses;
DROP POLICY IF EXISTS "Managers can insert houses" ON houses;
DROP POLICY IF EXISTS "Managers can update houses" ON houses;
CREATE POLICY "Members can select houses"
  ON houses FOR SELECT USING (org_id IN (SELECT user_org_ids()));
CREATE POLICY "Managers can insert houses"
  ON houses FOR INSERT
  WITH CHECK (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid() AND role IN ('owner','manager') AND active = TRUE
  ));
CREATE POLICY "Managers can update houses"
  ON houses FOR UPDATE
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid() AND role IN ('owner','manager') AND active = TRUE
  ));

-- ── Batches ───────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Members can select batches"  ON batches;
DROP POLICY IF EXISTS "Managers can insert batches" ON batches;
DROP POLICY IF EXISTS "Managers can update batches" ON batches;
CREATE POLICY "Members can select batches"
  ON batches FOR SELECT USING (org_id IN (SELECT user_org_ids()));
CREATE POLICY "Managers can insert batches"
  ON batches FOR INSERT
  WITH CHECK (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid() AND role IN ('owner','manager') AND active = TRUE
  ));
CREATE POLICY "Managers can update batches"
  ON batches FOR UPDATE
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid() AND role IN ('owner','manager','vet') AND active = TRUE
  ));

-- ── Batch logs ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Members can select batch_logs" ON batch_logs;
DROP POLICY IF EXISTS "Staff can insert batch_logs"   ON batch_logs;
CREATE POLICY "Members can select batch_logs"
  ON batch_logs FOR SELECT USING (org_id IN (SELECT user_org_ids()));
CREATE POLICY "Staff can insert batch_logs"
  ON batch_logs FOR INSERT
  WITH CHECK (org_id IN (SELECT user_org_ids()));

-- ── Vaccinations ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Members can select vaccinations"     ON vaccinations;
DROP POLICY IF EXISTS "Vet/manager can insert vaccinations" ON vaccinations;
DROP POLICY IF EXISTS "Vet/manager can update vaccinations" ON vaccinations;
CREATE POLICY "Members can select vaccinations"
  ON vaccinations FOR SELECT USING (org_id IN (SELECT user_org_ids()));
CREATE POLICY "Vet/manager can insert vaccinations"
  ON vaccinations FOR INSERT
  WITH CHECK (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid() AND role IN ('owner','manager','vet') AND active = TRUE
  ));
CREATE POLICY "Vet/manager can update vaccinations"
  ON vaccinations FOR UPDATE
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid() AND role IN ('owner','manager','vet') AND active = TRUE
  ));

-- ── Orders ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Members can select orders" ON orders;
DROP POLICY IF EXISTS "Sales can insert orders"   ON orders;
DROP POLICY IF EXISTS "Sales can update orders"   ON orders;
CREATE POLICY "Members can select orders"
  ON orders FOR SELECT USING (org_id IN (SELECT user_org_ids()));
CREATE POLICY "Sales can insert orders"
  ON orders FOR INSERT
  WITH CHECK (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid() AND role IN ('owner','manager','sales') AND active = TRUE
  ));
CREATE POLICY "Sales can update orders"
  ON orders FOR UPDATE
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid() AND role IN ('owner','manager','sales','logistics') AND active = TRUE
  ));

-- ── Inventory ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Members can select inventory"  ON inventory_items;
DROP POLICY IF EXISTS "Managers can insert inventory" ON inventory_items;
DROP POLICY IF EXISTS "Managers can update inventory" ON inventory_items;
CREATE POLICY "Members can select inventory"
  ON inventory_items FOR SELECT USING (org_id IN (SELECT user_org_ids()));
CREATE POLICY "Managers can insert inventory"
  ON inventory_items FOR INSERT
  WITH CHECK (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid() AND role IN ('owner','manager') AND active = TRUE
  ));
CREATE POLICY "Managers can update inventory"
  ON inventory_items FOR UPDATE
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid() AND role IN ('owner','manager') AND active = TRUE
  ));

-- ── Alerts ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Members can select alerts"     ON alerts;
DROP POLICY IF EXISTS "System can insert alerts"      ON alerts;
DROP POLICY IF EXISTS "Members can mark alerts read"  ON alerts;
CREATE POLICY "Members can select alerts"
  ON alerts FOR SELECT USING (org_id IN (SELECT user_org_ids()));
CREATE POLICY "System can insert alerts"
  ON alerts FOR INSERT
  WITH CHECK (org_id IN (SELECT user_org_ids()));
CREATE POLICY "Members can mark alerts read"
  ON alerts FOR UPDATE USING (org_id IN (SELECT user_org_ids()));

-- ── Notification settings ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Members can view notification settings"  ON notification_settings;
DROP POLICY IF EXISTS "Owners can update notification settings" ON notification_settings;
CREATE POLICY "Members can view notification settings"
  ON notification_settings FOR SELECT USING (org_id IN (SELECT user_org_ids()));
CREATE POLICY "Owners can update notification settings"
  ON notification_settings FOR ALL
  USING (org_id IN (
    SELECT org_id FROM organization_members
    WHERE user_id = auth.uid() AND role IN ('owner','manager') AND active = TRUE
  ));

-- ═══════════════════════════════════════════════════════════════════════════
-- Indexes
-- ═══════════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_org_members_user   ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org    ON organization_members(org_id);
CREATE INDEX IF NOT EXISTS idx_batches_org        ON batches(org_id);
CREATE INDEX IF NOT EXISTS idx_batches_status     ON batches(org_id, status);
CREATE INDEX IF NOT EXISTS idx_batch_logs_batch   ON batch_logs(batch_id, log_date);
CREATE INDEX IF NOT EXISTS idx_vaccinations_org   ON vaccinations(org_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_orders_org         ON orders(org_id, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_org         ON alerts(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_org      ON inventory_items(org_id);
