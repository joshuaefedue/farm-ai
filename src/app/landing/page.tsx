"use client";

import { useState } from "react";
import s from "./landing.module.css";

// ── Data ──────────────────────────────────────────────────────────────────────
const PAIN_CARDS = [
  {
    emoji: "📓",
    title: "Paper records that get lost or soaked",
    desc: "Mortality logs, feed records, and vaccination dates written in notebooks that nobody can find during an audit or disease outbreak.",
  },
  {
    emoji: "📊",
    title: "Spreadsheets that break every week",
    desc: "Multiple Excel files, no single source of truth, formulas that break when a new farm hand updates a cell incorrectly.",
  },
  {
    emoji: "📱",
    title: "Managing your farm over WhatsApp groups",
    desc: "Critical updates buried under group chats. Missed vaccination reminders. No history. No accountability trail.",
  },
  {
    emoji: "🧠",
    title: "Decisions based on gut feel, not data",
    desc: "No feed cost per kg of egg, no FCR tracking, no mortality trend analysis — just a vague sense of whether the farm is profitable.",
  },
];

const FEATURES = [
  {
    group: "🐔 Livestock Management",
    items: [
      { icon: "🐣", title: "Batch Tracking", desc: "Full lifecycle from day-old chick to sale — FCR, mortality, egg rate, weight gain, cost per bird." },
      { icon: "🏠", title: "House Management", desc: "Track occupancy, biosecurity status, temperature and ventilation across all your poultry houses." },
      { icon: "💉", title: "Vaccinations", desc: "Schedule and log every dose. Auto-reminders 48 h before due. Full vaccination history per batch." },
      { icon: "📉", title: "Mortality Tracker", desc: "Daily mortality logs with cause classification. Spike alerts sent instantly to your WhatsApp." },
      { icon: "🥚", title: "Egg Production", desc: "Daily egg collection, lay rate % per batch, broken egg tracking, production forecasting." },
      { icon: "🌾", title: "Feed & Water", desc: "Consumption per house, feed conversion tracking, multi-supplier stock management, low-stock alerts." },
    ],
  },
  {
    group: "⚙️ Operations",
    items: [
      { icon: "📦", title: "Inventory", desc: "Medicines, vaccines, equipment, packaging — real-time stock levels with reorder alerts." },
      { icon: "🛒", title: "Procurement", desc: "Purchase orders, supplier management, RFQs, approval workflows — all tracked end-to-end." },
      { icon: "💰", title: "Finance & P&L", desc: "Revenue, COGS, gross margin per batch. Cash flow, invoice aging, payables dashboard." },
      { icon: "👥", title: "HR & Payroll", desc: "Staff directory, attendance, shift rota, payroll calculation and WhatsApp disbursement." },
      { icon: "🚛", title: "Logistics", desc: "Delivery manifest, fleet tracker, route planning, fuel costs — know where every order is." },
      { icon: "🏷️", title: "Marketplace & CRM", desc: "Manage customers, suppliers, sales channels and publish products to your public storefront." },
    ],
  },
  {
    group: "🤖 AI & Intelligence",
    items: [
      { icon: "🧠", title: "AI Insights", desc: "Acre AI monitors your farm 24/7, flags anomalies and recommends actions before problems escalate." },
      { icon: "📈", title: "Revenue Forecast", desc: "ML-powered 30-day revenue and mortality forecasts based on your farm's own historical data." },
      { icon: "🔔", title: "Smart Automations", desc: "Auto-send vaccination reminders, daily summaries, order confirmations and overdue invoice nudges via WhatsApp." },
      { icon: "🛡️", title: "Disease Watch", desc: "Live NAFDAC disease alerts for your state. Biosecurity checklists and outbreak proximity warnings." },
    ],
  },
];

const TESTIMONIALS = [
  {
    initials: "OA",
    bg: "#2E7D45",
    name: "Oluwaseun Adeyemi",
    meta: "3,800-bird layer farm · Ibadan, Oyo State",
    stars: 5,
    quote: "Before Acre, I was running my farm on three different WhatsApp groups and an Excel sheet my nephew made. We were losing ₦200,000 a month to feed wastage we couldn't even see. <strong>After 60 days on Acre, our FCR dropped from 2.4 to 1.97.</strong> The feed cost tracking alone paid for the subscription 10 times over.",
  },
  {
    initials: "CU",
    bg: "#1a3a22",
    name: "Chidinma Uzodinma",
    meta: "12,000-bird broiler operation · Enugu State",
    stars: 5,
    quote: "The vaccination reminders saved us from a Gumboro outbreak that hit two farms near us last quarter. Acre flagged a mortality pattern three days before we would have noticed ourselves. <strong>We avoided an estimated ₦1.8M in losses.</strong> It's not just software — it thinks like a vet.",
  },
  {
    initials: "BA",
    bg: "#c8973a",
    name: "Bello Abubakar",
    meta: "Dual-purpose farm, 6,500 birds · Kano State",
    stars: 5,
    quote: "I was sceptical about paying a monthly fee when I already had WhatsApp. But the WhatsApp integration is actually the best part — <strong>my staff log data from the farm and it goes straight into the system.</strong> No extra app to install. Now I see my P&L in real-time from Abuja when I travel.",
  },
];

const PRICING = [
  {
    name: "Starter",
    desc: "For small farms just getting started with digital records.",
    price: "Free",
    per: "forever",
    cta: "Get started",
    ctaStyle: "outline",
    popular: false,
    features: ["Up to 2,000 birds", "1 farm / 1 user", "Batch & mortality tracking", "Basic feed logs", "WhatsApp alerts (10/mo)", "7-day data history"],
  },
  {
    name: "Pro",
    desc: "Everything you need to run a serious poultry business.",
    price: "₦49,000",
    per: "/month",
    cta: "Start free 14-day trial",
    ctaStyle: "fill",
    popular: true,
    features: ["Unlimited birds", "Up to 10 staff seats", "All 16 ERP modules", "AI insights & forecasting", "WhatsApp automations (unlimited)", "Public storefront", "Priority support", "Supabase real-time sync"],
  },
  {
    name: "Enterprise",
    desc: "For large multi-farm operations with custom needs.",
    price: "Custom",
    per: "",
    cta: "Talk to us",
    ctaStyle: "dark",
    popular: false,
    features: ["Unlimited farms & seats", "Custom integrations", "Dedicated account manager", "On-premise option", "SLA guarantee", "White-label available", "Staff training sessions", "Custom AI models"],
  },
];

const FAQS = [
  {
    q: "Do I need technical knowledge to set up Acre?",
    a: "Not at all. The onboarding wizard walks you through setup in under 5 minutes. You just enter your farm name, location and bird capacity — Acre creates your entire workspace and pre-fills demo data so you can explore immediately. No servers to configure, no code to write.",
  },
  {
    q: "How does the WhatsApp integration work?",
    a: "Acre connects to the official WhatsApp Business API. Your staff can send daily logs directly from the field via WhatsApp, and the ERP captures them automatically. Customers receive order confirmations, and you get instant alerts for mortality spikes, low stock and vaccination reminders — all on the WhatsApp number you already use.",
  },
  {
    q: "Is my data safe? Can other farms see my data?",
    a: "Your data is completely isolated. Acre uses Supabase Row-Level Security (RLS) — a database-level guarantee that no other farm can ever access your records, even if there's a bug in the application layer. Your data is encrypted at rest and in transit, backed up daily.",
  },
  {
    q: "Can I use Acre without an internet connection?",
    a: "The web dashboard requires internet. However, your staff can send WhatsApp messages from the field even on 2G — those logs sync to the system when connectivity is restored. We're also building an offline-capable mobile app.",
  },
  {
    q: "What happens when I outgrow the Starter plan?",
    a: "Upgrading takes one click. All your existing data migrates instantly to Pro — there's no migration, export or re-entry needed. Your full history stays intact.",
  },
  {
    q: "Do you support catfish, snail or crop farms?",
    a: "Poultry is fully live. Fish (catfish/tilapia) and snail farming modules are in beta and available on request. Crop management is on the roadmap for Q4 2026. Contact us if you need early access.",
  },
];

const STATS = [
  { num: "94", suffix: "%", label: "reduction in missed\nvaccinations" },
  { num: "3.2", suffix: "h", label: "saved daily on\nrecord-keeping" },
  { num: "₦2.4M", suffix: "", label: "avg. monthly revenue\ntracked per farm" },
  { num: "18", suffix: "%", label: "average improvement\nin FCR" },
];

// ── Sub-components ────────────────────────────────────────────────────────────
function Stars({ n }: { n: number }) {
  return (
    <div className={s.testStars}>
      {Array.from({ length: n }).map((_, i) => <span key={i}>★</span>)}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
      <circle cx="7" cy="7" r="7" fill="#2E7D45" fillOpacity="0.15" />
      <path d="M4 7l2 2 4-4" stroke="#2E7D45" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WaIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 1.89.524 3.66 1.438 5.168L2 22l4.998-1.406A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.96 7.96 0 01-4.073-1.113l-.292-.174-3.026.85.847-3.088-.19-.3A7.96 7.96 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z" />
    </svg>
  );
}

// ── Dashboard mockup ─────────────────────────────────────────────────────────
function ProductMock() {
  return (
    <div className={s.previewWrap}>
      <div className={s.previewShell}>
        {/* Title bar */}
        <div className={s.previewBar}>
          <div className={s.previewDot} style={{ background: "#ff5f57" }} />
          <div className={s.previewDot} style={{ background: "#febc2e" }} />
          <div className={s.previewDot} style={{ background: "#28c840" }} />
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <div style={{ width: 160, height: 16, background: "rgba(255,255,255,0.07)", borderRadius: 4 }} />
          </div>
        </div>

        <div className={s.previewBody}>
          {/* Sidebar */}
          <div className={s.previewSidebar}>
            <div style={{ height: 28, marginBottom: 8, display: "flex", alignItems: "center", gap: 6, padding: "0 10px" }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, background: "#2E7D45" }} />
              <div style={{ width: 60, height: 8, background: "rgba(255,255,255,0.2)", borderRadius: 3 }} />
            </div>
            {["Overview","Poultry","Batches","Houses","Feed","Vaccinations","Sales","Inventory","Finance","HR & Payroll","CRM","AI"].map((item, i) => (
              <div key={item} className={`${s.previewSideItem} ${i === 2 ? s.active : ""}`}>
                {i === 2 && <div className={s.previewSideDot} />}
                {item}
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className={s.previewMain}>
            {/* KPI row */}
            <div className={s.previewKpiRow}>
              {[
                { w: "55%", tw: "65%", green: true },
                { w: "60%", tw: "70%", green: true },
                { w: "50%", tw: "58%", green: false },
                { w: "45%", tw: "62%", green: true },
              ].map((k, i) => (
                <div key={i} className={s.previewKpi}>
                  <div className={s.previewKpiLabel} style={{ width: k.w }} />
                  <div className={s.previewKpiVal} style={{ width: k.tw }} />
                  <div className={s.previewKpiTrend} style={{ background: k.green ? "rgba(61,155,87,0.5)" : "rgba(185,52,38,0.4)" }} />
                </div>
              ))}
            </div>

            {/* Table */}
            <div className={s.previewTable}>
              <div className={s.previewTableHead}>
                {[60, 45, 40, 50, 38, 42].map((w, i) => (
                  <div key={i} className={s.previewTableHeadCell} style={{ width: w, flex: i === 0 ? "1" : undefined }} />
                ))}
              </div>
              {[
                [true,  "70%", "55%", "48%", "60%"],
                [false, "65%", "60%", "52%", "55%"],
                [true,  "72%", "50%", "45%", "58%"],
                [false, "68%", "58%", "50%", "62%"],
                [true,  "75%", "45%", "38%", "50%"],
              ].map((row, ri) => (
                <div key={ri} className={s.previewTableRow}>
                  <div className={s.previewCell} style={{ flex: 1, background: "rgba(255,255,255,0.14)" }} />
                  {(row.slice(1) as string[]).map((w, ci) => (
                    <div key={ci} className={s.previewCell} style={{ width: w }} />
                  ))}
                  <div className={s.previewBadge} style={{ width: 48, background: row[0] ? "rgba(61,155,87,0.25)" : "rgba(185,52,38,0.2)" }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className={s.root}>

      {/* ── Nav ── */}
      <nav className={s.nav}>
        <div className={s.navInner}>
          <a href="/" className={s.logo}>
            <div className={s.logoBadge}>A</div>
            <div>
              <div className={s.logoText}>Acre</div>
              <div className={s.logoSub}>Farm OS</div>
            </div>
          </a>
          <div className={s.navLinks}>
            <a href="#features"   className={s.navLink}>Features</a>
            <a href="#how"        className={s.navLink}>How it works</a>
            <a href="#pricing"    className={s.navLink}>Pricing</a>
            <a href="#faq"        className={s.navLink}>FAQ</a>
          </div>
          <div className={s.navActions}>
            <a href="/login"    className={s.btnGhost}>Sign in</a>
            <a href="/signup"   className={s.btnPrimary}>Start for free →</a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={s.hero}>
        <div className={s.heroBg} />
        <div className={s.heroInner}>
          <div className={s.heroBadge}>
            <div className={s.heroBadgeDot} />
            🌿 Built for Nigerian Poultry Farm Owners
          </div>

          <h1 className={s.heroH1}>
            The Operating System<br />
            for <em>Modern Poultry Farms</em>
          </h1>

          <p className={s.heroSub}>
            Manage your entire farm — batches, feed, sales, payroll, vaccinations, AI insights —
            from one dashboard. Stop losing money to spreadsheets and WhatsApp chaos.
          </p>

          <div className={s.heroCtas}>
            <a href="/signup" className={s.ctaBig}>
              🌿 Start for free — no credit card
            </a>
            <a href="/app" className={s.ctaOutline}>
              → See the dashboard live
            </a>
          </div>

          <div className={s.heroStats}>
            {[
              { num: "500K+", label: "Birds tracked\nacross all farms" },
              { num: "16",    label: "Integrated\nmodules" },
              { num: "₦47M+", label: "Orders processed\nthis month" },
              { num: "< 5min", label: "Setup time\nfrom zero" },
            ].map((stat) => (
              <div key={stat.label} className={s.heroStatItem}>
                <div className={s.heroStatNum}>{stat.num}</div>
                <div className={s.heroStatLabel} style={{ whiteSpace: "pre-line" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product preview ── */}
      <ProductMock />

      {/* ── Trust bar ── */}
      <div className={s.trustBar}>
        <div className={s.trustInner}>
          <span className={s.trustLabel}>Trusted by farms in</span>
          {["Lagos","Ogun","Oyo","Enugu","Kano","Rivers","FCT"].map((state) => (
            <div key={state} className={s.trustItem}>
              <span className={s.trustIcon}>📍</span> {state} State
            </div>
          ))}
        </div>
      </div>

      {/* ── Pain section ── */}
      <section className={s.sectionAlt}>
        <div className={s.inner}>
          <div className={s.sectionLabel}>⚠️ The problem</div>
          <h2 className={s.sectionTitle}>
            Your farm is growing.<br />Your tools are not.
          </h2>
          <p className={s.sectionSub}>
            Most Nigerian poultry farms lose 15–25% of potential profit every year
            to problems that better data would have caught. Sound familiar?
          </p>
          <div className={s.painGrid}>
            {PAIN_CARDS.map((card) => (
              <div key={card.title} className={s.painCard}>
                <div className={s.painEmoji}>{card.emoji}</div>
                <div>
                  <div className={s.painTitle}>{card.title}</div>
                  <div className={s.painDesc}>{card.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className={s.painVs}>
            <div style={{ flex: 1 }}>
              <div className={s.painVsLabel}>Without Acre</div>
              <div className={s.painVsVal}>❌ Reactive. Guessing.</div>
            </div>
            <div className={s.painVsDivider} />
            <div style={{ flex: 1 }}>
              <div className={s.painVsLabel}>With Acre</div>
              <div className={s.painVsVal}>✅ Proactive. Data-driven.</div>
            </div>
            <div className={s.painVsDivider} />
            <div style={{ flex: 1 }}>
              <div className={s.painVsLabel}>Average uplift</div>
              <div className={s.painVsVal} style={{ color: "#f5ca55" }}>+18% net margin</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className={s.section} id="features">
        <div className={s.inner}>
          <div className={s.sectionLabel}>✦ Features</div>
          <h2 className={s.sectionTitle}>Everything your farm needs,<br />in one place</h2>
          <p className={s.sectionSub}>
            16 integrated modules designed specifically for Nigerian poultry operations.
            No irrelevant features. No missing ones.
          </p>
          {FEATURES.map((group) => (
            <div key={group.group} className={s.featGroup}>
              <div className={s.featGroupLabel}>{group.group}</div>
              <div className={s.featGrid}>
                {group.items.map((f) => (
                  <div key={f.title} className={s.featCard}>
                    <div className={s.featIcon}>{f.icon}</div>
                    <div className={s.featTitle}>{f.title}</div>
                    <div className={s.featDesc}>{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className={s.sectionAlt} id="how">
        <div className={s.inner}>
          <div className={`${s.sectionLabel} ${s.centered}`} style={{ display: "flex", justifyContent: "center" }}>
            ⚡ How it works
          </div>
          <h2 className={`${s.sectionTitle} ${s.centered}`}>Up and running in 5 minutes</h2>
          <p className={`${s.sectionSub} ${s.centered} ${s.centeredSub}`}>
            No IT setup. No migration headaches. Just sign up and start managing your farm.
          </p>
          <div className={s.stepsRow}>
            {[
              {
                n: "1",
                title: "Create your account",
                desc: "Sign up with your email. Verify in one click. Your farm dashboard is instantly ready — no waiting, no forms, no sales calls.",
                time: "60 seconds",
              },
              {
                n: "2",
                title: "Set up your farm",
                desc: "Enter your farm name and location. Choose to load demo data (recommended) or start blank. Acre creates your houses, configures WhatsApp alerts and sets up your team.",
                time: "3 minutes",
              },
              {
                n: "3",
                title: "Invite your team & go live",
                desc: "Add farm managers, vets and sales staff with one-click invites. They get instant access on their phones — no app download required, just WhatsApp.",
                time: "1 minute",
              },
            ].map((step) => (
              <div key={step.n} className={s.step}>
                <div className={s.stepNum}>{step.n}</div>
                <div className={s.stepTitle}>{step.title}</div>
                <div className={s.stepDesc}>{step.desc}</div>
                <span className={s.stepTime}>⏱ {step.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className={s.sectionDark}>
        <div className={s.inner}>
          <div className={`${s.sectionLabel} ${s.sectionLabelDark} ${s.centered}`} style={{ display: "flex", justifyContent: "center" }}>
            📊 Results
          </div>
          <h2 className={`${s.sectionTitle} ${s.sectionTitleDark} ${s.centered}`} style={{ marginBottom: 48 }}>
            Real results from real farms
          </h2>
          <div className={s.statsGrid}>
            {STATS.map((stat) => (
              <div key={stat.label} className={s.statCell}>
                <div className={s.statNum}>
                  {stat.num}<span>{stat.suffix}</span>
                </div>
                <div className={s.statLabel} style={{ whiteSpace: "pre-line" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className={s.section}>
        <div className={s.inner}>
          <div className={`${s.sectionLabel} ${s.centered}`} style={{ display: "flex", justifyContent: "center" }}>
            💬 Testimonials
          </div>
          <h2 className={`${s.sectionTitle} ${s.centered}`}>Farm owners love Acre</h2>
          <p className={`${s.sectionSub} ${s.centered} ${s.centeredSub}`} style={{ marginBottom: 40 }}>
            Join hundreds of farm owners already running smarter operations.
          </p>
          <div className={s.testGrid}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className={s.testCard}>
                <Stars n={t.stars} />
                <p
                  className={s.testQuote}
                  dangerouslySetInnerHTML={{ __html: `"${t.quote}"` }}
                />
                <div className={s.testAuthor}>
                  <div className={s.testAvatar} style={{ background: t.bg }}>{t.initials}</div>
                  <div>
                    <div className={s.testName}>{t.name}</div>
                    <div className={s.testMeta}>{t.meta}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className={s.sectionAlt} id="pricing">
        <div className={s.inner}>
          <div className={`${s.sectionLabel} ${s.centered}`} style={{ display: "flex", justifyContent: "center" }}>
            💳 Pricing
          </div>
          <h2 className={`${s.sectionTitle} ${s.centered}`}>Simple, transparent pricing</h2>
          <p className={`${s.sectionSub} ${s.centered} ${s.centeredSub}`} style={{ marginBottom: 40 }}>
            Start free. Scale as you grow. Cancel any time.
          </p>
          <div className={s.pricingGrid}>
            {PRICING.map((plan) => (
              <div key={plan.name} className={`${s.pricingCard}${plan.popular ? " " + s.popular : ""}`}>
                <div className={s.pricingTop}>
                  {plan.popular && <div className={s.pricingBadge}>Most Popular</div>}
                  <div className={s.pricingName}>{plan.name}</div>
                  <div className={s.pricingDesc}>{plan.desc}</div>
                  <div className={s.pricingPrice}>
                    <span className={s.pricingAmount}>{plan.price}</span>
                    {plan.per && <span className={s.pricingPer}>{plan.per}</span>}
                  </div>
                </div>
                <a
                  href={plan.ctaStyle === "dark" ? "mailto:hello@acrefarms.ng" : "/signup"}
                  className={`${s.pricingCta} ${
                    plan.ctaStyle === "fill" ? s.pricingCtaFill :
                    plan.ctaStyle === "dark" ? s.pricingCtaDark :
                    s.pricingCtaOutline
                  }`}
                >
                  {plan.cta}
                </a>
                <div className={s.pricingFeatures}>
                  <div className={s.pricingFeatTitle}>Includes</div>
                  {plan.features.map((f) => (
                    <div key={f} className={s.pricingFeat}>
                      <span className={s.pricingFeatCheck}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className={s.section} id="faq">
        <div className={s.inner}>
          <div className={`${s.sectionLabel} ${s.centered}`} style={{ display: "flex", justifyContent: "center" }}>
            ❓ FAQ
          </div>
          <h2 className={`${s.sectionTitle} ${s.centered}`} style={{ marginBottom: 40 }}>
            Questions? We have answers.
          </h2>
          <div className={s.faqList}>
            {FAQS.map((faq, i) => (
              <div key={i} className={s.faqItem}>
                <button
                  className={s.faqQ}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {faq.q}
                  <span className={`${s.faqChevron}${openFaq === i ? " " + s.faqChevronOpen : ""}`}>
                    ▾
                  </span>
                </button>
                {openFaq === i && (
                  <div className={s.faqA}>{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className={s.section} style={{ paddingTop: 0 }}>
        <div style={{ maxWidth: 1148, margin: "0 auto" }}>
          <div className={s.ctaBanner}>
            <div className={s.ctaBannerBg} />
            <div className={s.ctaBannerInner}>
              <h2 className={s.ctaBannerTitle}>
                Ready to run your farm<br />like a business?
              </h2>
              <p className={s.ctaBannerSub}>
                Join 200+ farm owners already using Acre to track every bird,
                prevent losses and grow their margins.
              </p>
              <div className={s.ctaBannerActions}>
                <a href="/signup" className={s.ctaBig2}>
                  🌿 Create your free account
                </a>
                <a
                  href="https://wa.me/2348012345678?text=Hi%2C%20I%20want%20to%20learn%20about%20Acre%20Farm%20OS"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s.ctaOutline}
                >
                  <WaIcon size={15} /> Chat on WhatsApp
                </a>
              </div>
              <div className={s.ctaSubNote}>
                No credit card · 14-day Pro trial · Cancel any time
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <div className={s.footerGrid}>
            <div className={s.footerBrand}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: "#2E7D45", display: "grid", placeItems: "center", color: "white", fontWeight: 800, fontSize: 14 }}>A</div>
                <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 700, fontSize: 15 }}>Acre Farm OS</span>
              </div>
              <p className={s.footerTagline}>
                The operating system for modern Nigerian poultry farms. Built with love in Lagos.
              </p>
              <a
                href="https://wa.me/2348012345678"
                target="_blank"
                rel="noopener noreferrer"
                className={s.footerWa}
              >
                <WaIcon size={13} /> WhatsApp support
              </a>
            </div>
            <div>
              <div className={s.footerColTitle}>Product</div>
              <a href="#features" className={s.footerLink}>Features</a>
              <a href="#pricing"  className={s.footerLink}>Pricing</a>
              <a href="/store"    className={s.footerLink}>Farm Store</a>
              <a href="/app"      className={s.footerLink}>Dashboard</a>
              <a href="/signup"   className={s.footerLink}>Sign up free</a>
            </div>
            <div>
              <div className={s.footerColTitle}>Resources</div>
              <a href="#how"  className={s.footerLink}>How it works</a>
              <a href="#faq"  className={s.footerLink}>FAQ</a>
              <a href="#"     className={s.footerLink}>Blog (coming soon)</a>
              <a href="#"     className={s.footerLink}>API docs</a>
              <a href="#"     className={s.footerLink}>Changelog</a>
            </div>
            <div>
              <div className={s.footerColTitle}>Company</div>
              <a href="#"  className={s.footerLink}>About us</a>
              <a href="#"  className={s.footerLink}>Careers</a>
              <a href="mailto:hello@acrefarms.ng" className={s.footerLink}>hello@acrefarms.ng</a>
              <a href="#"  className={s.footerLink}>Privacy policy</a>
              <a href="#"  className={s.footerLink}>Terms of service</a>
            </div>
          </div>
          <div className={s.footerBottom}>
            <div className={s.footerCopy}>
              © 2026 Acre Farm OS. Made for Nigerian farm owners. 🌿
            </div>
            <div className={s.footerBottomLinks}>
              <a href="#" className={s.footerBottomLink}>Privacy</a>
              <a href="#" className={s.footerBottomLink}>Terms</a>
              <a href="#" className={s.footerBottomLink}>Cookies</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
