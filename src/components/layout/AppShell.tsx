"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { DashboardScreen } from "@/components/dashboard/DashboardScreen";
import BatchesScreen from "@/components/screens/BatchesScreen";
import BatchDetailScreen from "@/components/screens/BatchDetailScreen";
import HousesScreen from "@/components/screens/HousesScreen";
import FeedScreen from "@/components/screens/FeedScreen";
import MortalityScreen from "@/components/screens/MortalityScreen";
import EggsScreen from "@/components/screens/EggsScreen";
import VaccinationsScreen from "@/components/screens/VaccinationsScreen";
import SalesScreen from "@/components/screens/SalesScreen";
import InventoryScreen from "@/components/screens/InventoryScreen";
import FinanceScreen from "@/components/screens/FinanceScreen";
import HRScreen from "@/components/screens/HRScreen";
import LogisticsScreen from "@/components/screens/LogisticsScreen";
import ProcurementScreen from "@/components/screens/ProcurementScreen";
import CRMScreen from "@/components/screens/CRMScreen";
import MarketplaceScreen from "@/components/screens/MarketplaceScreen";
import AIScreen from "@/components/screens/AIScreen";
import SettingsScreen from "@/components/screens/SettingsScreen";

type Route = string;

function buildCrumbs(route: Route): string[] {
  if (route === "dashboard") return ["Overview"];
  if (route.startsWith("batch:")) return ["Poultry", "Batches", route.slice(6)];
  if (route === "batches")        return ["Poultry", "Batches"];
  if (route === "houses")         return ["Poultry", "Houses"];
  if (route === "feed")           return ["Poultry", "Feed & water"];
  if (route === "vaccinations")   return ["Poultry", "Vaccinations"];
  if (route === "mortality")      return ["Poultry", "Mortality"];
  if (route === "eggs")           return ["Poultry", "Egg production"];
  if (route === "sales")          return ["Sales & Orders"];
  if (route === "inventory")      return ["Operations", "Inventory"];
  if (route === "procurement")    return ["Operations", "Procurement"];
  if (route === "finance")        return ["Operations", "Finance"];
  if (route === "hr")             return ["Operations", "HR & Payroll"];
  if (route === "marketplace")    return ["Operations", "Marketplace"];
  if (route === "crm")            return ["Operations", "CRM"];
  if (route === "logistics")      return ["Operations", "Logistics"];
  if (route === "ai")             return ["AI & Automation"];
  if (route === "settings")       return ["Settings"];
  return ["Overview"];
}

export default function AppShell() {
  const [route, setRoute] = useState<Route>("dashboard");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const crumbs = buildCrumbs(route);

  let screen: React.ReactNode;
  switch (true) {
    case route === "dashboard":
      screen = <DashboardScreen setRoute={setRoute} />; break;
    case route === "batches":
      screen = <BatchesScreen setRoute={setRoute} />; break;
    case route.startsWith("batch:"):
      screen = <BatchDetailScreen batchId={route.slice(6)} />; break;
    case route === "houses":
      screen = <HousesScreen />; break;
    case route === "feed":
      screen = <FeedScreen />; break;
    case route === "mortality":
      screen = <MortalityScreen />; break;
    case route === "eggs":
      screen = <EggsScreen />; break;
    case route === "vaccinations":
      screen = <VaccinationsScreen />; break;
    case route === "sales":
      screen = <SalesScreen />; break;
    case route === "inventory":
      screen = <InventoryScreen />; break;
    case route === "finance":
      screen = <FinanceScreen />; break;
    case route === "hr":
      screen = <HRScreen />; break;
    case route === "logistics":
      screen = <LogisticsScreen />; break;
    case route === "procurement":
      screen = <ProcurementScreen />; break;
    case route === "crm":
      screen = <CRMScreen />; break;
    case route === "marketplace":
      screen = <MarketplaceScreen />; break;
    case route === "ai":
      screen = <AIScreen />; break;
    case route === "settings":
      screen = <SettingsScreen />; break;
    default:
      screen = (
        <div className="flex-1 flex items-center justify-center text-muted text-sm">
          <div className="text-center">
            <div className="text-3xl mb-2 opacity-20">🚧</div>
            <div className="font-medium text-fg capitalize">{route}</div>
            <div className="text-muted text-xs mt-1">Screen not yet implemented</div>
          </div>
        </div>
      );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar route={route} setRoute={setRoute} theme={theme} setTheme={setTheme} />
      <div className="flex flex-col flex-1 min-w-0 bg-bg overflow-hidden">
        <Topbar crumbs={crumbs} theme={theme} setTheme={setTheme} />
        <div style={{ flex: 1, overflowY: "auto" }}>
          {screen}
        </div>
      </div>
    </div>
  );
}
