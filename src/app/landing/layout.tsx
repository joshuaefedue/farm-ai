import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acre Farm OS — The Operating System for Modern Poultry Farms",
  description:
    "Manage your entire farm — batches, feed, sales, payroll, vaccinations, AI insights — from one dashboard. Built for Nigerian poultry farms of 1,000 to 500,000 birds.",
  openGraph: {
    title: "Acre Farm OS",
    description: "Run your entire poultry farm from one dashboard. Batches · Feed · Sales · Payroll · AI.",
    siteName: "Acre Farm OS",
  },
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
