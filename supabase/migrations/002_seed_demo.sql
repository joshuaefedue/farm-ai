-- ═══════════════════════════════════════════════════════════════════════════
-- Acre Farm OS — Demo data seed (called after onboarding creates an org)
-- This is a SQL function you call via RPC to populate a new org with demo data
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION seed_demo_org(p_org_id UUID)
RETURNS void AS $$
DECLARE
  h1 UUID; h2 UUID; h3 UUID; h4 UUID; h5 UUID; h6 UUID;
BEGIN
  -- Houses
  INSERT INTO houses (org_id, name, type, capacity) VALUES
    (p_org_id, 'House 1', 'Open-sided · deep litter',      6000) RETURNING id INTO h1;
  INSERT INTO houses (org_id, name, type, capacity) VALUES
    (p_org_id, 'House 2', 'Open-sided · raised slatted',   5200) RETURNING id INTO h2;
  INSERT INTO houses (org_id, name, type, capacity) VALUES
    (p_org_id, 'House 3', 'Semi-closed · deep litter',     4000) RETURNING id INTO h3;
  INSERT INTO houses (org_id, name, type, capacity) VALUES
    (p_org_id, 'House 4', 'Open-sided · battery cage',     4500) RETURNING id INTO h4;
  INSERT INTO houses (org_id, name, type, capacity) VALUES
    (p_org_id, 'House 5', 'Open-sided · deep litter',      2500) RETURNING id INTO h5;
  INSERT INTO houses (org_id, name, type, capacity) VALUES
    (p_org_id, 'House 6', 'Open-sided · deep litter',      6000) RETURNING id INTO h6;

  -- Batches
  INSERT INTO batches (id, org_id, name, breed, type, arrival_date, house_id, house_name,
    start_count, current_count, mortality_pct, fcr, egg_rate, avg_weight, status, supplier, cost_per_bird) VALUES
    ('PB-2026-014', p_org_id, 'Lohmann Brown · House 4', 'Lohmann Brown', 'layer', '2026-01-22',
     h4, 'House 4', 4000, 3892, 2.70, 2.18, 86.4, NULL, 'laying', 'Olam Hatchery, Ibadan', 1840),
    ('PB-2026-013', p_org_id, 'Cobb 500 · House 2', 'Cobb 500', 'broiler', '2026-03-15',
     h2, 'House 2', 5000, 4923, 1.54, 1.62, NULL, 1.42, 'growing', 'Amo Byng, Awe', 1620),
    ('PB-2026-012', p_org_id, 'ISA Brown · House 3', 'ISA Brown', 'layer', '2025-10-04',
     h3, 'House 3', 3500, 3361, 3.97, 2.21, 88.1, NULL, 'laying', 'Olam Hatchery, Ibadan', 1880),
    ('PB-2026-011', p_org_id, 'Arbor Acres · House 1', 'Arbor Acres Plus', 'broiler', '2026-04-02',
     h1, 'House 1', 6000, 5944, 0.93, 1.48, NULL, 0.96, 'growing', 'Zartech, Ibadan', 1580),
    ('PB-2026-010', p_org_id, 'Noiler · House 5', 'Noiler (Local)', 'dual', '2025-12-08',
     h5, 'House 5', 2200, 2104, 4.36, 2.84, NULL, 2.10, 'laying', 'FUNAAB Hatchery', 920),
    ('PB-2026-009', p_org_id, 'Cobb 500 · House 2 (prev)', 'Cobb 500', 'broiler', '2025-12-20',
     h2, 'House 2', 4800, 0, 2.10, 1.59, NULL, 2.32, 'sold', 'Amo Byng, Awe', 1610);

  -- Vaccinations
  INSERT INTO vaccinations (org_id, batch_id, vaccine, route, scheduled_date, status, birds_count) VALUES
    (p_org_id, 'PB-2026-012', 'Fowl pox FP-LT',       'Wing web',       '2026-05-10', 'pending', 3361),
    (p_org_id, 'PB-2026-011', 'Gumboro D2',            'Drinking water', '2026-05-13', 'pending', 5944),
    (p_org_id, 'PB-2026-014', 'ILT booster',           'Eye drop',       '2026-05-13', 'pending', 3892),
    (p_org_id, 'PB-2026-013', 'NDV booster',           'Spray',          '2026-05-16', 'pending', 4923),
    (p_org_id, 'PB-2026-011', 'NDV spray',             'Spray',          '2026-05-21', 'pending', 5944),
    (p_org_id, 'PB-2026-010', 'Gumboro D2',            'Drinking water', '2026-05-24', 'pending', 2104),
    (p_org_id, 'PB-2026-014', 'Newcastle Lasota',      'Drinking water', '2026-05-27', 'pending', 3892),
    (p_org_id, 'PB-2026-012', 'ILT booster',           'Eye drop',       '2026-05-08', 'done',    3361),
    (p_org_id, 'PB-2026-011', 'Newcastle B1',          'Drinking water', '2026-04-09', 'done',    6000),
    (p_org_id, 'PB-2026-013', 'Marek''s HVT',          'Sub-cut',        '2026-03-15', 'done',    5000),
    (p_org_id, 'PB-2026-011', 'Marek HVT',             'Sub-cut',        '2026-04-02', 'done',    6000);

  -- Orders
  INSERT INTO orders (id, org_id, order_date, customer, channel, items, subtotal, status, payment, payment_method, phone, is_coop) VALUES
    ('ORD-2061', p_org_id, '2026-05-12', 'Mama Ngozi · Mile 12 Market', 'WhatsApp',   '320 crates eggs (L)',                       992000,  'delivered',       'paid',     'Opay Transfer',  '+234 803 412 0982', FALSE),
    ('ORD-2062', p_org_id, '2026-05-12', 'Shoprite Lekki',              'Wholesale',  '180 crates eggs (XL) · 240kg dressed chicken', 1840000, 'out_for_delivery', 'invoiced', 'Net-30',         '+234 700 0567',     FALSE),
    ('ORD-2063', p_org_id, '2026-05-13', 'Ifeoma Caterers',             'WhatsApp',   '85 crates eggs (M)',                        229500,  'pending',         'unpaid',   NULL,             '+234 909 221 8814', TRUE),
    ('ORD-2064', p_org_id, '2026-05-13', 'Ogun Poultry Co-op',         'Cooperative','1,200 day-old broilers (resale)',            1380000, 'confirmed',       'paid',     'Bank transfer',  '+234 802 110 5566', TRUE),
    ('ORD-2065', p_org_id, '2026-05-13', 'Mr Biggs Sango',             'Retail B2B', '140kg dressed broiler',                     462000,  'pending',         'unpaid',   NULL,             '+234 805 887 1100', FALSE),
    ('ORD-2066', p_org_id, '2026-05-11', 'Femi · Mowe Roadside',       'WhatsApp',   '42 crates eggs (L)',                        130200,  'delivered',       'paid',     'Cash on delivery','+234 811 003 4422', FALSE),
    ('ORD-2067', p_org_id, '2026-05-10', 'Bukola Foods',               'Wholesale',  '560 crates eggs mixed',                     1612000, 'delivered',       'paid',     'Moniepoint',     '+234 909 555 0001', FALSE);

  -- Alerts
  INSERT INTO alerts (org_id, level, title, meta, icon) VALUES
    (p_org_id, 'danger',  'Mortality spike — PB-2026-010',        '8 birds today vs 7-day avg 2.4 · suspected coccidiosis', 'Mortality'),
    (p_org_id, 'warning', 'Vaccine due tomorrow — Gumboro D2',    'PB-2026-011 · Arbor Acres · House 1 · 5,944 birds',      'Vaccine'),
    (p_org_id, 'warning', 'Feed stock low — Layer Mash 18%',      '1.8 tonnes left · ~3 days at current rate',              'Feed'),
    (p_org_id, 'info',    'Egg orders pending fulfilment',        '4 wholesale orders · 218 crates total',                 'Egg'),
    (p_org_id, 'success', 'PB-2026-009 sold — final reconciliation','Net profit ₦4.82M · ROI 18.4%',                      'Check');

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
