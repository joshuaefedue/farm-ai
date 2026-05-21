"use client";
import { useState } from "react";
import { Icons } from "@/components/icons";
import { naira } from "@/lib/utils";

const STAFF = [
  { id: "EMP-001", name: "Chukwuemeka Adigwe", role: "Farm Manager", dept: "Management", phone: "0801 234 5678", salary: 320000, status: "active", tenure: "4y 2m", avatar: "CA" },
  { id: "EMP-002", name: "Ngozi Eze", role: "Veterinarian", dept: "Health", phone: "0802 345 6789", salary: 280000, status: "active", tenure: "2y 7m", avatar: "NE" },
  { id: "EMP-003", name: "Babatunde Salami", role: "Feed Technician", dept: "Operations", phone: "0803 456 7890", salary: 145000, status: "active", tenure: "3y 1m", avatar: "BS" },
  { id: "EMP-004", name: "Adaeze Obi", role: "Sales Officer", dept: "Sales", phone: "0804 567 8901", salary: 175000, status: "active", tenure: "1y 8m", avatar: "AO" },
  { id: "EMP-005", name: "Emeka Nwosu", role: "Driver / Logistics", dept: "Logistics", phone: "0805 678 9012", salary: 130000, status: "active", tenure: "2y 3m", avatar: "EN" },
  { id: "EMP-006", name: "Fatima Aliyu", role: "Farm Hand", dept: "Operations", phone: "0806 789 0123", salary: 90000, status: "active", tenure: "11m", avatar: "FA" },
  { id: "EMP-007", name: "Tunde Adeyemi", role: "Farm Hand", dept: "Operations", phone: "0807 890 1234", salary: 90000, status: "active", tenure: "1y 2m", avatar: "TA" },
  { id: "EMP-008", name: "Chioma Onwuka", role: "Accounts Officer", dept: "Finance", phone: "0808 901 2345", salary: 190000, status: "active", tenure: "1y 4m", avatar: "CO" },
  { id: "EMP-009", name: "Musa Ibrahim", role: "Security", dept: "Admin", phone: "0809 012 3456", salary: 80000, status: "active", tenure: "3y 9m", avatar: "MI" },
  { id: "EMP-010", name: "Blessing Okorie", role: "Store Keeper", dept: "Inventory", phone: "0810 123 4567", salary: 110000, status: "active", tenure: "2y 1m", avatar: "BO" },
  { id: "EMP-011", name: "Yusuf Garba", role: "Farm Hand", dept: "Operations", phone: "0811 234 5678", salary: 90000, status: "leave", tenure: "8m", avatar: "YG" },
  { id: "EMP-012", name: "Patience Okafor", role: "Cook / Welfare", dept: "Admin", phone: "0812 345 6789", salary: 75000, status: "active", tenure: "5y 0m", avatar: "PO" },
  { id: "EMP-013", name: "Kunle Fashola", role: "Egg Collector", dept: "Operations", phone: "0813 456 7890", salary: 85000, status: "active", tenure: "1y 6m", avatar: "KF" },
  { id: "EMP-014", name: "Amaka Igwe", role: "HR / Admin", dept: "Admin", phone: "0814 567 8901", salary: 210000, status: "active", tenure: "2y 11m", avatar: "AI" },
];

const ATTENDANCE = [
  { name: "Chukwuemeka Adigwe", in: "06:48", out: "—", status: "present", method: "fingerprint" },
  { name: "Ngozi Eze", in: "07:12", out: "—", status: "present", method: "fingerprint" },
  { name: "Babatunde Salami", in: "06:55", out: "—", status: "present", method: "fingerprint" },
  { name: "Adaeze Obi", in: "08:01", out: "—", status: "late", method: "whatsapp" },
  { name: "Emeka Nwosu", in: "07:00", out: "14:30", status: "present", method: "fingerprint" },
  { name: "Fatima Aliyu", in: "07:20", out: "—", status: "present", method: "fingerprint" },
  { name: "Tunde Adeyemi", in: "07:18", out: "—", status: "present", method: "fingerprint" },
  { name: "Chioma Onwuka", in: "08:05", out: "—", status: "late", method: "fingerprint" },
  { name: "Musa Ibrahim", in: "06:00", out: "18:00", status: "present", method: "fingerprint" },
  { name: "Blessing Okorie", in: "07:30", out: "—", status: "present", method: "fingerprint" },
  { name: "Yusuf Garba", in: "—", out: "—", status: "leave", method: "—" },
  { name: "Patience Okafor", in: "07:10", out: "—", status: "present", method: "fingerprint" },
  { name: "Kunle Fashola", in: "06:40", out: "—", status: "present", method: "fingerprint" },
  { name: "Amaka Igwe", in: "08:10", out: "—", status: "late", method: "fingerprint" },
];

const PAYROLL_HISTORY = [
  { ref: "PAY-2026-04", period: "April 2026", staff: 14, gross: 2070000, deductions: 103500, net: 1966500, status: "disbursed", date: "30 Apr" },
  { ref: "PAY-2026-03", period: "March 2026", staff: 14, gross: 2030000, deductions: 101500, net: 1928500, status: "disbursed", date: "31 Mar" },
  { ref: "PAY-2026-02", period: "February 2026", staff: 13, gross: 1935000, deductions: 96750, net: 1838250, status: "disbursed", date: "28 Feb" },
  { ref: "PAY-2026-01", period: "January 2026", staff: 13, gross: 1935000, deductions: 96750, net: 1838250, status: "disbursed", date: "31 Jan" },
  { ref: "PAY-2025-12", period: "December 2025", staff: 12, gross: 1880000, deductions: 94000, net: 1786000, status: "disbursed", date: "24 Dec" },
];

const SHIFTS = [
  { role: "Morning Feeding", mon: "Babatunde + Fatima", tue: "Babatunde + Tunde", wed: "Babatunde + Kunle", thu: "Babatunde + Fatima", fri: "Babatunde + Tunde", sat: "Tunde + Kunle", sun: "Fatima + Kunle" },
  { role: "Egg Collection", mon: "Kunle + Fatima", tue: "Kunle + Tunde", wed: "Kunle + Fatima", thu: "Kunle + Tunde", fri: "Kunle + Fatima", sat: "Kunle", sun: "Kunle" },
  { role: "Evening Feeding", mon: "Tunde + Fatima", tue: "Tunde + Kunle", wed: "Tunde + Fatima", thu: "Tunde + Kunle", fri: "Tunde + Fatima", sat: "Fatima", sun: "Tunde" },
  { role: "Health Checks", mon: "Ngozi", tue: "Ngozi", wed: "Ngozi", thu: "Ngozi", fri: "Ngozi", sat: "—", sun: "—" },
  { role: "Security (night)", mon: "Musa", tue: "Musa", wed: "Musa", thu: "Musa", fri: "Musa", sat: "Musa", sun: "Musa" },
];

const PERF = [
  { name: "Chukwuemeka Adigwe", score: 96, badge: "Excellent", trend: "+2" },
  { name: "Ngozi Eze", score: 94, badge: "Excellent", trend: "+1" },
  { name: "Babatunde Salami", score: 91, badge: "Excellent", trend: "0" },
  { name: "Blessing Okorie", score: 88, badge: "Good", trend: "+3" },
  { name: "Kunle Fashola", score: 86, badge: "Good", trend: "+1" },
  { name: "Adaeze Obi", score: 83, badge: "Good", trend: "-2" },
  { name: "Amaka Igwe", score: 82, badge: "Good", trend: "+1" },
  { name: "Chioma Onwuka", score: 80, badge: "Good", trend: "0" },
];

function RunPayrollModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const totalGross = STAFF.reduce((s, e) => s + e.salary, 0);
  const totalDed = Math.round(totalGross * 0.05);
  const totalNet = totalGross - totalDed;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ flex: 1 }}>
            <h3>Run payroll</h3>
            <div className="sub">Step {step} of 3 · {step === 1 ? "Review payroll" : step === 2 ? "Approvals" : "Disburse"}</div>
          </div>
          <button className="btn ghost icon-only" onClick={onClose}><Icons.X size={14} /></button>
        </div>
        <div className="modal-body">
          {step === 1 && (
            <div className="stack-3">
              <div className="banner success">
                <div className="icon-dot success"><Icons.Check size={12} /></div>
                <div>Payroll for <strong>May 2026</strong> — {STAFF.length} active staff. Review before sending for approval.</div>
              </div>
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Staff</th><th>Role</th><th className="num">Gross</th><th className="num">5% NHF</th><th className="num">Net</th></tr></thead>
                  <tbody>
                    {STAFF.filter(e => e.status !== "leave").slice(0, 8).map(e => (
                      <tr key={e.id}>
                        <td><div style={{ fontWeight: 500, fontSize: 13 }}>{e.name}</div></td>
                        <td className="muted" style={{ fontSize: 12.5 }}>{e.role}</td>
                        <td className="num">{naira(e.salary)}</td>
                        <td className="num muted">{naira(Math.round(e.salary * 0.05))}</td>
                        <td className="num" style={{ fontWeight: 500 }}>{naira(e.salary - Math.round(e.salary * 0.05))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="row" style={{ justifyContent: "flex-end", gap: 16, padding: "10px 12px", background: "var(--accent-soft)", borderRadius: 8 }}>
                <div className="stack-2" style={{ alignItems: "flex-end" }}>
                  <span className="muted" style={{ fontSize: 12 }}>Total gross</span>
                  <span className="mono" style={{ fontWeight: 600 }}>{naira(totalGross)}</span>
                </div>
                <div className="stack-2" style={{ alignItems: "flex-end" }}>
                  <span className="muted" style={{ fontSize: 12 }}>Deductions</span>
                  <span className="mono danger-text">−{naira(totalDed)}</span>
                </div>
                <div className="stack-2" style={{ alignItems: "flex-end" }}>
                  <span className="muted" style={{ fontSize: 12 }}>Net payable</span>
                  <span className="mono" style={{ fontWeight: 700, fontSize: 17 }}>{naira(totalNet)}</span>
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="stack-3">
              <div className="banner warning">
                <div className="icon-dot warning"><Icons.Warning size={12} /></div>
                <div>Payroll requires sign-off from <strong>Farm Owner</strong> before disbursement.</div>
              </div>
              {[
                { role: "Farm Manager", name: "Chukwuemeka Adigwe", status: "approved" },
                { role: "Farm Owner", name: "Chief Adigwe", status: "pending" },
                { role: "Accounts Officer", name: "Chioma Onwuka", status: "approved" },
              ].map(a => (
                <div key={a.role} className="row" style={{ padding: "10px 12px", background: "var(--bg-sunken)", borderRadius: 8, gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{a.role}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{a.name}</div>
                  </div>
                  <span className={`badge ${a.status === "approved" ? "success" : "warning"}`}>{a.status}</span>
                </div>
              ))}
              <div className="muted" style={{ fontSize: 12.5, textAlign: "center" }}>Waiting for Farm Owner approval. A WhatsApp notification has been sent.</div>
            </div>
          )}
          {step === 3 && (
            <div className="stack-3">
              <div className="banner success">
                <div className="icon-dot success"><Icons.Check size={12} /></div>
                <div>All approvals received. Ready to disburse <strong>{naira(totalNet)}</strong> via bank transfer.</div>
              </div>
              {[
                { label: "Period", value: "May 2026" },
                { label: "Staff count", value: STAFF.filter(e => e.status !== "leave").length },
                { label: "Total gross", value: naira(totalGross) },
                { label: "Total deductions", value: naira(totalDed) },
                { label: "Net payable", value: naira(totalNet), hi: true },
                { label: "Payment method", value: "Bank transfer (Zenith Bank)" },
              ].map(({ label, value, hi }) => (
                <div key={label} className="row" style={{ justifyContent: "space-between", padding: "6px 10px", background: hi ? "var(--accent-soft)" : "var(--bg-sunken)", borderRadius: 6, fontSize: 13 }}>
                  <span className="muted">{label}</span>
                  <span className="mono" style={{ fontWeight: hi ? 700 : 400 }}>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="modal-footer">
          {step > 1 && <button className="btn" onClick={() => setStep(step - 1)}>Back</button>}
          <button className="btn" onClick={onClose}>Cancel</button>
          {step < 3
            ? <button className="btn primary" onClick={() => setStep(step + 1)}>{step === 1 ? "Send for approval" : "Proceed to disburse"}</button>
            : <button className="btn accent" onClick={onClose}><Icons.Check size={14} /> Disburse payroll</button>}
        </div>
      </div>
    </div>
  );
}

export default function HRScreen() {
  const [tab, setTab] = useState("staff");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [showPayroll, setShowPayroll] = useState(false);

  const depts = ["all", "Management", "Operations", "Health", "Sales", "Finance", "Logistics", "Inventory", "Admin"];
  const activeStaff = STAFF.filter(e => e.status === "active").length;
  const onLeave = STAFF.filter(e => e.status === "leave").length;
  const totalPayroll = STAFF.reduce((s, e) => s + e.salary, 0);
  const presentToday = ATTENDANCE.filter(a => a.status === "present").length;

  const filteredStaff = STAFF.filter(e => {
    if (deptFilter !== "all" && e.dept !== deptFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return e.name.toLowerCase().includes(s) || e.role.toLowerCase().includes(s);
    }
    return true;
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Human resources</h1>
          <div className="page-sub">{activeStaff} active staff · {onLeave} on leave · Monthly payroll {naira(totalPayroll)}</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icons.Download size={14} /> Export</button>
          <button className="btn" onClick={() => setShowPayroll(true)}><Icons.Naira size={14} /> Run payroll</button>
          <button className="btn accent"><Icons.Plus size={14} /> Add staff</button>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <div className="kpi">
          <div className="kpi-label">Headcount</div>
          <div className="kpi-value">{STAFF.length}</div>
          <div className="muted" style={{ fontSize: 11.5 }}>{activeStaff} active · {onLeave} on leave</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Monthly payroll</div>
          <div className="kpi-value tnum">{naira(totalPayroll)}</div>
          <div className="muted" style={{ fontSize: 11.5 }}>May 2026 · not yet disbursed</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Attendance today</div>
          <div className="kpi-value" style={{ color: "var(--success-soft-fg)" }}>{presentToday} / {activeStaff}</div>
          <div className="muted" style={{ fontSize: 11.5 }}>3 late clock-ins</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Avg tenure</div>
          <div className="kpi-value">2.1 yrs</div>
          <div className="muted" style={{ fontSize: 11.5 }}>Longest: 5y 0m (Patience)</div>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 12 }}>
        {["staff", "attendance", "payroll", "shifts", "performance"].map(t => (
          <button key={t} className={`tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
            {t === "staff" ? "Staff directory" : t === "attendance" ? "Attendance" : t === "payroll" ? "Payroll history" : t === "shifts" ? "Shift rota" : "Performance"}
          </button>
        ))}
      </div>

      {tab === "staff" && (
        <>
          <div className="filter-bar">
            <div className="search-wrap" style={{ flex: 1, maxWidth: 300 }}>
              <Icons.Search size={14} />
              <input placeholder="Search staff…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="btn-group">
              {depts.slice(0, 6).map(d => (
                <button key={d} className={deptFilter === d ? "active" : ""} onClick={() => setDeptFilter(d)}>{d}</button>
              ))}
            </div>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Staff</th>
                  <th>Role</th>
                  <th>Dept</th>
                  <th>Phone</th>
                  <th className="num">Salary</th>
                  <th>Tenure</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map(e => (
                  <tr key={e.id}>
                    <td>
                      <div className="row" style={{ gap: 10 }}>
                        <div className="avatar">{e.avatar}</div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{e.name}</div>
                          <div className="faint mono" style={{ fontSize: 11 }}>{e.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{e.role}</td>
                    <td><span className="badge outline" style={{ fontSize: 11 }}>{e.dept}</span></td>
                    <td className="mono muted" style={{ fontSize: 12 }}>{e.phone}</td>
                    <td className="num">{naira(e.salary)}</td>
                    <td className="muted" style={{ fontSize: 12.5 }}>{e.tenure}</td>
                    <td><span className={`badge ${e.status === "active" ? "success" : "warning"}`}>{e.status}</span></td>
                    <td><button className="btn ghost sm icon-only"><Icons.More size={13} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "attendance" && (
        <div className="grid-2" style={{ gap: 16, alignItems: "start" }}>
          <div>
            <div className="section-title" style={{ marginBottom: 8 }}>Today — Wed 13 May 2026</div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Staff</th><th>Clock-in</th><th>Clock-out</th><th>Method</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {ATTENDANCE.map((a, i) => (
                    <tr key={i}>
                      <td style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</td>
                      <td className="mono muted" style={{ fontSize: 12.5 }}>{a.in}</td>
                      <td className="mono muted" style={{ fontSize: 12.5 }}>{a.out}</td>
                      <td>
                        {a.method === "whatsapp"
                          ? <span className="badge outline" style={{ fontSize: 10.5 }}><Icons.WhatsApp size={10} className="whatsapp-icon" /> WA</span>
                          : a.method !== "—"
                            ? <span className="badge outline" style={{ fontSize: 10.5 }}>Fingerprint</span>
                            : <span className="muted">—</span>}
                      </td>
                      <td>
                        <span className={`badge ${a.status === "present" ? "success" : a.status === "late" ? "warning" : "info"}`}>{a.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="stack-3">
            <div className="card">
              <div className="card-header"><div className="card-title">Week summary</div></div>
              <div style={{ padding: "0 16px 16px" }}>
                {[{ day: "Mon 11", rate: 93 }, { day: "Tue 12", rate: 86 }, { day: "Wed 13", rate: 90 }].map(d => (
                  <div key={d.day} className="row" style={{ gap: 10, marginBottom: 8, alignItems: "center" }}>
                    <div style={{ fontSize: 12.5, width: 50, color: "var(--fg-muted)" }}>{d.day}</div>
                    <div style={{ flex: 1, height: 6, background: "var(--bg-sunken)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${d.rate}%`, height: "100%", background: "var(--success-soft-fg)", borderRadius: 3 }} />
                    </div>
                    <div className="mono" style={{ fontSize: 12, width: 36, textAlign: "right" }}>{d.rate}%</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-header"><div className="card-title">WhatsApp clock-in commands</div></div>
              <div style={{ padding: "0 16px 16px", fontSize: 12.5 }}>
                <div className="stack-2">
                  {["IN — clock in", "OUT — clock out", "LEAVE request [date] — submit leave", "ABSENT — report absence"].map(cmd => (
                    <div key={cmd} className="row" style={{ gap: 8, padding: "6px 10px", background: "var(--bg-sunken)", borderRadius: 6 }}>
                      <Icons.WhatsApp size={12} className="whatsapp-icon" />
                      <span className="mono" style={{ fontSize: 12 }}>{cmd}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "payroll" && (
        <>
          <div className="filter-bar">
            <div className="section-title" style={{ marginBottom: 0 }}>Payroll history</div>
            <button className="btn accent" onClick={() => setShowPayroll(true)}><Icons.Plus size={14} /> Run May 2026</button>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Reference</th><th>Period</th><th className="num">Staff</th><th className="num">Gross</th><th className="num">Deductions</th><th className="num">Net paid</th><th>Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {PAYROLL_HISTORY.map(p => (
                  <tr key={p.ref}>
                    <td className="id-cell"><span className="row-link">{p.ref}</span></td>
                    <td style={{ fontWeight: 500, fontSize: 13 }}>{p.period}</td>
                    <td className="num">{p.staff}</td>
                    <td className="num">{naira(p.gross)}</td>
                    <td className="num muted">{naira(p.deductions)}</td>
                    <td className="num" style={{ fontWeight: 600 }}>{naira(p.net)}</td>
                    <td className="muted" style={{ fontSize: 12.5 }}>{p.date}</td>
                    <td><span className="badge success">{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "shifts" && (
        <>
          <div className="section-title" style={{ marginBottom: 8 }}>Week of 11–17 May 2026</div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Shift / Role</th>
                  <th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th><th>Sun</th>
                </tr>
              </thead>
              <tbody>
                {SHIFTS.map(s => (
                  <tr key={s.role}>
                    <td style={{ fontWeight: 500, fontSize: 12.5, whiteSpace: "nowrap" }}>{s.role}</td>
                    {[s.mon, s.tue, s.wed, s.thu, s.fri, s.sat, s.sun].map((v, i) => (
                      <td key={i} className="muted" style={{ fontSize: 12, minWidth: 100 }}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "performance" && (
        <div className="grid-2" style={{ gap: 16, alignItems: "start" }}>
          <div>
            <div className="section-title" style={{ marginBottom: 8 }}>Top performers · May 2026</div>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Staff</th><th className="num">Score</th><th>Rating</th><th className="num">Trend</th></tr></thead>
                <tbody>
                  {PERF.map((p, i) => (
                    <tr key={p.name}>
                      <td>
                        <div className="row" style={{ gap: 8 }}>
                          <div style={{ width: 20, textAlign: "center", fontSize: 11.5, color: "var(--fg-muted)" }}>{i + 1}</div>
                          <span style={{ fontWeight: 500, fontSize: 13 }}>{p.name}</span>
                        </div>
                      </td>
                      <td className="num">
                        <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                          <div style={{ width: 60, height: 5, background: "var(--bg-sunken)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${p.score}%`, height: "100%", background: "var(--accent)", borderRadius: 3 }} />
                          </div>
                          <span className="mono" style={{ fontSize: 12.5 }}>{p.score}</span>
                        </div>
                      </td>
                      <td><span className={`badge ${p.badge === "Excellent" ? "accent" : "success"}`}>{p.badge}</span></td>
                      <td className="num mono" style={{ fontSize: 12.5, color: p.trend.startsWith("+") ? "var(--success-soft-fg)" : p.trend.startsWith("-") ? "var(--danger-soft-fg)" : "var(--fg-muted)" }}>{p.trend}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Reviews due</div></div>
            <div style={{ padding: "0 16px 16px" }} className="stack-2">
              {[
                { name: "Fatima Aliyu", due: "15 May", overdue: true },
                { name: "Yusuf Garba", due: "15 May", overdue: true },
                { name: "Tunde Adeyemi", due: "31 May", overdue: false },
                { name: "Emeka Nwosu", due: "31 May", overdue: false },
              ].map(r => (
                <div key={r.name} className="row" style={{ padding: "8px 10px", background: "var(--bg-sunken)", borderRadius: 8, gap: 10 }}>
                  <div style={{ flex: 1, fontWeight: 500, fontSize: 13 }}>{r.name}</div>
                  <span className={`badge ${r.overdue ? "danger" : "warning"}`}>{r.overdue ? "Overdue" : "Due " + r.due}</span>
                  <button className="btn sm ghost">Review</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showPayroll && <RunPayrollModal onClose={() => setShowPayroll(false)} />}
    </div>
  );
}
