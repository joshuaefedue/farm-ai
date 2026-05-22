"use client";
import { useState, useTransition, useEffect } from "react";
import { Icons } from "@/components/icons";
import { naira } from "@/lib/utils";
import { useOrg } from "@/contexts/OrgContext";
import {
  updateOrgProfile,
  updateNotificationSettings,
  saveCustomDomain,
  verifyCustomDomain,
  removeCustomDomain,
} from "@/app/actions/settings";
import { inviteMember } from "@/app/actions/team";

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co";

// ── Types ─────────────────────────────────────────────────────────────────────
type NotifRow = {
  id: string; category: string; label: string; desc: string;
  wa: boolean; email: boolean; push: boolean; threshold?: string;
};

type UserRow = {
  id: string; name: string; initials: string; role: string;
  email: string; phone: string; access: string; active: boolean; lastLogin: string;
};

// ── Static data ────────────────────────────────────────────────────────────────
const USERS_INIT: UserRow[] = [
  { id: "U01", name: "Chukwuemeka Adigwe",  initials: "CA", role: "Owner",        email: "emeka@adigwefarms.ng",  phone: "+234 801 234 5678", access: "full",      active: true,  lastLogin: "Today, 9:14 AM" },
  { id: "U02", name: "Ngozi Okafor",         initials: "NO", role: "Farm Manager", email: "ngozi@adigwefarms.ng",  phone: "+234 802 345 6789", access: "manager",   active: true,  lastLogin: "Today, 7:32 AM" },
  { id: "U03", name: "Tunde Adeyemi",        initials: "TA", role: "Vet Officer",  email: "tunde@adigwefarms.ng",  phone: "+234 803 456 7890", access: "vet",       active: true,  lastLogin: "Yesterday" },
  { id: "U04", name: "Amaka Eze",            initials: "AE", role: "Sales Officer",email: "amaka@adigwefarms.ng",  phone: "+234 804 567 8901", access: "sales",     active: true,  lastLogin: "2 days ago" },
  { id: "U05", name: "Biodun Fashola",       initials: "BF", role: "Logistics",    email: "biodun@adigwefarms.ng", phone: "+234 805 678 9012", access: "logistics", active: false, lastLogin: "1 week ago" },
];

const ACCESS_LABELS: Record<string, { label: string; color: string }> = {
  full:      { label: "Full Access",   color: "accent"  },
  manager:   { label: "Farm Manager",  color: "success" },
  vet:       { label: "Vet Officer",   color: "info"    },
  sales:     { label: "Sales Officer", color: "warning" },
  logistics: { label: "Logistics",     color: "outline" },
  readonly:  { label: "Read Only",     color: "outline" },
};

const NOTIF_INIT: NotifRow[] = [
  { id: "N01", category: "Bird Health",   label: "Mortality spike",           desc: "Alert when batch mortality exceeds threshold",    wa: true,  email: true,  push: true,  threshold: "> 2% / day" },
  { id: "N02", category: "Bird Health",   label: "Disease alert nearby",      desc: "Notify when NAFDAC reports disease in your zone", wa: true,  email: false, push: true  },
  { id: "N03", category: "Bird Health",   label: "Vaccination due",           desc: "Remind 48 h before scheduled vaccination",        wa: true,  email: false, push: false, threshold: "2 days prior" },
  { id: "N04", category: "Bird Health",   label: "Temperature out of range",  desc: "House sensor above/below safe range",             wa: true,  email: false, push: true,  threshold: "< 20°C or > 32°C" },
  { id: "N05", category: "Operations",   label: "Feed stock low",            desc: "Alert when any item drops below reorder level",   wa: true,  email: true,  push: false, threshold: "< 7 days supply" },
  { id: "N06", category: "Operations",   label: "Medication expiry",         desc: "Warn before vaccine or drug expires",             wa: false, email: true,  push: false, threshold: "14 days prior" },
  { id: "N07", category: "Operations",   label: "Delivery delay",            desc: "Flag delivery that is more than 2 h late",        wa: true,  email: false, push: false },
  { id: "N08", category: "Sales",        label: "New order received",        desc: "Notify immediately on every new order",           wa: true,  email: false, push: true  },
  { id: "N09", category: "Sales",        label: "Order fulfilled",           desc: "Confirmation when delivery is marked complete",   wa: true,  email: false, push: false },
  { id: "N10", category: "Sales",        label: "Invoice overdue",           desc: "Remind for unpaid invoices past due date",        wa: true,  email: true,  push: false, threshold: "+7 days" },
  { id: "N11", category: "Finance",      label: "Daily revenue summary",     desc: "Morning summary of previous day's revenue",       wa: true,  email: false, push: false },
  { id: "N12", category: "Finance",      label: "Weekly P&L digest",         desc: "Monday morning P&L report",                       wa: false, email: true,  push: false },
  { id: "N13", category: "Finance",      label: "Large transaction",         desc: "Any single transaction above threshold",          wa: true,  email: true,  push: false, threshold: "> ₦500,000" },
  { id: "N14", category: "System",       label: "New device login",          desc: "Notify when account is accessed from a new device", wa: true, email: true,  push: true  },
  { id: "N15", category: "System",       label: "Daily backup complete",     desc: "Confirmation that data was backed up successfully", wa: false, email: false, push: false },
];

const INVOICES = [
  { id: "INV-2026-05", date: "1 Jun 2026",  period: "May 2026",      amount: 49000, status: "due" },
  { id: "INV-2026-04", date: "1 May 2026",  period: "April 2026",    amount: 49000, status: "paid" },
  { id: "INV-2026-03", date: "1 Apr 2026",  period: "March 2026",    amount: 49000, status: "paid" },
  { id: "INV-2026-02", date: "1 Mar 2026",  period: "February 2026", amount: 49000, status: "paid" },
  { id: "INV-2026-01", date: "1 Feb 2026",  period: "January 2026",  amount: 49000, status: "paid" },
  { id: "INV-2025-12", date: "1 Jan 2026",  period: "Dec 2025",      amount: 29000, status: "paid" },
];

const INTEGRATIONS = [
  { id: "wa",       icon: "📱", name: "WhatsApp Business API",       desc: "Send automated order confirmations, alerts and reports via official WA Business API", status: "connected",    detail: "Linked: +234 801 234 5678 · Business Account verified", actionLabel: "Configure" },
  { id: "market",   icon: "🛒", name: "Acre Marketplace",            desc: "Sync your store products and receive orders directly into the ERP",                   status: "connected",    detail: "Storefront live · Last sync: today 08:00",              actionLabel: "Manage" },
  { id: "paystack", icon: "💳", name: "Paystack",                    desc: "Accept online payments for marketplace orders and generate payment links",            status: "connected",    detail: "Live mode · Public key ending ***4f2a",                 actionLabel: "Settings" },
  { id: "flutter",  icon: "💸", name: "Flutterwave",                 desc: "Alternative payment processor for mobile money and cross-border transactions",       status: "disconnected", detail: "Not connected",                                         actionLabel: "Connect" },
  { id: "sheets",   icon: "📊", name: "Google Sheets Export",        desc: "Automatically push daily reports to a connected Google Sheet",                       status: "disconnected", detail: "Not connected",                                         actionLabel: "Connect" },
  { id: "nafdac",   icon: "🏛️", name: "NAFDAC Disease Watch API",   desc: "Pull live disease alerts from NAFDAC for your state and neighbouring zones",         status: "connected",    detail: "Ogun State zone active · Last pull: 1 h ago",           actionLabel: "Configure" },
];

const TABS = ["Farm Profile", "Notifications", "Users & Access", "Integrations", "System", "Billing"];

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      role="switch"
      aria-checked={on}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => e.key === " " || e.key === "Enter" ? onToggle() : null}
      style={{
        width: 34, height: 19, borderRadius: 10,
        background: on ? "var(--accent)" : "var(--bg-active)",
        cursor: "pointer", position: "relative", transition: "background 0.18s",
        display: "inline-block", flexShrink: 0, outline: "none",
      }}
    >
      <div style={{
        position: "absolute", top: 2,
        left: on ? 17 : 2,
        width: 15, height: 15, borderRadius: "50%",
        background: "white", transition: "left 0.18s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.22)",
      }} />
    </div>
  );
}

// ── InviteModal ───────────────────────────────────────────────────────────────
function InviteModal({
  orgId,
  onClose,
  onSuccess,
}: {
  orgId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", role: "manager" });

  function handleInvite() {
    if (!form.email.trim()) { setError("Email is required"); return; }
    if (!form.full_name.trim()) { setError("Name is required"); return; }
    if (!SUPABASE_CONFIGURED) {
      // In demo mode, just close as if succeeded
      onSuccess(); onClose(); return;
    }
    startTransition(async () => {
      const res = await inviteMember({ org_id: orgId, email: form.email, full_name: form.full_name, role: form.role });
      if (!res.success) { setError(res.error ?? "Failed to invite member"); return; }
      onSuccess();
      onClose();
    });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="icon-dot"><Icons.People size={14} /></div>
          <div>
            <h3>Invite Team Member</h3>
            <div className="sub">An invitation link will be sent via email</div>
          </div>
          <div className="spacer" />
          <button className="btn ghost icon-only" onClick={onClose}><Icons.X size={14} /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-row">
              <label>Full Name</label>
              <input className="input" value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="e.g. Kemi Adeyemi" />
            </div>
            <div className="form-row">
              <label>Email Address</label>
              <input className="input" type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@adigwefarms.ng" />
            </div>
            <div className="form-row">
              <label>Phone (WhatsApp)</label>
              <input className="input" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+234 8XX XXX XXXX" />
            </div>
            <div className="form-row">
              <label>Access Level</label>
              <select className="select" value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="manager">Farm Manager</option>
                <option value="vet">Vet Officer</option>
                <option value="sales">Sales Officer</option>
                <option value="logistics">Logistics</option>
                <option value="readonly">Read Only</option>
              </select>
            </div>
          </div>
          {error && (
            <div className="banner danger" style={{ marginTop: 12 }}>
              <div className="icon-dot danger"><Icons.Alert size={12} /></div>
              <span>{error}</span>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose} disabled={isPending}>Cancel</button>
          <button className="btn accent" onClick={handleInvite} disabled={isPending}>
            {isPending ? "Sending…" : "Send Invite"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SettingsScreen ─────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const [tab, setTab] = useState("Farm Profile");
  const [notifs, setNotifs] = useState<NotifRow[]>(NOTIF_INIT);
  const [users, setUsers] = useState<UserRow[]>(USERS_INIT);
  const [showInvite, setShowInvite] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { org, isOwner } = useOrg();

  // Custom domain state
  const [domainInput, setDomainInput] = useState("");
  const [domainSaved, setDomainSaved] = useState<string | null>(null);
  const [domainVerified, setDomainVerified] = useState(false);
  const [domainError, setDomainError] = useState<string | null>(null);
  const [domainSuccess, setDomainSuccess] = useState<string | null>(null);
  const [domainPending, startDomainTransition] = useTransition();
  const [verifyPending, startVerifyTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  // Farm profile state — defaults used when org not loaded
  const [profile, setProfile] = useState({
    farmName:    "Adigwe Family Farms",
    regNumber:   "CAC/RC-1823456",
    state:       "Ogun",
    lga:         "Sagamu",
    address:     "Plot 15, Adigwe Road, Sagamu Industrial Layout, Ogun State",
    ownerName:   "Chukwuemeka Adigwe",
    ownerTitle:  "Managing Director",
    ownerEmail:  "emeka@adigwefarms.ng",
    ownerPhone:  "+234 801 234 5678",
    waNumber:    "2348012345678",
    established: "2019",
    size:        "8.5",
    capacity:    "50000",
    website:     "adigwefarms.ng",
  });

  // Sync profile + domain from DB org when it loads
  useEffect(() => {
    if (!org) return;
    setProfile((prev) => ({
      ...prev,
      farmName:    org.name ?? prev.farmName,
      regNumber:   org.reg_number ?? prev.regNumber,
      state:       org.state ?? prev.state,
      lga:         org.lga ?? prev.lga,
      address:     org.address ?? prev.address,
      ownerName:   org.owner_name ?? prev.ownerName,
      ownerPhone:  org.owner_phone ?? prev.ownerPhone,
      waNumber:    org.wa_number ?? prev.waNumber,
      established: org.established_year ? String(org.established_year) : prev.established,
      size:        org.size_ha != null ? String(org.size_ha) : prev.size,
      capacity:    org.bird_capacity != null ? String(org.bird_capacity) : prev.capacity,
    }));
    // Sync domain fields
    setDomainSaved(org.custom_domain ?? null);
    setDomainInput(org.custom_domain ?? "");
    setDomainVerified(org.domain_verified ?? false);
  }, [org?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // System prefs state
  const [prefs, setPrefs] = useState({
    timezone: "Africa/Lagos",
    dateFormat: "DD MMM YYYY",
    currency: "NGN",
    language: "en-NG",
    fiscalStart: "January",
    decimalSep: "point",
    theme: "system",
  });

  async function handleSave() {
    setSaveError(null);
    if (tab === "Farm Profile" && SUPABASE_CONFIGURED && org) {
      startTransition(async () => {
        const res = await updateOrgProfile(org.id, {
          name:            profile.farmName,
          reg_number:      profile.regNumber || undefined,
          state:           profile.state || undefined,
          lga:             profile.lga || undefined,
          address:         profile.address || undefined,
          owner_name:      profile.ownerName || undefined,
          owner_phone:     profile.ownerPhone || undefined,
          wa_number:       profile.waNumber || undefined,
          established_year: profile.established ? parseInt(profile.established) : undefined,
          size_ha:         profile.size ? parseFloat(profile.size) : undefined,
          bird_capacity:   profile.capacity ? parseInt(profile.capacity) : undefined,
        });
        if (!res.success) { setSaveError(res.error ?? "Failed to save"); return; }
        setSaved(true);
        setTimeout(() => setSaved(false), 2200);
      });
    } else if (tab === "Notifications" && SUPABASE_CONFIGURED && org) {
      startTransition(async () => {
        const res = await updateNotificationSettings(org.id, { preferences: notifs });
        if (!res.success) { setSaveError(res.error ?? "Failed to save"); return; }
        setSaved(true);
        setTimeout(() => setSaved(false), 2200);
      });
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    }
  }

  function toggleNotif(id: string, field: "wa" | "email" | "push") {
    setNotifs(notifs.map((n) => n.id === id ? { ...n, [field]: !n[field] } : n));
  }

  const notifCategories = Array.from(new Set(notifs.map((n) => n.category)));
  const showSaveBtn = tab === "Farm Profile" || tab === "Notifications" || tab === "System";

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <div className="page-sub">Manage your farm profile, team, notifications and integrations</div>
        </div>
        {showSaveBtn && (
          <div className="page-actions">
            {saveError && <span className="badge danger" style={{ gap: 5 }}>{saveError}</span>}
            {saved && <span className="badge success" style={{ gap: 5 }}><Icons.Check size={11} /> Saved</span>}
            <button className="btn accent" onClick={handleSave} disabled={isPending}>
              <Icons.Check size={13} /> {isPending ? "Saving…" : "Save changes"}
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={`tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
            {t === "Farm Profile"   && <Icons.House    size={13} />}
            {t === "Notifications"  && <Icons.Bell     size={13} />}
            {t === "Users & Access" && <Icons.People   size={13} />}
            {t === "Integrations"   && <Icons.Settings size={13} />}
            {t === "System"         && <Icons.Settings size={13} />}
            {t === "Billing"        && <Icons.Money    size={13} />}
            {t}
          </button>
        ))}
      </div>

      {/* ── Tab: Farm Profile ──────────────────────────────────────────────── */}
      {tab === "Farm Profile" && (
        <div className="stack-4">
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: "var(--accent)", color: "white",
                display: "grid", placeItems: "center", fontSize: 22, flexShrink: 0,
              }}>🌿</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{profile.farmName}</div>
                <div className="muted" style={{ fontSize: 12 }}>{profile.regNumber} · Est. {profile.established}</div>
              </div>
              <div className="spacer" />
              <button className="btn sm">Change Logo</button>
            </div>
            <div className="divider" style={{ marginBottom: 16 }} />
            <div className="form-grid">
              <div className="form-row" style={{ gridColumn: "span 2" }}>
                <label>Farm Name</label>
                <input className="input" value={profile.farmName}
                  onChange={(e) => setProfile({ ...profile, farmName: e.target.value })} />
              </div>
              <div className="form-row">
                <label>CAC Registration No.</label>
                <input className="input" value={profile.regNumber}
                  onChange={(e) => setProfile({ ...profile, regNumber: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Year Established</label>
                <input className="input" value={profile.established}
                  onChange={(e) => setProfile({ ...profile, established: e.target.value })} />
              </div>
              <div className="form-row">
                <label>State</label>
                <select className="select" value={profile.state}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}>
                  {["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River",
                    "Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo","Jigawa","Kaduna","Kano",
                    "Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo",
                    "Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label>LGA</label>
                <input className="input" value={profile.lga}
                  onChange={(e) => setProfile({ ...profile, lga: e.target.value })} />
              </div>
              <div className="form-row" style={{ gridColumn: "span 2" }}>
                <label>Farm Address</label>
                <input className="input" value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Farm Size (hectares)</label>
                <input className="input" type="number" value={profile.size}
                  onChange={(e) => setProfile({ ...profile, size: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Total Bird Capacity</label>
                <input className="input" type="number" value={profile.capacity}
                  onChange={(e) => setProfile({ ...profile, capacity: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Website</label>
                <input className="input" value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Owner & Primary Contact</div>
            <div className="form-grid">
              <div className="form-row">
                <label>Full Name</label>
                <input className="input" value={profile.ownerName}
                  onChange={(e) => setProfile({ ...profile, ownerName: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Title / Role</label>
                <input className="input" value={profile.ownerTitle}
                  onChange={(e) => setProfile({ ...profile, ownerTitle: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Email</label>
                <input className="input" type="email" value={profile.ownerEmail}
                  onChange={(e) => setProfile({ ...profile, ownerEmail: e.target.value })} />
              </div>
              <div className="form-row">
                <label>Phone Number</label>
                <input className="input" value={profile.ownerPhone}
                  onChange={(e) => setProfile({ ...profile, ownerPhone: e.target.value })} />
              </div>
              <div className="form-row" style={{ gridColumn: "span 2" }}>
                <label>WhatsApp Business Number (no + or spaces)</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="input" value={profile.waNumber} style={{ flex: 1 }}
                    onChange={(e) => setProfile({ ...profile, waNumber: e.target.value })} />
                  <a
                    href={`https://wa.me/${profile.waNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{ flexShrink: 0, textDecoration: "none" }}
                  >
                    <Icons.WhatsApp size={13} className="whatsapp-icon" /> Test
                  </a>
                </div>
                <span className="muted" style={{ fontSize: 11 }}>Used for all outbound WhatsApp alerts and customer messages</span>
              </div>
            </div>
          </div>

          {/* ── Custom Domain Card ──────────────────────────────────────────── */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: domainVerified ? "var(--success)" : "var(--bg-subtle)",
                color: domainVerified ? "white" : "var(--fg-muted)",
                display: "grid", placeItems: "center", flexShrink: 0,
              }}>
                <Icons.Globe size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Custom Domain</div>
                <div className="muted" style={{ fontSize: 12 }}>
                  Connect your own domain to your farm storefront
                </div>
              </div>
              <div className="spacer" />
              {domainSaved && domainVerified && (
                <span className="badge success" style={{ fontSize: 11 }}>
                  <Icons.Shield size={10} /> Verified
                </span>
              )}
              {domainSaved && !domainVerified && (
                <span className="badge warning" style={{ fontSize: 11 }}>
                  <Icons.Alert size={10} /> Pending verification
                </span>
              )}
            </div>
            <div className="divider" style={{ marginBottom: 14 }} />

            {!isOwner ? (
              <div className="banner" style={{ fontSize: 12 }}>
                <Icons.Info size={13} />
                <span>Only the farm owner can manage custom domains.</span>
              </div>
            ) : !domainSaved ? (
              /* ── No domain configured — show input to add one ── */
              <>
                <div style={{ fontSize: 13, marginBottom: 10, lineHeight: 1.6 }}>
                  Point your own domain to your farm&apos;s public storefront and marketplace page.
                  Customers will see your brand instead of an Acre URL.
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        className="input"
                        placeholder="e.g. store.yourfarm.com"
                        value={domainInput}
                        onChange={(e) => { setDomainInput(e.target.value); setDomainError(null); setDomainSuccess(null); }}
                        style={{ flex: 1 }}
                      />
                      <button
                        className="btn accent"
                        disabled={domainPending || !domainInput.trim()}
                        onClick={() => {
                          if (!SUPABASE_CONFIGURED || !org) {
                            setDomainSaved(domainInput.trim().toLowerCase());
                            setDomainSuccess("Domain saved — follow the steps below to verify.");
                            return;
                          }
                          setDomainError(null);
                          startDomainTransition(async () => {
                            const res = await saveCustomDomain(org.id, domainInput);
                            if (!res.success) { setDomainError(res.error ?? "Failed to save domain"); return; }
                            setDomainSaved(res.domain ?? domainInput.trim().toLowerCase());
                            setDomainVerified(false);
                            setDomainSuccess("Domain saved — follow the steps below to verify ownership.");
                          });
                        }}
                      >
                        <Icons.Link size={12} />
                        {domainPending ? "Saving…" : "Connect Domain"}
                      </button>
                    </div>
                    <span className="muted" style={{ fontSize: 11, marginTop: 4, display: "block" }}>
                      Enter a domain or subdomain you own (e.g. store.yourfarm.com or yourfarm.ng)
                    </span>
                  </div>
                </div>
                {domainError && (
                  <div className="banner danger" style={{ marginTop: 10 }}>
                    <Icons.Alert size={12} /><span>{domainError}</span>
                  </div>
                )}
              </>
            ) : !domainVerified ? (
              /* ── Domain saved but not verified — show DNS instructions ── */
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>
                    <Icons.Globe size={13} style={{ verticalAlign: "-2px", marginRight: 4 }} />
                    {domainSaved}
                  </span>
                  <button className="btn sm danger" style={{ marginLeft: "auto" }}
                    disabled={domainPending}
                    onClick={() => {
                      if (!SUPABASE_CONFIGURED || !org) {
                        setDomainSaved(null); setDomainInput(""); setDomainVerified(false);
                        setDomainError(null); setDomainSuccess(null);
                        return;
                      }
                      startDomainTransition(async () => {
                        const res = await removeCustomDomain(org.id);
                        if (res.success) {
                          setDomainSaved(null); setDomainInput(""); setDomainVerified(false);
                          setDomainError(null); setDomainSuccess(null);
                        }
                      });
                    }}
                  >
                    {domainPending ? "Removing…" : "Remove"}
                  </button>
                </div>

                <div style={{
                  background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)",
                  padding: 14, marginBottom: 14,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--fg-muted)" }}>
                    Step 1 — Add a DNS TXT record
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 10 }}>
                    Go to your domain registrar (e.g. Namecheap, GoDaddy, Cloudflare) and add a <strong>TXT record</strong> to verify ownership:
                  </div>
                  <div style={{
                    display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 16px",
                    fontSize: 12, background: "var(--bg-card)", borderRadius: 6,
                    padding: "10px 14px", border: "1px solid var(--border)",
                  }}>
                    <span style={{ fontWeight: 600, color: "var(--fg-muted)" }}>Type</span>
                    <span style={{ fontFamily: "monospace" }}>TXT</span>
                    <span style={{ fontWeight: 600, color: "var(--fg-muted)" }}>Host / Name</span>
                    <span style={{ fontFamily: "monospace" }}>@</span>
                    <span style={{ fontWeight: 600, color: "var(--fg-muted)" }}>Value</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <code style={{
                        background: "var(--bg-subtle)", padding: "2px 8px",
                        borderRadius: 4, fontSize: 12, fontFamily: "monospace",
                        wordBreak: "break-all",
                      }}>
                        acre-verify={org?.id ?? "your-org-id"}
                      </code>
                      <button
                        className="btn sm ghost icon-only"
                        title="Copy to clipboard"
                        onClick={() => {
                          navigator.clipboard.writeText(`acre-verify=${org?.id ?? ""}`);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                      >
                        {copied ? <Icons.Check size={12} /> : <Icons.Copy size={12} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{
                  background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)",
                  padding: 14, marginBottom: 14,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--fg-muted)" }}>
                    Step 2 — Add a CNAME record
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 10 }}>
                    Point your domain to Acre by adding a <strong>CNAME record</strong>:
                  </div>
                  <div style={{
                    display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 16px",
                    fontSize: 12, background: "var(--bg-card)", borderRadius: 6,
                    padding: "10px 14px", border: "1px solid var(--border)",
                  }}>
                    <span style={{ fontWeight: 600, color: "var(--fg-muted)" }}>Type</span>
                    <span style={{ fontFamily: "monospace" }}>CNAME</span>
                    <span style={{ fontWeight: 600, color: "var(--fg-muted)" }}>Host / Name</span>
                    <span style={{ fontFamily: "monospace" }}>
                      {domainSaved.startsWith("store.") || domainSaved.startsWith("shop.") || domainSaved.startsWith("www.")
                        ? domainSaved.split(".")[0]
                        : "@"}
                    </span>
                    <span style={{ fontWeight: 600, color: "var(--fg-muted)" }}>Target</span>
                    <span style={{ fontFamily: "monospace" }}>stores.acrefarm.ng</span>
                  </div>
                </div>

                <div style={{
                  background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)",
                  padding: 14, marginBottom: 14,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--fg-muted)" }}>
                    Step 3 — Verify
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 10 }}>
                    After adding both records, click the button below. DNS changes can take up to 24 hours to propagate.
                  </div>
                  <button
                    className="btn accent"
                    disabled={verifyPending}
                    onClick={() => {
                      setDomainError(null); setDomainSuccess(null);
                      if (!SUPABASE_CONFIGURED || !org) {
                        setDomainVerified(true);
                        setDomainSuccess("Domain verified successfully!");
                        return;
                      }
                      startVerifyTransition(async () => {
                        const res = await verifyCustomDomain(org.id);
                        if (res.verified) {
                          setDomainVerified(true);
                          setDomainSuccess("Domain verified successfully! Your storefront is now live.");
                        } else {
                          setDomainError(res.error ?? "Verification failed — TXT record not found.");
                        }
                      });
                    }}
                  >
                    <Icons.Refresh size={12} />
                    {verifyPending ? "Checking DNS…" : "Verify Domain"}
                  </button>
                </div>

                {domainError && (
                  <div className="banner danger" style={{ marginTop: 4 }}>
                    <Icons.Alert size={12} /><span>{domainError}</span>
                  </div>
                )}
                {domainSuccess && (
                  <div className="banner success" style={{ marginTop: 4 }}>
                    <Icons.Check size={12} /><span>{domainSuccess}</span>
                  </div>
                )}
              </>
            ) : (
              /* ── Domain verified — show active status ── */
              <>
                <div style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                  background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)", marginBottom: 12,
                }}>
                  <Icons.Globe size={18} style={{ color: "var(--success)", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{domainSaved}</div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                      DNS verified · CNAME active · SSL provisioned
                    </div>
                  </div>
                  <a
                    href={`https://${domainSaved}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn sm"
                    style={{ textDecoration: "none", flexShrink: 0 }}
                  >
                    <Icons.ExternalLink size={11} /> Visit
                  </a>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="btn sm" onClick={() => {
                    setDomainVerified(false);
                    setDomainSuccess(null);
                    setDomainError(null);
                  }}>
                    <Icons.Settings size={11} /> Edit DNS Settings
                  </button>
                  <button className="btn sm danger"
                    disabled={domainPending}
                    onClick={() => {
                      if (!SUPABASE_CONFIGURED || !org) {
                        setDomainSaved(null); setDomainInput(""); setDomainVerified(false);
                        setDomainError(null); setDomainSuccess(null);
                        return;
                      }
                      startDomainTransition(async () => {
                        const res = await removeCustomDomain(org.id);
                        if (res.success) {
                          setDomainSaved(null); setDomainInput(""); setDomainVerified(false);
                          setDomainError(null); setDomainSuccess(null);
                        }
                      });
                    }}
                  >
                    {domainPending ? "Removing…" : "Disconnect Domain"}
                  </button>
                </div>

                {domainSuccess && (
                  <div className="banner success" style={{ marginTop: 10 }}>
                    <Icons.Check size={12} /><span>{domainSuccess}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Notifications ─────────────────────────────────────────────── */}
      {tab === "Notifications" && (
        <div className="stack-4">
          <div className="card" style={{ padding: "12px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-muted)" }}>DELIVERY CHANNELS</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                <Icons.WhatsApp size={13} className="whatsapp-icon" /> WhatsApp
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                <Icons.Bell size={13} style={{ color: "var(--info)" }} /> Email
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                <Icons.Phone size={13} style={{ color: "var(--accent)" }} /> Push
              </span>
              <div className="spacer" />
              <button className="btn sm" onClick={() => setNotifs(notifs.map((n) => ({ ...n, wa: true, email: true, push: true })))}>Enable all</button>
              <button className="btn sm" onClick={() => setNotifs(notifs.map((n) => ({ ...n, wa: false, email: false, push: false })))}>Disable all</button>
            </div>
          </div>

          {notifCategories.map((cat) => (
            <div className="card" key={cat} style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "10px 16px", background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--fg-muted)" }}>
                {cat}
              </div>
              <div>
                {notifs.filter((n) => n.category === cat).map((n, i, arr) => (
                  <div key={n.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{n.label}</div>
                      <div className="muted" style={{ fontSize: 12 }}>{n.desc}</div>
                      {n.threshold && <span className="badge outline" style={{ marginTop: 4 }}>Threshold: {n.threshold}</span>}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 36 }}>
                      <Icons.WhatsApp size={11} className="whatsapp-icon" />
                      <Toggle on={n.wa} onToggle={() => toggleNotif(n.id, "wa")} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 36 }}>
                      <Icons.Bell size={11} style={{ color: "var(--info)" }} />
                      <Toggle on={n.email} onToggle={() => toggleNotif(n.id, "email")} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 36 }}>
                      <Icons.Phone size={11} style={{ color: "var(--accent)" }} />
                      <Toggle on={n.push} onToggle={() => toggleNotif(n.id, "push")} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tab: Users & Access ──────────────────────────────────────────────── */}
      {tab === "Users & Access" && (
        <div className="stack-4">
          <div className="card" style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-muted)", marginBottom: 10, letterSpacing: "0.05em", textTransform: "uppercase" }}>Access Level Reference</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
              {Object.entries(ACCESS_LABELS).map(([key, val]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <span className={`badge ${val.color}`}>{val.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>Team Members</span>
              <div className="spacer" />
              <button className="btn accent sm" onClick={() => setShowInvite(true)}>
                <Icons.Plus size={12} /> Invite Member
              </button>
            </div>
            <div className="table-wrap" style={{ border: "none", borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Member</th><th>Role</th><th>Access Level</th><th>Last Login</th><th>Status</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const acc = ACCESS_LABELS[u.access] ?? { label: u.access, color: "outline" };
                    return (
                      <tr key={u.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div className="avatar" style={{ background: u.active ? undefined : "var(--bg-subtle)", color: u.active ? "white" : "var(--fg-muted)" }}>
                              {u.initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 500, fontSize: 13 }}>{u.name}</div>
                              <div className="muted" style={{ fontSize: 11 }}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: 12, color: "var(--fg-muted)" }}>{u.role}</td>
                        <td>
                          <select
                            className="select"
                            style={{ height: 26, fontSize: 11, width: "auto", padding: "0 8px" }}
                            value={u.access}
                            onChange={(e) => setUsers(users.map((x) => x.id === u.id ? { ...x, access: e.target.value } : x))}
                          >
                            {Object.entries(ACCESS_LABELS).map(([k, v]) => (
                              <option key={k} value={k}>{v.label}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ fontSize: 12, color: "var(--fg-muted)" }}>{u.lastLogin}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Toggle on={u.active} onToggle={() => setUsers(users.map((x) => x.id === u.id ? { ...x, active: !x.active } : x))} />
                            <span style={{ fontSize: 11, color: u.active ? "var(--success)" : "var(--fg-faint)" }}>
                              {u.active ? "Active" : "Disabled"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <button className="btn sm ghost icon-only"><Icons.More size={13} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Pending Invites</div>
            <div className="empty" style={{ padding: "24px 16px" }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>📨</div>
              <div>No pending invitations</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Invited members will appear here until they accept</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Integrations ─────────────────────────────────────────────── */}
      {tab === "Integrations" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
          {INTEGRATIONS.map((intg) => (
            <div className="card" key={intg.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, fontSize: 20, background: "var(--bg-subtle)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  {intg.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{intg.name}</span>
                    <span className={`badge ${intg.status === "connected" ? "success" : "outline"}`} style={{ fontSize: 10 }}>
                      <span className="dot" />{intg.status === "connected" ? "Connected" : "Not connected"}
                    </span>
                  </div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 3, lineHeight: 1.5 }}>{intg.desc}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "var(--fg-faint)", background: "var(--bg-subtle)", borderRadius: 6, padding: "6px 10px" }}>
                {intg.detail}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className={`btn sm ${intg.status === "connected" ? "" : "accent"}`}>{intg.actionLabel}</button>
                {intg.status === "connected" && <button className="btn sm danger">Disconnect</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tab: System Preferences ──────────────────────────────────────── */}
      {tab === "System" && (
        <div className="stack-4">
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 16 }}>Regional & Display</div>
            <div className="form-grid">
              <div className="form-row">
                <label>Timezone</label>
                <select className="select" value={prefs.timezone} onChange={(e) => setPrefs({ ...prefs, timezone: e.target.value })}>
                  <option value="Africa/Lagos">Africa/Lagos (WAT, UTC+1)</option>
                  <option value="Africa/Abidjan">Africa/Abidjan (GMT, UTC+0)</option>
                  <option value="Africa/Nairobi">Africa/Nairobi (EAT, UTC+3)</option>
                </select>
              </div>
              <div className="form-row">
                <label>Date Format</label>
                <select className="select" value={prefs.dateFormat} onChange={(e) => setPrefs({ ...prefs, dateFormat: e.target.value })}>
                  <option value="DD MMM YYYY">21 May 2026</option>
                  <option value="DD/MM/YYYY">21/05/2026</option>
                  <option value="MM/DD/YYYY">05/21/2026</option>
                  <option value="YYYY-MM-DD">2026-05-21</option>
                </select>
              </div>
              <div className="form-row">
                <label>Currency</label>
                <select className="select" value={prefs.currency} onChange={(e) => setPrefs({ ...prefs, currency: e.target.value })}>
                  <option value="NGN">NGN — Nigerian Naira (₦)</option>
                  <option value="USD">USD — US Dollar ($)</option>
                  <option value="GBP">GBP — British Pound (£)</option>
                </select>
              </div>
              <div className="form-row">
                <label>Number Separator</label>
                <select className="select" value={prefs.decimalSep} onChange={(e) => setPrefs({ ...prefs, decimalSep: e.target.value })}>
                  <option value="point">1,234.56 (comma thousands, point decimal)</option>
                  <option value="comma">1.234,56 (point thousands, comma decimal)</option>
                </select>
              </div>
              <div className="form-row">
                <label>Language</label>
                <select className="select" value={prefs.language} onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}>
                  <option value="en-NG">English (Nigeria)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="yo-NG">Yorùbá</option>
                  <option value="ig-NG">Igbo</option>
                  <option value="ha-NG">Hausa</option>
                </select>
              </div>
              <div className="form-row">
                <label>Fiscal Year Start</label>
                <select className="select" value={prefs.fiscalStart} onChange={(e) => setPrefs({ ...prefs, fiscalStart: e.target.value })}>
                  {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 16 }}>Appearance</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {(["light", "dark", "system"] as const).map((opt) => (
                <div key={opt} onClick={() => setPrefs({ ...prefs, theme: opt })} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  padding: "14px 20px", borderRadius: "var(--radius)", cursor: "pointer",
                  border: `2px solid ${prefs.theme === opt ? "var(--accent)" : "var(--border)"}`,
                  background: prefs.theme === opt ? "var(--accent-subtle)" : "var(--bg-card)",
                  minWidth: 90,
                }}>
                  {opt === "light"  && <Icons.Sun  size={20} style={{ color: prefs.theme === opt ? "var(--accent)" : "var(--fg-muted)" }} />}
                  {opt === "dark"   && <Icons.Moon size={20} style={{ color: prefs.theme === opt ? "var(--accent)" : "var(--fg-muted)" }} />}
                  {opt === "system" && <Icons.Settings size={20} style={{ color: prefs.theme === opt ? "var(--accent)" : "var(--fg-muted)" }} />}
                  <span style={{ fontSize: 12, fontWeight: prefs.theme === opt ? 600 : 400, textTransform: "capitalize", color: prefs.theme === opt ? "var(--accent)" : "var(--fg-muted)" }}>
                    {opt}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 16 }}>Data & Privacy</div>
            <div className="stack-3">
              {[
                { label: "Auto-backup data daily",                    sub: "Encrypted backup to secure cloud storage",                               on: true },
                { label: "Share anonymous usage analytics",            sub: "Helps improve Acre Farm OS — no personal data included",                  on: false },
                { label: "Allow Acre AI to learn from my farm data",   sub: "Improves AI recommendations for your farm profile",                      on: true },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{item.sub}</div>
                  </div>
                  <Toggle on={item.on} onToggle={() => {}} />
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Danger Zone</div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 14 }}>Irreversible actions — proceed with caution</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn danger">Export All Data</button>
              <button className="btn danger">Reset to Defaults</button>
              <button className="btn danger" style={{ marginLeft: "auto" }}>Delete Farm Account</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Billing ──────────────────────────────────────────────────── */}
      {tab === "Billing" && (
        <div className="stack-4">
          <div className="card" style={{ borderColor: "var(--accent)", background: "linear-gradient(135deg, var(--accent-subtle), var(--bg-card))" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span className="badge accent" style={{ fontSize: 11 }}>Current Plan</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: "var(--fg)" }}>Acre Pro</span>
                </div>
                <div className="muted" style={{ fontSize: 13, lineHeight: 1.6 }}>
                  All modules · Up to 10 staff seats · AI insights · WhatsApp automation · Priority support
                </div>
                <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 26, fontWeight: 700, color: "var(--accent)" }}>{naira(49000)}</span>
                  <span className="muted" style={{ fontSize: 13 }}>/month</span>
                </div>
                <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>Next billing date: 1 June 2026 · Auto-renew on</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                <button className="btn accent">Upgrade to Enterprise</button>
                <button className="btn">Manage Subscription</button>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 16 }}>Usage — May 2026</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
              {[
                { label: "Staff Seats",      used: 5,    limit: 10,    unit: "seats",   pct: 50 },
                { label: "Bird Records",      used: 47820, limit: 100000, unit: "records", pct: 48 },
                { label: "API Calls",         used: 8430,  limit: 20000, unit: "calls",   pct: 42 },
                { label: "Storage",           used: 2.4,   limit: 10,   unit: "GB",      pct: 24 },
                { label: "WhatsApp Messages", used: 347,   limit: 1000, unit: "msgs",    pct: 35 },
                { label: "AI Credits",        used: 210,   limit: 500,  unit: "credits", pct: 42 },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                    <span style={{ fontWeight: 500 }}>{item.label}</span>
                    <span className="muted">{typeof item.used === "number" && item.used > 1000 ? (item.used / 1000).toFixed(1) + "k" : item.used} / {typeof item.limit === "number" && item.limit >= 1000 ? (item.limit / 1000).toFixed(0) + "k" : item.limit} {item.unit}</span>
                  </div>
                  <div className="bar">
                    <span style={{ width: `${item.pct}%`, background: item.pct > 80 ? "var(--danger)" : item.pct > 60 ? "var(--warning)" : "var(--accent)" }} />
                  </div>
                  <div style={{ fontSize: 11, color: "var(--fg-faint)", marginTop: 4 }}>{item.pct}% used</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center" }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>Invoice History</span>
              <div className="spacer" />
              <button className="btn sm"><Icons.Download size={12} /> Export CSV</button>
            </div>
            <div className="table-wrap" style={{ border: "none", borderRadius: 0 }}>
              <table className="table">
                <thead><tr><th>Invoice</th><th>Date</th><th>Period</th><th className="num">Amount</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {INVOICES.map((inv) => (
                    <tr key={inv.id}>
                      <td className="id-cell">{inv.id}</td>
                      <td style={{ fontSize: 12 }}>{inv.date}</td>
                      <td style={{ fontSize: 12 }}>{inv.period}</td>
                      <td className="num">{naira(inv.amount)}</td>
                      <td>
                        <span className={`badge ${inv.status === "paid" ? "success" : "warning"}`}>
                          <span className="dot" />{inv.status === "paid" ? "Paid" : "Due"}
                        </span>
                      </td>
                      <td><button className="btn sm ghost"><Icons.Download size={12} /> PDF</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Payment Method</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)", marginBottom: 10 }}>
              <div style={{ fontSize: 20 }}>💳</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Paystack · Card ending 4242</div>
                <div className="muted" style={{ fontSize: 12 }}>Expires 08 / 2028 · Auto-charge enabled</div>
              </div>
              <div className="spacer" />
              <button className="btn sm">Change</button>
            </div>
            <div style={{ fontSize: 12, color: "var(--fg-faint)" }}>
              All payments are processed securely via Paystack. Your card details are never stored on our servers.
            </div>
          </div>
        </div>
      )}

      {/* Invite modal */}
      {showInvite && (
        <InviteModal
          orgId={org?.id ?? ""}
          onClose={() => setShowInvite(false)}
          onSuccess={() => {/* could refresh team list */ }}
        />
      )}
    </div>
  );
}
