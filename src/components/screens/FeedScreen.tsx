"use client";
import { Icons } from "@/components/icons";
import { naira } from "@/lib/utils";

const feeds = [
  { name: "Layer Mash 18%", stock: 1.8, unit: "tonnes", daysLeft: 3, monthly: 12.4, price: 11400, state: "low" },
  { name: "Broiler Starter 22%", stock: 6.4, unit: "tonnes", daysLeft: 22, monthly: 8.2, price: 13200, state: "ok" },
  { name: "Broiler Grower 20%", stock: 4.1, unit: "tonnes", daysLeft: 14, monthly: 9.0, price: 12400, state: "ok" },
  { name: "Broiler Finisher 18%", stock: 2.2, unit: "tonnes", daysLeft: 8, monthly: 8.5, price: 11800, state: "watch" },
  { name: "Chick Mash", stock: 0.9, unit: "tonnes", daysLeft: 6, monthly: 4.1, price: 12800, state: "watch" },
];

export default function FeedScreen() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Feed & water</h1>
          <div className="page-sub">5 feed types in stock · avg consumption 1,940 kg/day</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icons.Truck size={14} /> New delivery</button>
          <button className="btn accent"><Icons.Plus size={14} /> Reorder</button>
        </div>
      </div>

      <div className="banner warning" style={{ marginBottom: 12 }}>
        <div className="icon-dot warning"><Icons.Alert size={12} /></div>
        <div style={{ flex: 1 }}>Layer Mash 18% will run out in ~3 days. Co-op group buy closes Friday — pre-pledge for ₦96k savings.</div>
        <button className="btn sm">Join group buy</button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Feed type</th>
              <th className="num">In stock</th>
              <th className="num">Days left</th>
              <th>Burn rate</th>
              <th className="num">Last paid</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {feeds.map((f) => (
              <tr key={f.name}>
                <td style={{ fontWeight: 500 }}>{f.name}</td>
                <td className="num">
                  <span className="mono">{f.stock}</span> <span className="faint">{f.unit}</span>
                </td>
                <td className="num">
                  <span className={f.daysLeft < 7 ? "danger-text" : f.daysLeft < 14 ? "warning-text" : ""}>{f.daysLeft}d</span>
                </td>
                <td>
                  <div className="row" style={{ gap: 6 }}>
                    <div className="bar" style={{ width: 80 }}>
                      <span style={{ width: `${Math.min(100, (f.monthly / 14) * 100)}%` }}></span>
                    </div>
                    <span className="mono faint" style={{ fontSize: 11 }}>{f.monthly} t/mo</span>
                  </div>
                </td>
                <td className="num" style={{ fontVariantNumeric: "tabular-nums" }}>{naira(f.price)} / 25kg</td>
                <td>
                  <span className={`badge ${f.state === "low" ? "danger" : f.state === "watch" ? "warning" : "success"}`}>
                    <span className="dot"></span>{f.state}
                  </span>
                </td>
                <td><button className="btn sm">Reorder</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
