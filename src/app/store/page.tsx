"use client";
import { useState } from "react";
import styles from "./store.module.css";

const WA = "2348012345678";
const wa = (msg: string) => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;

function WaIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const PRODUCTS = [
  {
    id: "egg-l",
    category: "eggs",
    name: "Eggs — Large",
    desc: "Farm-fresh large eggs collected every morning from our Lohmann Brown hens. Perfect for households, restaurants, and bulk buyers.",
    price: "₦3,100",
    unit: "per crate · 30 eggs",
    emoji: "🥚",
    bg: "#fffbeb",
    badge: "Best seller",
    msg: "Hi! I'd like to order Large eggs (crates). What's available today?",
  },
  {
    id: "egg-xl",
    category: "eggs",
    name: "Eggs — Extra Large",
    desc: "Jumbo-sized eggs from our premium layer batches. Ideal for bakeries, hotels, and catering operations.",
    price: "₦3,400",
    unit: "per crate · 30 eggs",
    emoji: "🥚",
    bg: "#fef3c7",
    badge: "In stock",
    msg: "Hi! I'd like to order Extra Large eggs. What's the minimum quantity?",
  },
  {
    id: "egg-m",
    category: "eggs",
    name: "Eggs — Medium",
    desc: "Fresh medium eggs — ideal for retail stores, schools, and everyday household cooking.",
    price: "₦2,700",
    unit: "per crate · 30 eggs",
    emoji: "🥚",
    bg: "#fefce8",
    badge: "In stock",
    msg: "Hi! I'd like to order Medium eggs. Can I get pricing for 50+ crates?",
  },
  {
    id: "broiler-dressed",
    category: "broiler",
    name: "Dressed Broiler",
    desc: "Freshly processed and cleaned broiler chicken. Ready to cook. No preservatives, no cold storage.",
    price: "₦3,300",
    unit: "per kg",
    emoji: "🍗",
    bg: "#fff7ed",
    badge: "Fresh daily",
    msg: "Hi! I'd like to order dressed broiler chicken. What sizes and quantities are available?",
  },
  {
    id: "broiler-live",
    category: "broiler",
    name: "Live Broiler",
    desc: "Healthy live broiler birds from our Ross 308 and Cobb 500 batches. 4–6 weeks old, well vaccinated.",
    price: "₦4,800",
    unit: "per bird",
    emoji: "🐔",
    bg: "#f0fdf4",
    badge: "Available",
    msg: "Hi! I'd like to enquire about live broiler birds — minimum order and current price?",
  },
  {
    id: "manure",
    category: "other",
    name: "Poultry Manure",
    desc: "Premium organic poultry manure, bagged and ready. Excellent fertiliser for farms, gardens, and fishponds.",
    price: "₦2,500",
    unit: "per 50 kg bag",
    emoji: "🌱",
    bg: "#f0fdf4",
    badge: "Available",
    msg: "Hi! I'd like to order poultry manure bags. What's the minimum order quantity?",
  },
];

const TESTIMONIALS = [
  {
    initials: "MN",
    name: "Mama Ngozi",
    meta: "Mile 12 Market, Lagos",
    stars: 5,
    text: "I have been buying eggs from Adigwe Family Farms for over 2 years. Always fresh, never cracked. Delivery on time every single week. Very reliable people.",
  },
  {
    initials: "IC",
    name: "Ifeoma Caterers",
    meta: "Event caterers, Abeokuta",
    stars: 5,
    text: "We use their dressed broilers for all our events. The quality is always consistent and the birds are very well-processed. WhatsApp ordering makes it so easy.",
  },
  {
    initials: "FG",
    name: "Festac Grocery Hub",
    meta: "Retail store, Lagos",
    stars: 4,
    text: "Professional and straightforward. Good pricing for quality this high. We buy 60 crates a week and they have never let us down on delivery or freshness.",
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "How do I place an order?",
    a: "Click any 'Order on WhatsApp' button and send us a message. Tell us what you need and your delivery location. We confirm within 30 minutes during business hours (6am–8pm daily).",
  },
  {
    q: "What areas do you deliver to?",
    a: "We deliver daily across Ogun State (Abeokuta, Sagamu, Sango-Ota, Ota) and run Lagos routes Monday, Wednesday, Friday (Mile 12, Ketu) and Tuesday, Thursday, Saturday (Lekki, VI). Ibadan runs every Friday.",
  },
  {
    q: "What is the minimum order?",
    a: "For eggs: minimum 5 crates. For dressed broiler: minimum 10 kg. For live birds: minimum 20 birds. Bulk discounts apply automatically at 50 crates / 100 kg.",
  },
  {
    q: "When will my order arrive?",
    a: "Orders placed before 6pm are dispatched the next morning. Trucks leave the farm by 7am. For Ogun State deliveries you can expect same-morning arrival. Lagos arrives by noon.",
  },
  {
    q: "Do you offer wholesale / bulk pricing?",
    a: "Yes — 50–99 crates: 3% discount. 100+ crates: 7% discount. For recurring weekly bulk orders, speak to us on WhatsApp to arrange a custom pricing agreement.",
  },
  {
    q: "How do I pay?",
    a: "We accept cash on delivery, bank transfer (Zenith Bank), and mobile money via Opay, PalmPay, and Moniepoint. First-time wholesale buyers pay upfront; credit terms are available after two successful orders.",
  },
];

export default function StorePage() {
  const [filter, setFilter] = useState("all");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filtered = filter === "all" ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);

  return (
    <div className={styles.root}>

      {/* ── Topbar ── */}
      <div className={styles.topbar}>
        <span>🌿 Farm-fresh · No preservatives · Daily delivery across Lagos &amp; Ogun State</span>
        <a href={wa("Hi!")} className={styles.topbarWa} target="_blank" rel="noopener noreferrer">
          WhatsApp: 0801 234 5678
        </a>
      </div>

      {/* ── Navbar ── */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <a className={styles.logo} href="#top">
            <div className={styles.logoMark}>A</div>
            <div>
              <div className={styles.logoName}>Adigwe Family Farms</div>
              <div className={styles.logoSub}>Est. 2018 · Ogun State</div>
            </div>
          </a>
          <div className={styles.navSpacer} />
          <div className={styles.navLinks}>
            <a href="#products">Products</a>
            <a href="#how-to-order">How to order</a>
            <a href="#delivery">Delivery</a>
            <a href="#faq">FAQ</a>
          </div>
          <a
            className={styles.navCta}
            href={wa("Hi! I'd like to place an order.")}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WaIcon size={15} /> Order on WhatsApp
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={styles.hero} id="top">
        <div className={styles.heroInner}>
          <div>
            <div className={styles.heroBadge}>
              <span className={styles.liveDot} />
              Farm-fresh produce, collected today
            </div>
            <h1 className={styles.heroTitle}>
              Farm-fresh eggs &amp;<br />poultry, straight<br />to your door
            </h1>
            <p className={styles.heroSub}>
              Order directly from Adigwe Family Farms in Ogun State. No middlemen,
              no cold-storage delays — just honest produce at fair farm-gate prices.
            </p>
            <div className={styles.heroCtas}>
              <a
                className={styles.ctaWa}
                href={wa("Hi! I'd like to place an order from Adigwe Family Farms.")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WaIcon size={19} /> Order on WhatsApp
              </a>
              <a className={styles.ctaOutline} href="#products">Browse products →</a>
            </div>
          </div>

          {/* Live farm stats card */}
          <div className={styles.heroCard}>
            <div className={styles.heroCardTitle}>
              <span className={styles.liveDot} />
              Farm status — Live
            </div>
            {[
              { label: "Eggs collected today",  value: "10,840 eggs",   color: "#4ade80" },
              { label: "Birds on farm",         value: "20,224 birds",  color: "#4ade80" },
              { label: "Active batches",        value: "5 batches",     color: "#4ade80" },
              { label: "Orders dispatched",     value: "8 today",       color: "#fbbf24" },
              { label: "Delivery status",       value: "On schedule",   color: "#4ade80" },
              { label: "Customer rating",       value: "★ 4.6 / 5",     color: "#60a5fa" },
            ].map(s => (
              <div key={s.label} className={styles.heroStatRow}>
                <div className={styles.statDot} style={{ background: s.color }} />
                <div className={styles.heroStatLabel}>{s.label}</div>
                <div className={styles.heroStatValue}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <div className={styles.trustBar}>
        <div className={styles.trustInner}>
          {[
            { val: "2018",   lbl: "Est. in Ogun State" },
            { val: "20,224", lbl: "Live birds on farm" },
            { val: "10,840", lbl: "Eggs per day" },
            { val: "1,000+", lbl: "Weekly orders" },
            { val: "★ 4.6",  lbl: "Customer rating" },
          ].map(t => (
            <div key={t.lbl} className={styles.trustItem}>
              <div className={styles.trustVal}>{t.val}</div>
              <div className={styles.trustLbl}>{t.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Products ── */}
      <section className={styles.section} id="products">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <div className={styles.sectionTag}>Our products</div>
            <h2 className={styles.sectionTitle}>Fresh from the farm to you</h2>
            <p className={styles.sectionSub}>
              Everything is collected and packed the same day. No cold storage, no chemicals
              — just pure farm freshness at prices that make sense.
            </p>
          </div>

          <div className={styles.filterTabs}>
            {[
              { k: "all",     label: "All products" },
              { k: "eggs",    label: "🥚 Eggs" },
              { k: "broiler", label: "🍗 Broiler" },
              { k: "other",   label: "🌱 By-products" },
            ].map(f => (
              <button
                key={f.k}
                className={`${styles.filterTab}${filter === f.k ? " " + styles.filterTabActive : ""}`}
                onClick={() => setFilter(f.k)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className={styles.productsGrid}>
            {filtered.map(p => (
              <div key={p.id} className={styles.productCard}>
                <div className={styles.productCardTop} style={{ background: p.bg }}>
                  <span>{p.emoji}</span>
                  <div className={styles.productTopBadge}>{p.badge}</div>
                </div>
                <div className={styles.productCardBody}>
                  <div className={styles.productName}>{p.name}</div>
                  <div className={styles.productDesc}>{p.desc}</div>
                  <div className={styles.productPriceRow}>
                    <div className={styles.productPrice}>{p.price}</div>
                    <div className={styles.productUnit}>{p.unit}</div>
                  </div>
                  <a
                    className={styles.orderBtn}
                    href={wa(p.msg)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <WaIcon size={15} /> Order on WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How to order ── */}
      <section className={`${styles.section} ${styles.sectionAlt}`} id="how-to-order">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <div className={styles.sectionTag}>Simple process</div>
            <h2 className={styles.sectionTitle}>Order in 3 easy steps</h2>
            <p className={styles.sectionSub}>
              No apps, no accounts, no queues. Just WhatsApp — the fastest way to get
              farm-fresh produce delivered to you.
            </p>
          </div>
          <div className={styles.stepsRow}>
            {[
              {
                n: "1", emoji: "🛒",
                title: "Browse & choose",
                desc: "Look through our products above and decide what you need — eggs, broiler, or by-products.",
              },
              {
                n: "2", emoji: "💬",
                title: "Send a WhatsApp",
                desc: "Tap 'Order on WhatsApp' and tell us your quantity, delivery address, and preferred date.",
              },
              {
                n: "3", emoji: "🚚",
                title: "Receive fresh",
                desc: "We confirm, pack, and dispatch. Ogun arrives same morning. Lagos by noon.",
              },
            ].map(s => (
              <div key={s.n} className={styles.step}>
                <div className={styles.stepNum}>{s.n}</div>
                <div className={styles.stepEmoji}>{s.emoji}</div>
                <div className={styles.stepTitle}>{s.title}</div>
                <div className={styles.stepDesc}>{s.desc}</div>
              </div>
            ))}
          </div>
          <div className={styles.stepsCta}>
            <a
              className={styles.ctaWa}
              href={wa("Hi! I'd like to place an order.")}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex" }}
            >
              <WaIcon size={18} /> Start ordering now
            </a>
          </div>
        </div>
      </section>

      {/* ── Why choose us ── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <div className={styles.sectionTag}>Why Adigwe Farms</div>
            <h2 className={styles.sectionTitle}>The farm difference</h2>
          </div>
          <div className={styles.featuresGrid}>
            {[
              { icon: "🌿", title: "Farm-fresh daily",        desc: "Eggs collected every morning. Broilers processed to order. Nothing sits in cold storage." },
              { icon: "💰", title: "Fair farm-gate prices",   desc: "No middleman markup. You buy directly from us at the most honest prices possible." },
              { icon: "🚚", title: "Same-day delivery (Ogun)",desc: "Order before 6pm and your produce ships the next morning — same day within Ogun State." },
              { icon: "📦", title: "Bulk discounts",          desc: "Better rates for 50+ crates or regular weekly orders. Ask us about wholesale pricing." },
              { icon: "📱", title: "WhatsApp ordering",       desc: "No apps to install, no accounts to create. Order in under 2 minutes via WhatsApp chat." },
              { icon: "✅", title: "Quality guaranteed",      desc: "Not happy with your order? We replace or refund — no questions asked, every time." },
            ].map(f => (
              <div key={f.title} className={styles.feature}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <div className={styles.featureTitle}>{f.title}</div>
                <div className={styles.featureDesc}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <div className={styles.sectionTag}>Customer reviews</div>
            <h2 className={styles.sectionTitle}>What our customers say</h2>
          </div>
          <div className={styles.testimonialsGrid}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} className={styles.testimonialCard}>
                <div className={styles.stars}>{"★".repeat(t.stars)}{"☆".repeat(5 - t.stars)}</div>
                <div className={styles.testimonialText}>{t.text}</div>
                <div className={styles.reviewer}>
                  <div className={styles.reviewerAvatar}>{t.initials}</div>
                  <div>
                    <div className={styles.reviewerName}>{t.name}</div>
                    <div className={styles.reviewerMeta}>{t.meta}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Delivery ── */}
      <section className={styles.section} id="delivery">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <div className={styles.sectionTag}>Delivery coverage</div>
            <h2 className={styles.sectionTitle}>We deliver near you</h2>
            <p className={styles.sectionSub}>
              Daily routes across Lagos and Ogun State. Farm-gate pickup also available
              7 days a week from 6am.
            </p>
          </div>
          <div className={styles.deliveryGrid}>
            {/* Map placeholder */}
            <div className={styles.deliveryMap}>
              <svg viewBox="0 0 460 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
                <rect width="460" height="300" fill="#f0f8f2" />
                <ellipse cx="210" cy="160" rx="190" ry="130" fill="none" stroke="#2e7d40" strokeWidth="1" strokeDasharray="5 4" opacity="0.2" />
                <ellipse cx="210" cy="160" rx="110" ry="76" fill="none" stroke="#2e7d40" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.35" />
                {/* Farm HQ */}
                <circle cx="180" cy="168" r="11" fill="#1f5c2f" />
                <text x="197" y="172" fontSize="11" fill="#1a3a22" fontWeight="700" fontFamily="system-ui">Farm HQ</text>
                {/* Delivery zones */}
                {[
                  { cx: 330, cy:  72, label: "Mile 12",     color: "#25D366" },
                  { cx: 370, cy: 120, label: "Lekki",       color: "#25D366" },
                  { cx: 100, cy:  88, label: "Abeokuta",    color: "#25D366" },
                  { cx: 220, cy: 220, label: "Sango-Ota",   color: "#25D366" },
                  { cx: 300, cy: 210, label: "Ibadan",      color: "#f59e0b" },
                ].map(p => (
                  <g key={p.label}>
                    <line x1="180" y1="168" x2={p.cx} y2={p.cy} stroke={p.color} strokeWidth="1.2" strokeDasharray="4 3" opacity="0.5" />
                    <circle cx={p.cx} cy={p.cy} r="7" fill={p.color} opacity="0.9" />
                    <text x={p.cx + 11} y={p.cy + 4} fontSize="10.5" fill="#374151" fontFamily="system-ui">{p.label}</text>
                  </g>
                ))}
                <text x="14" y="288" fontSize="11" fill="#9ca3af" fontFamily="system-ui">Lagos &amp; Ogun State · Nigeria</text>
              </svg>
            </div>

            <div className={styles.deliveryZones}>
              {[
                { icon: "🚚", name: "Abeokuta & Ogun State",    details: "Daily · arrives by 10am",    badge: "badgeFree", text: "Free delivery" },
                { icon: "🚚", name: "Sango-Ota & environs",      details: "Daily · arrives by 9am",     badge: "badgeFree", text: "Free delivery" },
                { icon: "🚚", name: "Lagos North (Mile 12, Ketu)", details: "Mon / Wed / Fri",           badge: "badgeFree", text: "Free >₦50k" },
                { icon: "🚚", name: "Lekki / Victoria Island",   details: "Tue / Thu / Sat",            badge: "badgeFee",  text: "₦3,500 fee" },
                { icon: "🚚", name: "Ibadan & surroundings",     details: "Friday only",                badge: "badgeFee",  text: "₦5,000 fee" },
                { icon: "📦", name: "Farm gate pickup",          details: "Daily 6am – 6pm · always free", badge: "badgeFree", text: "Always free" },
              ].map(z => (
                <div key={z.name} className={styles.deliveryZone}>
                  <div className={styles.zoneIcon}>{z.icon}</div>
                  <div className={styles.zoneInfo}>
                    <div className={styles.zoneName}>{z.name}</div>
                    <div className={styles.zoneDetails}>{z.details}</div>
                  </div>
                  <div className={`${styles.zoneBadge} ${styles[z.badge as keyof typeof styles]}`}>{z.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className={`${styles.section} ${styles.sectionAlt}`} id="faq">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <div className={styles.sectionTag}>FAQ</div>
            <h2 className={styles.sectionTitle}>Frequently asked questions</h2>
          </div>
          <div className={styles.faqList}>
            {FAQS.map((faq, i) => (
              <div key={i} className={styles.faqItem}>
                <button
                  className={styles.faqQuestion}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{faq.q}</span>
                  <span className={`${styles.faqChevron}${openFaq === i ? " " + styles.faqChevronOpen : ""}`}>▾</span>
                </button>
                {openFaq === i && <div className={styles.faqAnswer}>{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaSectionTitle}>Ready to order farm-fresh produce?</div>
          <div className={styles.ctaSectionSub}>
            Join 100+ customers who order weekly from Adigwe Family Farms.
            No middlemen, no cold storage — just honest, fresh food.
          </div>
          <a
            className={styles.ctaBigBtn}
            href={wa("Hi! I'd like to place an order from Adigwe Family Farms.")}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WaIcon size={22} /> Order on WhatsApp now
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div>
            <div className={styles.footerLogo}>
              <div className={styles.footerLogoMark}>A</div>
              <div>
                <div className={styles.footerLogoName}>Adigwe Family Farms</div>
                <div className={styles.footerLogoSub}>Est. 2018 · Ogun State</div>
              </div>
            </div>
            <div className={styles.footerTagline}>
              Farm-fresh eggs and poultry from our family to yours.
              Ogun State, Nigeria — farming with care since 2018.
            </div>
          </div>

          <div>
            <div className={styles.footerColTitle}>Products</div>
            <div className={styles.footerLinks}>
              <a href="#products">Eggs — Large</a>
              <a href="#products">Eggs — Extra Large</a>
              <a href="#products">Eggs — Medium</a>
              <a href="#products">Dressed Broiler</a>
              <a href="#products">Live Broiler</a>
              <a href="#products">Poultry Manure</a>
            </div>
          </div>

          <div>
            <div className={styles.footerColTitle}>Information</div>
            <div className={styles.footerLinks}>
              <a href="#how-to-order">How to order</a>
              <a href="#delivery">Delivery coverage</a>
              <a href="#faq">FAQ</a>
              <a href={wa("Hi! I'm interested in wholesale pricing.")} target="_blank" rel="noopener noreferrer">Wholesale enquiry</a>
            </div>
          </div>

          <div>
            <div className={styles.footerColTitle}>Contact us</div>
            <div className={styles.footerContact}>
              <div className={styles.footerContactItem}><span>📱</span><span>0801 234 5678 (WhatsApp)</span></div>
              <div className={styles.footerContactItem}><span>📞</span><span>0802 345 6789</span></div>
              <div className={styles.footerContactItem}><span>📍</span><span>Adigwe Farm Road, off Sagamu–Abeokuta Expressway, Ogun State</span></div>
              <div className={styles.footerContactItem}><span>🕐</span><span>Mon–Sat: 6am – 7pm · Sunday: 7am – 3pm</span></div>
            </div>
          </div>
        </div>

        <hr className={styles.footerDivider} />
        <div className={styles.footerBottom}>
          <span>© 2026 Adigwe Family Farms. All rights reserved.</span>
          <span>Powered by <span className={styles.footerAcre}>Acre Farm OS</span></span>
        </div>
      </footer>

    </div>
  );
}
