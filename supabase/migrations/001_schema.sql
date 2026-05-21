-- ═══════════════════════════════════════════════════════════════════════════
-- Acre Farm OS — Initial Schema
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
CREATE TABLE organizations (
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
CREATE TABLE profiles (
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
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Organization members ──────────────────────────────────────────────────────
CREATE TABLE organization_members (
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
CREATE TABLE houses (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  type       TEXT,
  capacity   INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Batches ───────────────────────────────────────────────────────────────────
CREATE TABLE batches (
  id             TEXT PRIMARY KEY,          -- e.g. PB-2026-014
  org_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name           TEXT,
  breed          TEXT,
  type           TEXT NOT NULL CHECK (type IN ('layer','broiler','dual')),
  arrival_date   DATE,
  house_id       UUID REFERENCES houses(id),
  house_name     TEXT,                      -- denormalised for speed
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
CREATE TABLE batch_logs (
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
CREATE TABLE vaccinations (
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
CREATE TABLE orders (
  id              TEXT PRIMARY KEY,         -- e.g. ORD-2061
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
CREATE TABLE inventory_items (
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
CREATE TABLE alerts (
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
CREATE TABLE notification_settings (
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

CREATE TRIGGER organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER batches_updated_at BEFORE UPDATE ON batches
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
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
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (id = auth.uid());

-- ── Organizations ─────────────────────────────────────────────────────────────
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

-- ── Reusable: member can read ─────────────────────────────────────────────────
-- Used for all data tables
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

CREATE POLICY "Members can select batch_logs"
  ON batch_logs FOR SELECT USING (org_id IN (SELECT user_org_ids()));
CREATE POLICY "Staff can insert batch_logs"
  ON batch_logs FOR INSERT
  WITH CHECK (org_id IN (SELECT user_org_ids()));

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

CREATE POLICY "Members can select alerts"
  ON alerts FOR SELECT USING (org_id IN (SELECT user_org_ids()));
CREATE POLICY "System can insert alerts"
  ON alerts FOR INSERT
  WITH CHECK (org_id IN (SELECT user_org_ids()));
CREATE POLICY "Members can mark alerts read"
  ON alerts FOR UPDATE USING (org_id IN (SELECT user_org_ids()));

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
CREATE INDEX idx_org_members_user   ON organization_members(user_id);
CREATE INDEX idx_org_members_org    ON organization_members(org_id);
CREATE INDEX idx_batches_org        ON batches(org_id);
CREATE INDEX idx_batches_status     ON batches(org_id, status);
CREATE INDEX idx_batch_logs_batch   ON batch_logs(batch_id, log_date);
CREATE INDEX idx_vaccinations_org   ON vaccinations(org_id, scheduled_date);
CREATE INDEX idx_orders_org         ON orders(org_id, order_date DESC);
CREATE INDEX idx_alerts_org         ON alerts(org_id, created_at DESC);
CREATE INDEX idx_inventory_org      ON inventory_items(org_id);
