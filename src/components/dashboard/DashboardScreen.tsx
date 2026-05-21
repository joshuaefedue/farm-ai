"use client";

import { BATCHES, ALERTS, ORDERS, DAILY_SERIES, TODAY } from "@/lib/data";
import { naira, num, ageOf } from "@/lib/utils";
import { KpiCard } from "@/components/atoms/KpiCard";
import { AlertRow } from "@/components/atoms/AlertRow";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { DualLineChart } from "@/components/charts/DualLineChart";
import { Icons, IconName } from "@/components/icons";
import { cn } from "@/lib/utils";

function Card({ children, className, noPad }: { children: React.ReactNode; className?: string; noPad?: boolean }) {
  return (
    <div className={cn("bg-card shadow-card rounded overflow-hidden", !noPad && "p-5", className)}>
      {children}
    </div>
  );
}

function CardHeader({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <div className="text-base font-semibold text-fg">{title}</div>
        {sub && <div className="text-xs text-muted mt-0.5">{sub}</div>}
      </div>
      {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
    </div>
  );
}

function Section({ label }: { label: string }) {
  return <div className="text-xs font-semibold text-muted uppercase tracking-[0.05em] mt-1 mb-2">{label}</div>;
}

const orderStatusVariant = {
  pending:          "warning",
  confirmed:        "accent",
  out_for_delivery: "info",
  delivered:        "success",
} as const;

const orderStatusLabel = {
  pending:          "Pending",
  confirmed:        "Confirmed",
  out_for_delivery: "Out for delivery",
  delivered:        "Delivered",
} as const;

const batchTypeVariant = {
  layer:  "accent",
  broiler: "warning",
  dual:   "info",
} as const;

export function DashboardScreen({ setRoute }: { setRoute: (r: string) => void }) {
  const eggsToday = DAILY_SERIES[29][0];
  const mortalityToday = DAILY_SERIES[29][1];
  const totalBirds = BATCHES.filter((b) => b.status !== "sold").reduce((s, b) => s + b.currentCount, 0);
  const ordersOpen = ORDERS.filter((o) => ["pending", "confirmed", "out_for_delivery"].includes(o.status)).length;
  const revenue30 = ORDERS.reduce((s, o) => s + o.subtotal, 0);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-5">

        {/* ── Page header ─────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-fg">Good morning, Tunde</h1>
            <div className="text-sm text-muted mt-1">
              Wed 13 May 2026 · Ogun State · 27°C · Light rain expected at 3pm
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="default">
              <Icons.Download size={13} /> Daily report
            </Button>
            <Button variant="accent">
              <Icons.Sparkles size={13} /> Ask Acre AI
            </Button>
          </div>
        </div>

        {/* ── KPI row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-3">
          <KpiCard
            label="Live birds"
            value={num(totalBirds)}
            trend="+1,944 last 30d"
            trendDir="up"
            sparkData={[19500, 19600, 19700, 19720, 19800, 19900, 20000, 20100, 20200, 20224]}
          />
          <KpiCard
            label="Eggs today"
            value={num(eggsToday)}
            unit="eggs · 361 crates"
            trend="+2.9% vs 7-day avg"
            trendDir="up"
            sparkData={DAILY_SERIES.slice(-14).map((d) => d[0])}
          />
          <KpiCard
            label="Mortality today"
            value={String(mortalityToday)}
            unit="birds · 0.08%"
            trend="+33% vs 7-day avg"
            trendDir="down"
            sparkData={DAILY_SERIES.slice(-14).map((d) => d[1])}
            sparkColor="var(--danger)"
          />
          <KpiCard
            label="Revenue MTD"
            value={naira(revenue30)}
            trend="+₦620k vs Apr to-date"
            trendDir="up"
            sparkData={[3.1, 3.3, 3.5, 3.7, 4.0, 4.2, 4.5, 4.9, 5.2, 5.6, 6.0, 6.6]}
          />
        </div>

        {/* ── Production chart + Alerts ─────────────────────────────── */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "1.65fr 1fr" }}>

          {/* Production chart */}
          <Card>
            <CardHeader
              title="Production · last 30 days"
              sub="Eggs collected vs mortality across all batches"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <span className="inline-block w-6 h-0.5 bg-accent rounded" />
                  Eggs
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <span className="inline-block w-6 h-0.5 bg-danger rounded" />
                  Mortality
                </div>
                <div className="flex rounded-sm overflow-hidden border border-border">
                  {["7d", "30d", "90d"].map((l) => (
                    <button
                      key={l}
                      className={cn(
                        "px-2.5 py-1 text-xs font-medium transition-colors",
                        l === "30d"
                          ? "bg-fg text-card"
                          : "bg-card text-muted hover:bg-hover"
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>

            <div style={{ height: 240 }}>
              <DualLineChart data={DAILY_SERIES} height={240} />
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-muted border-t border-border pt-3">
              <span>
                Avg lay rate <span className="tnum font-semibold text-fg">87.2%</span> · target{" "}
                <span className="tnum">85%</span>
              </span>
              <span>
                Cum. mortality <span className="tnum font-semibold text-fg">261</span> · 7-day avg{" "}
                <span className="tnum">9.8/day</span>
              </span>
              <span>
                FCR avg <span className="tnum font-semibold text-fg">1.94</span>
              </span>
            </div>
          </Card>

          {/* Alerts */}
          <Card noPad>
            <div className="px-4 pt-4 pb-3 flex items-start justify-between border-b border-border">
              <div>
                <div className="text-base font-semibold text-fg">Alerts & follow-ups</div>
                <div className="text-xs text-muted mt-0.5">3 require action today</div>
              </div>
              <Button variant="ghost" size="sm">View all</Button>
            </div>
            {ALERTS.map((a, i) => (
              <AlertRow
                key={a.id}
                level={a.level}
                icon={a.icon as IconName}
                title={a.title}
                meta={a.meta}
                time={a.time}
                last={i === ALERTS.length - 1}
              />
            ))}
          </Card>
        </div>

        {/* ── Farm pulse + Open orders ─────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">

          {/* Farm pulse */}
          <Card noPad>
            <div className="px-5 pt-4 pb-3 flex items-start justify-between border-b border-border">
              <div>
                <div className="text-base font-semibold text-fg">Farm pulse · by module</div>
                <div className="text-xs text-muted mt-0.5">Revenue today across activated modules</div>
              </div>
              <Badge variant="outline">3 of 4 active</Badge>
            </div>

            {/* Poultry — active */}
            <div
              className="flex items-center gap-3 px-5 py-3 border-b border-border cursor-pointer hover:bg-hover transition-colors"
              onClick={() => setRoute("batches")}
            >
              <div className="w-9 h-9 rounded-lg bg-accent-subtle text-accent flex items-center justify-center shrink-0">
                <Icons.Chick size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-fg">Poultry</div>
                <div className="text-xs text-muted">20,224 birds · 6 batches · 5 houses live</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-fg tnum">{naira(1840000)}</div>
                <div className="flex items-center justify-end gap-1 text-xs text-success mt-0.5">
                  <Icons.TrendUp size={11} /> +12.3%
                </div>
              </div>
            </div>

            {/* Fish — inactive */}
            {[
              { icon: <Icons.Fish size={18} />, name: "Fish farming", sub: "Setup in progress · 4 ponds planned", pill: "Pilot", color: "bg-info-subtle text-info" },
              { icon: <Icons.Snail size={18} />, name: "Snail farming", sub: "Module not activated", color: "bg-subtle text-muted" },
              { icon: <Icons.Crops size={18} />, name: "Crops", sub: "Module not activated", color: "bg-subtle text-muted" },
            ].map((m) => (
              <div key={m.name} className="flex items-center gap-3 px-5 py-3 border-b border-border last:border-0 opacity-55">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", m.color)}>
                  {m.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-fg flex items-center gap-2">
                    {m.name}
                    {m.pill && <Badge variant="info">{m.pill}</Badge>}
                  </div>
                  <div className="text-xs text-muted">{m.sub}</div>
                </div>
                <Button size="sm">{m.pill ? "Configure" : "Activate"}</Button>
              </div>
            ))}
          </Card>

          {/* Open orders */}
          <Card noPad>
            <div className="px-5 pt-4 pb-3 flex items-start justify-between border-b border-border">
              <div>
                <div className="text-base font-semibold text-fg">Today&apos;s open orders</div>
                <div className="text-xs text-muted mt-0.5">{ordersOpen} orders awaiting fulfilment</div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setRoute("sales")}>
                Sales →
              </Button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Order", "Customer", "Channel", "Amount", "Status"].map((h) => (
                    <th
                      key={h}
                      className={cn(
                        "px-4 py-2.5 text-left text-2xs font-semibold text-muted uppercase tracking-[0.05em]",
                        h === "Amount" && "text-right"
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ORDERS.filter((o) => o.status !== "delivered")
                  .slice(0, 5)
                  .map((o, i, arr) => (
                    <tr
                      key={o.id}
                      className={cn("hover:bg-hover transition-colors", i < arr.length - 1 && "border-b border-border")}
                    >
                      <td className="px-4 py-2.5 text-xs font-mono text-accent">{o.id}</td>
                      <td className="px-4 py-2.5 text-sm text-fg max-w-[140px] truncate">{o.customer}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant="outline" className="gap-1">
                          {o.channel === "WhatsApp" && <Icons.WhatsApp size={10} />}
                          {o.channel}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-right tnum text-sm font-medium text-fg">
                        {naira(o.subtotal)}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant={orderStatusVariant[o.status]}>
                          {orderStatusLabel[o.status]}
                        </Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* ── Active batches + Coop + AI insights ─────────────────── */}
        <div className="grid grid-cols-2 gap-4">

          {/* Active batches */}
          <Card noPad>
            <div className="px-5 pt-4 pb-3 flex items-start justify-between border-b border-border">
              <div>
                <div className="text-base font-semibold text-fg">Active batches</div>
                <div className="text-xs text-muted mt-0.5">Profitability snapshot · sortable in Poultry → Batches</div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setRoute("batches")}>Open →</Button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {[["Batch", ""], ["House", ""], ["Birds", "right"], ["Age", "right"], ["FCR", "right"], ["Mortality", "right"]].map(([h, align]) => (
                    <th
                      key={h}
                      className={cn(
                        "px-4 py-2.5 text-2xs font-semibold text-muted uppercase tracking-[0.05em]",
                        align === "right" ? "text-right" : "text-left"
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BATCHES.filter((b) => b.status !== "sold")
                  .slice(0, 5)
                  .map((b, i, arr) => {
                    const age = ageOf(b.arrival, TODAY);
                    return (
                      <tr
                        key={b.id}
                        onClick={() => setRoute("batch:" + b.id)}
                        className={cn(
                          "cursor-pointer hover:bg-hover transition-colors",
                          i < arr.length - 1 && "border-b border-border"
                        )}
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <Badge variant={batchTypeVariant[b.type]}>{b.type}</Badge>
                            <span className="text-xs font-mono text-accent">{b.id}</span>
                          </div>
                          <div className="text-2xs text-faint font-mono mt-0.5">{b.breed}</div>
                        </td>
                        <td className="px-4 py-2.5 text-sm text-muted">{b.house}</td>
                        <td className="px-4 py-2.5 text-right tnum text-sm">{num(b.currentCount)}</td>
                        <td className="px-4 py-2.5 text-right tnum text-sm text-muted">{age}d</td>
                        <td className="px-4 py-2.5 text-right tnum text-sm">{b.fcr}</td>
                        <td className="px-4 py-2.5 text-right tnum text-sm">
                          <span className={b.mortalityPct > 3.5 ? "text-danger font-medium" : ""}>
                            {b.mortalityPct.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </Card>

          {/* Right column: Coop pricing + AI insights */}
          <div className="flex flex-col gap-4">

            {/* Cooperative pricing */}
            <Card>
              <CardHeader title="Cooperative pricing" sub="Ogun Poultry Co-op · 38 members">
                <Badge variant="accent" dot>Member</Badge>
              </CardHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Section label="Layer mash · today" />
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold tnum text-fg">₦11,400</span>
                    <span className="text-xs text-muted">/ 25kg</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-success mt-1">
                    <Icons.TrendDown size={11} /> 7% below market
                  </div>
                </div>
                <div>
                  <Section label="Day-old broiler" />
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold tnum text-fg">₦1,150</span>
                    <span className="text-xs text-muted">/ chick</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-success mt-1">
                    <Icons.TrendDown size={11} /> 9% below market
                  </div>
                </div>
              </div>
              <div className="border-t border-border mt-4 pt-3 flex items-center justify-between text-sm">
                <span className="text-muted">Savings YTD</span>
                <span className="tnum font-bold text-fg">₦2,184,000</span>
              </div>
            </Card>

            {/* AI insights */}
            <Card>
              <CardHeader title="AI insights" sub="Acre noticed 3 things you might miss">
                <Icons.Sparkles size={14} className="text-accent" />
              </CardHeader>
              <div className="space-y-2.5">
                {/* Warning banner */}
                <div className="flex items-start gap-2.5 rounded-[8px] px-3 py-2.5 bg-warning-subtle">
                  <div className="w-6 h-6 rounded-md bg-warning bg-opacity-20 text-warning flex items-center justify-center shrink-0 mt-0.5">
                    <Icons.Alert size={12} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-fg">House 5 mortality is trending up</div>
                    <div className="text-xs text-muted mt-0.5">
                      4-day rolling avg has doubled. Suggest faecal sample + sulfa drug; budget impact ~₦42k.
                    </div>
                  </div>
                </div>

                {/* Success banner */}
                <div className="flex items-start gap-2.5 rounded-[8px] px-3 py-2.5 bg-success-subtle">
                  <div className="w-6 h-6 rounded-md bg-success bg-opacity-20 text-success flex items-center justify-center shrink-0 mt-0.5">
                    <Icons.TrendUp size={12} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-fg">Sell PB-2026-013 in 11 days</div>
                    <div className="text-xs text-muted mt-0.5">
                      Cobb 500 projected to hit 2.3kg target; feed costs beyond day 47 erode margin.
                    </div>
                  </div>
                </div>

                {/* Info banner */}
                <div className="flex items-start gap-2.5 rounded-[8px] px-3 py-2.5 bg-subtle">
                  <div className="w-6 h-6 rounded-md bg-info-subtle text-info flex items-center justify-center shrink-0 mt-0.5">
                    <Icons.Info size={12} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-fg">Layer mash bulk order window</div>
                    <div className="text-xs text-muted mt-0.5">
                      Co-op group buy closes Friday. 12 tonnes pre-pledged; you&apos;d save ₦96k vs spot.
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
