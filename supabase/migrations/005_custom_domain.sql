-- 005: Add custom domain fields to organizations
-- Allows farm owners to connect their own domain for their storefront/public page.

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS custom_domain     TEXT         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS domain_verified   BOOLEAN      DEFAULT FALSE;

-- Index for quick lookup when routing incoming requests by domain
CREATE UNIQUE INDEX IF NOT EXISTS idx_orgs_custom_domain
  ON organizations (custom_domain)
  WHERE custom_domain IS NOT NULL;
