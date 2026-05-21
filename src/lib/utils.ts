import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const naira = (n: number) =>
  "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });

export const num = (n: number, d = 0) =>
  n.toLocaleString("en-NG", { maximumFractionDigits: d, minimumFractionDigits: d });

export const dateStr = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

export const dateLong = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export const ageOf = (arrival: Date, today: Date) =>
  Math.floor((today.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24));
