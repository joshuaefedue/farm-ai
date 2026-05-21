// All amounts in NGN. "Today" = May 13 2026.
export const TODAY = new Date(2026, 4, 13);

const D = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export type BatchStatus = "laying" | "growing" | "sold";
export type BatchType = "layer" | "broiler" | "dual";

export interface Batch {
  id: string;
  name: string;
  breed: string;
  type: BatchType;
  arrival: Date;
  house: string;
  startCount: number;
  currentCount: number;
  mortalityPct: number;
  fcr: number;
  eggRate?: number;
  avgWeight?: number;
  status: BatchStatus;
  supplier: string;
  costPerBird: number;
}

export const BATCHES: Batch[] = [
  { id: "PB-2026-014", name: "Lohmann Brown · House 4", breed: "Lohmann Brown", type: "layer", arrival: D("2026-01-22"), house: "House 4", startCount: 4000, currentCount: 3892, mortalityPct: 2.7, fcr: 2.18, eggRate: 86.4, status: "laying", supplier: "Olam Hatchery, Ibadan", costPerBird: 1840 },
  { id: "PB-2026-013", name: "Cobb 500 · House 2", breed: "Cobb 500", type: "broiler", arrival: D("2026-03-15"), house: "House 2", startCount: 5000, currentCount: 4923, mortalityPct: 1.54, fcr: 1.62, avgWeight: 1.42, status: "growing", supplier: "Amo Byng, Awe", costPerBird: 1620 },
  { id: "PB-2026-012", name: "ISA Brown · House 3", breed: "ISA Brown", type: "layer", arrival: D("2025-10-04"), house: "House 3", startCount: 3500, currentCount: 3361, mortalityPct: 3.97, fcr: 2.21, eggRate: 88.1, status: "laying", supplier: "Olam Hatchery, Ibadan", costPerBird: 1880 },
  { id: "PB-2026-011", name: "Arbor Acres · House 1", breed: "Arbor Acres Plus", type: "broiler", arrival: D("2026-04-02"), house: "House 1", startCount: 6000, currentCount: 5944, mortalityPct: 0.93, fcr: 1.48, avgWeight: 0.96, status: "growing", supplier: "Zartech, Ibadan", costPerBird: 1580 },
  { id: "PB-2026-010", name: "Noiler · House 5", breed: "Noiler (Local)", type: "dual", arrival: D("2025-12-08"), house: "House 5", startCount: 2200, currentCount: 2104, mortalityPct: 4.36, fcr: 2.84, avgWeight: 2.1, status: "laying", supplier: "FUNAAB Hatchery", costPerBird: 920 },
  { id: "PB-2026-009", name: "Cobb 500 · House 2 (prev)", breed: "Cobb 500", type: "broiler", arrival: D("2025-12-20"), house: "House 2", startCount: 4800, currentCount: 0, mortalityPct: 2.1, fcr: 1.59, avgWeight: 2.32, status: "sold", supplier: "Amo Byng, Awe", costPerBird: 1610 },
];

export type AlertLevel = "danger" | "warning" | "info" | "success";

export interface Alert {
  id: number;
  level: AlertLevel;
  title: string;
  meta: string;
  time: string;
  icon: string;
}

export const ALERTS: Alert[] = [
  { id: 1, level: "danger", title: "Mortality spike — PB-2026-010", meta: "8 birds today vs 7-day avg 2.4 · suspected coccidiosis", time: "12 min ago", icon: "Mortality" },
  { id: 2, level: "warning", title: "Vaccine due tomorrow — Gumboro D2", meta: "PB-2026-011 · Arbor Acres · House 1 · 5,944 birds", time: "1h ago", icon: "Vaccine" },
  { id: 3, level: "warning", title: "Feed stock low — Layer Mash 18%", meta: "1.8 tonnes left · ~3 days at current rate", time: "3h ago", icon: "Feed" },
  { id: 4, level: "info", title: "Egg orders pending fulfilment", meta: "4 wholesale orders · 218 crates total", time: "5h ago", icon: "Egg" },
  { id: 5, level: "success", title: "PB-2026-009 sold — final reconciliation", meta: "Net profit ₦4.82M · ROI 18.4%", time: "Yesterday", icon: "Check" },
];

export type OrderStatus = "delivered" | "out_for_delivery" | "pending" | "confirmed" | "cancelled";
export type PaymentStatus = "paid" | "invoiced" | "unpaid";

export interface Order {
  id: string;
  date: Date;
  customer: string;
  channel: string;
  items: string;
  subtotal: number;
  status: OrderStatus;
  payment: PaymentStatus;
  paymentMethod: string;
  coop: boolean;
  phone: string;
}

export const ORDERS: Order[] = [
  { id: "ORD-2061", date: D("2026-05-12"), customer: "Mama Ngozi · Mile 12 Market", channel: "WhatsApp", items: "320 crates eggs (L)", subtotal: 992000, status: "delivered", payment: "paid", paymentMethod: "Opay Transfer", coop: false, phone: "+234 803 412 0982" },
  { id: "ORD-2062", date: D("2026-05-12"), customer: "Shoprite Lekki", channel: "Wholesale", items: "180 crates eggs (XL) · 240kg dressed chicken", subtotal: 1840000, status: "out_for_delivery", payment: "invoiced", paymentMethod: "Net-30", coop: false, phone: "+234 700 0567" },
  { id: "ORD-2063", date: D("2026-05-13"), customer: "Ifeoma Caterers", channel: "WhatsApp", items: "85 crates eggs (M)", subtotal: 229500, status: "pending", payment: "unpaid", paymentMethod: "—", coop: true, phone: "+234 909 221 8814" },
  { id: "ORD-2064", date: D("2026-05-13"), customer: "Ogun Poultry Co-op", channel: "Cooperative", items: "1,200 day-old broilers (resale)", subtotal: 1380000, status: "confirmed", payment: "paid", paymentMethod: "Bank transfer", coop: true, phone: "+234 802 110 5566" },
  { id: "ORD-2065", date: D("2026-05-13"), customer: "Mr Biggs Sango", channel: "Retail B2B", items: "140kg dressed broiler", subtotal: 462000, status: "pending", payment: "unpaid", paymentMethod: "—", coop: false, phone: "+234 805 887 1100" },
  { id: "ORD-2066", date: D("2026-05-11"), customer: "Femi · Mowe Roadside", channel: "WhatsApp", items: "42 crates eggs (L)", subtotal: 130200, status: "delivered", payment: "paid", paymentMethod: "Cash on delivery", coop: false, phone: "+234 811 003 4422" },
  { id: "ORD-2067", date: D("2026-05-10"), customer: "Bukola Foods", channel: "Wholesale", items: "560 crates eggs mixed", subtotal: 1612000, status: "delivered", payment: "paid", paymentMethod: "Moniepoint", coop: false, phone: "+234 909 555 0001" },
];

export interface House {
  id: string;
  type: string;
  capacity: number;
  batch?: string;
}

export const HOUSES: House[] = [
  { id: "House 1", type: "Open-sided · deep litter", capacity: 6000, batch: "PB-2026-011" },
  { id: "House 2", type: "Open-sided · raised slatted", capacity: 5200, batch: "PB-2026-013" },
  { id: "House 3", type: "Semi-closed · deep litter", capacity: 4000, batch: "PB-2026-012" },
  { id: "House 4", type: "Open-sided · battery cage", capacity: 4500, batch: "PB-2026-014" },
  { id: "House 5", type: "Open-sided · deep litter", capacity: 2500, batch: "PB-2026-010" },
  { id: "House 6", type: "Open-sided · deep litter", capacity: 6000 },
];

export interface VaxEntry {
  id: number;
  batch: string;
  vaccine: string;
  route: string;
  date: Date;
  status: "pending" | "done";
  birds: number;
}

export const VAX: VaxEntry[] = [
  { id: 1, batch: "PB-2026-012", vaccine: "Fowl pox FP-LT", route: "Wing web", date: D("2026-05-10"), status: "pending", birds: 3361 },
  { id: 2, batch: "PB-2026-011", vaccine: "Gumboro D2", route: "Drinking water", date: D("2026-05-13"), status: "pending", birds: 5944 },
  { id: 3, batch: "PB-2026-014", vaccine: "ILT booster", route: "Eye drop", date: D("2026-05-13"), status: "pending", birds: 3892 },
  { id: 4, batch: "PB-2026-013", vaccine: "NDV booster", route: "Spray", date: D("2026-05-16"), status: "pending", birds: 4923 },
  { id: 5, batch: "PB-2026-011", vaccine: "NDV spray", route: "Spray", date: D("2026-05-21"), status: "pending", birds: 5944 },
  { id: 6, batch: "PB-2026-010", vaccine: "Gumboro D2", route: "Drinking water", date: D("2026-05-24"), status: "pending", birds: 2104 },
  { id: 7, batch: "PB-2026-014", vaccine: "Newcastle Lasota", route: "Drinking water", date: D("2026-05-27"), status: "pending", birds: 3892 },
  { id: 8, batch: "PB-2026-012", vaccine: "ILT booster", route: "Eye drop", date: D("2026-05-08"), status: "done", birds: 3361 },
  { id: 9, batch: "PB-2026-011", vaccine: "Newcastle B1", route: "Drinking water", date: D("2026-04-09"), status: "done", birds: 6000 },
  { id: 10, batch: "PB-2026-013", vaccine: "Marek's HVT", route: "Sub-cut", date: D("2026-03-15"), status: "done", birds: 5000 },
  { id: 11, batch: "PB-2026-011", vaccine: "Marek HVT", route: "Sub-cut", date: D("2026-04-02"), status: "done", birds: 6000 },
];

export interface ActivityEntry {
  title: string;
  meta: string;
  time: string;
  level?: string;
  who?: string;
}

export const BATCH_ACTIVITY: Record<string, ActivityEntry[]> = {
  "PB-2026-014": [
    { title: "Egg collection logged", meta: "3,361 eggs · 112 crates · 86.4% lay rate", time: "08:14", level: "success", who: "Tunde A." },
    { title: "Feed dispensed", meta: "Layer Mash 18% · 480 kg", time: "07:30", who: "Bashir M." },
    { title: "Mortality log", meta: "2 birds · respiratory signs · no escalation", time: "07:15", level: "warning", who: "Chika O." },
    { title: "Temperature alert cleared", meta: "Temp was 30.2°C at 05:00 · now 28.4°C", time: "05:42" },
    { title: "Egg collection logged", meta: "3,355 eggs · 111 crates", time: "Yesterday 08:10", level: "success", who: "Tunde A." },
  ],
  "PB-2026-013": [
    { title: "Weight recorded", meta: "Avg 1.42 kg · sample 50 birds", time: "08:00", level: "success", who: "Tunde A." },
    { title: "Feed dispensed", meta: "Broiler Starter 22% · 620 kg", time: "07:20", who: "Bashir M." },
    { title: "Mortality log", meta: "1 bird · no visible symptoms", time: "06:50", level: "warning", who: "Chika O." },
    { title: "Feed dispensed", meta: "Evening feeding · 580 kg", time: "Yesterday 17:00", who: "Bashir M." },
    { title: "Vaccine administered", meta: "Gumboro D1 · 4,923 birds · eye drop", time: "Yesterday 10:00", level: "accent", who: "Dr. Chinedu O." },
  ],
  "default": [
    { title: "Morning check completed", meta: "All birds active · no abnormalities", time: "07:00", level: "success", who: "House attendant" },
    { title: "Feed dispensed", meta: "Morning ration dispensed", time: "06:45", who: "Bashir M." },
    { title: "Mortality log", meta: "0 birds · all clear", time: "06:30" },
  ],
};

// 30-day daily series: [eggs, mortality, feed_kg]
export const DAILY_SERIES: [number, number, number][] = [
  [10220, 9, 1820], [10180, 7, 1810], [10240, 8, 1830], [10310, 11, 1840], [10260, 6, 1820],
  [10290, 5, 1815], [10310, 7, 1825], [10355, 6, 1830], [10380, 4, 1840], [10330, 8, 1825],
  [10410, 7, 1850], [10440, 9, 1860], [10470, 5, 1845], [10460, 6, 1855], [10490, 8, 1870],
  [10510, 11, 1880], [10550, 9, 1880], [10580, 10, 1885], [10570, 13, 1890], [10610, 8, 1885],
  [10640, 7, 1900], [10670, 9, 1910], [10700, 14, 1910], [10720, 8, 1920], [10740, 10, 1925],
  [10770, 11, 1930], [10790, 13, 1935], [10820, 9, 1940], [10810, 12, 1945], [10840, 16, 1950],
];
