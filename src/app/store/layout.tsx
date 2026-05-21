import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adigwe Family Farms — Fresh Eggs & Poultry, Ogun State",
  description:
    "Order farm-fresh eggs and poultry directly from Adigwe Family Farms, Ogun State. Daily delivery across Lagos & Ogun. Order on WhatsApp.",
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
