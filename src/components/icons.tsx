import { SVGProps } from "react";

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "stroke"> {
  size?: number;
  stroke?: number;
}

const Icon = ({
  size = 16,
  stroke = 1.6,
  children,
  ...props
}: IconProps & { children: React.ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    {children}
  </svg>
);

export const Icons = {
  Dashboard: (p: IconProps) => (
    <Icon {...p}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </Icon>
  ),
  Chick: (p: IconProps) => (
    <Icon {...p}>
      <circle cx="12" cy="13" r="6" />
      <circle cx="12" cy="5" r="3" />
      <path d="M11 5h2" />
    </Icon>
  ),
  Fish: (p: IconProps) => (
    <Icon {...p}>
      <path d="M6.5 12c2-4 6-6 10-6 0 3-1 5-1 6s1 3 1 6c-4 0-8-2-10-6Z" />
      <path d="M2 12c1-1 2-2 4.5-2" />
      <path d="M2 12c1 1 2 2 4.5 2" />
      <circle cx="15" cy="11" r=".5" fill="currentColor" />
    </Icon>
  ),
  Snail: (p: IconProps) => (
    <Icon {...p}>
      <circle cx="11" cy="13" r="6" />
      <path d="M11 13a3 3 0 1 1 3 0" />
      <path d="M17 7l1-1" />
      <path d="M19 6l1.5-.5" />
      <path d="M5 19h16" />
    </Icon>
  ),
  Crops: (p: IconProps) => (
    <Icon {...p}>
      <path d="M12 22V8" />
      <path d="M12 8c0-3 2-5 5-5 0 3-2 5-5 5Z" />
      <path d="M12 12c0-3-2-5-5-5 0 3 2 5 5 5Z" />
      <path d="M5 22h14" />
    </Icon>
  ),
  Batches: (p: IconProps) => (
    <Icon {...p}>
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <path d="M8 6V4h8v2" />
      <path d="M3 13h18" />
    </Icon>
  ),
  Feed: (p: IconProps) => (
    <Icon {...p}>
      <path d="M4 8h16l-1 12H5L4 8Z" />
      <path d="M8 8V5h8v3" />
      <path d="M9 12v4" />
      <path d="M15 12v4" />
    </Icon>
  ),
  Mortality: (p: IconProps) => (
    <Icon {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 9l8 6" />
      <path d="M16 9l-8 6" />
    </Icon>
  ),
  Egg: (p: IconProps) => (
    <Icon {...p}>
      <path d="M12 3c-4 0-7 5-7 11a7 7 0 0 0 14 0c0-6-3-11-7-11Z" />
    </Icon>
  ),
  Vaccine: (p: IconProps) => (
    <Icon {...p}>
      <path d="M11 2l4 4" />
      <path d="M14 5l4 4" />
      <path d="M9 8l7 7" />
      <path d="M12 11l-7 7 1 3 3 1 7-7" />
      <path d="M6 16l2 2" />
    </Icon>
  ),
  Sales: (p: IconProps) => (
    <Icon {...p}>
      <path d="M3 7l9-4 9 4-9 4-9-4Z" />
      <path d="M3 12l9 4 9-4" />
      <path d="M3 17l9 4 9-4" />
    </Icon>
  ),
  House: (p: IconProps) => (
    <Icon {...p}>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
    </Icon>
  ),
  Inventory: (p: IconProps) => (
    <Icon {...p}>
      <rect x="3" y="7" width="18" height="14" rx="1.5" />
      <path d="M3 11h18" />
      <path d="M9 7V3h6v4" />
    </Icon>
  ),
  Money: (p: IconProps) => (
    <Icon {...p}>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <circle cx="12" cy="12.5" r="2.5" />
      <path d="M6 9h.01" />
      <path d="M18 16h.01" />
    </Icon>
  ),
  People: (p: IconProps) => (
    <Icon {...p}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20c0-3 2.5-5 6-5s6 2 6 5" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15 14c3 0 5 1.5 5 4" />
    </Icon>
  ),
  Truck: (p: IconProps) => (
    <Icon {...p}>
      <rect x="2" y="7" width="12" height="9" rx="1" />
      <path d="M14 10h4l3 3v3h-7Z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </Icon>
  ),
  Cart: (p: IconProps) => (
    <Icon {...p}>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="17" cy="20" r="1.5" />
      <path d="M2 3h3l2 12h11l2-8H6" />
    </Icon>
  ),
  Chat: (p: IconProps) => (
    <Icon {...p}>
      <path d="M21 12a8 8 0 0 1-12.5 6.6L3 20l1.4-5.5A8 8 0 1 1 21 12Z" />
    </Icon>
  ),
  Settings: (p: IconProps) => (
    <Icon {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a2 2 0 0 0 .4 2.2l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a2 2 0 0 0-2.2-.4 2 2 0 0 0-1.2 1.8V21a2 2 0 1 1-4 0v-.1a2 2 0 0 0-1.2-1.8 2 2 0 0 0-2.2.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a2 2 0 0 0 .4-2.2 2 2 0 0 0-1.8-1.2H3a2 2 0 1 1 0-4h.1a2 2 0 0 0 1.8-1.2 2 2 0 0 0-.4-2.2l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a2 2 0 0 0 2.2.4H10a2 2 0 0 0 1.2-1.8V3a2 2 0 1 1 4 0v.1a2 2 0 0 0 1.2 1.8 2 2 0 0 0 2.2-.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a2 2 0 0 0-.4 2.2V10a2 2 0 0 0 1.8 1.2H21a2 2 0 1 1 0 4h-.1a2 2 0 0 0-1.8 1.2Z" />
    </Icon>
  ),
  Search: (p: IconProps) => (
    <Icon {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Icon>
  ),
  Plus: (p: IconProps) => (
    <Icon {...p}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Icon>
  ),
  Bell: (p: IconProps) => (
    <Icon {...p}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </Icon>
  ),
  ChevDown: (p: IconProps) => (
    <Icon {...p}>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  ),
  ChevRight: (p: IconProps) => (
    <Icon {...p}>
      <path d="m9 6 6 6-6 6" />
    </Icon>
  ),
  X: (p: IconProps) => (
    <Icon {...p}>
      <path d="M6 6l12 12" />
      <path d="m18 6-12 12" />
    </Icon>
  ),
  Check: (p: IconProps) => (
    <Icon {...p}>
      <path d="M5 12l5 5L20 7" />
    </Icon>
  ),
  Download: (p: IconProps) => (
    <Icon {...p}>
      <path d="M12 4v12" />
      <path d="m7 12 5 5 5-5" />
      <path d="M5 20h14" />
    </Icon>
  ),
  Alert: (p: IconProps) => (
    <Icon {...p}>
      <path d="M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6A2 2 0 0 0 22 18L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </Icon>
  ),
  Info: (p: IconProps) => (
    <Icon {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01" />
      <path d="M11 12h1v4h1" />
    </Icon>
  ),
  TrendUp: (p: IconProps) => (
    <Icon {...p}>
      <path d="m3 17 6-6 4 4 8-8" />
      <path d="M14 7h7v7" />
    </Icon>
  ),
  TrendDown: (p: IconProps) => (
    <Icon {...p}>
      <path d="m3 7 6 6 4-4 8 8" />
      <path d="M14 17h7v-7" />
    </Icon>
  ),
  Phone: (p: IconProps) => (
    <Icon {...p}>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 19h2" />
    </Icon>
  ),
  WhatsApp: (p: IconProps) => (
    <Icon {...p}>
      <path d="M21 12a9 9 0 1 1-3.5-7.1L21 4l-.9 3.4A9 9 0 0 1 21 12Z" />
      <path d="M8.5 8.5c0 4 3 7 7 7l1.5-2-3-1.5-1 1c-1 0-2.5-1.5-2.5-2.5l1-1L10 6.5 8.5 8.5Z" />
    </Icon>
  ),
  More: (p: IconProps) => (
    <Icon {...p}>
      <circle cx="6" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </Icon>
  ),
  Sun: (p: IconProps) => (
    <Icon {...p}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Icon>
  ),
  Moon: (p: IconProps) => (
    <Icon {...p}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </Icon>
  ),
  Sparkles: (p: IconProps) => (
    <Icon {...p}>
      <path d="M12 3v4M6 6l2 2M16 8l2-2M3 12h4M17 12h4M6 18l2-2M16 16l2 2M12 17v4" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  ),
  Warning: (p: IconProps) => (
    <Icon {...p}>
      <path d="M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6A2 2 0 0 0 22 18L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </Icon>
  ),
  Naira: (p: IconProps) => (
    <Icon {...p}>
      <path d="M6 4v16" />
      <path d="M18 4v16" />
      <path d="M6 9h12" />
      <path d="M6 15h12" />
      <path d="M6 4l12 16" />
    </Icon>
  ),
  Weight: (p: IconProps) => (
    <Icon {...p}>
      <rect x="3" y="10" width="18" height="11" rx="2" />
      <path d="M9 10V7a3 3 0 0 1 6 0v3" />
      <path d="M12 14v3" />
    </Icon>
  ),
  AI: (p: IconProps) => (
    <Icon {...p}>
      <path d="M12 2a3 3 0 0 1 3 3v1a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" />
      <path d="M5 12a7 7 0 0 1 14 0" />
      <path d="M9 17l-2 4" />
      <path d="M15 17l2 4" />
      <path d="M9 21h6" />
    </Icon>
  ),
  Globe: (p: IconProps) => (
    <Icon {...p}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
    </Icon>
  ),
  Link: (p: IconProps) => (
    <Icon {...p}>
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.8 1.7" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.8-1.7" />
    </Icon>
  ),
  Copy: (p: IconProps) => (
    <Icon {...p}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </Icon>
  ),
  ExternalLink: (p: IconProps) => (
    <Icon {...p}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14L21 3" />
    </Icon>
  ),
  Shield: (p: IconProps) => (
    <Icon {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </Icon>
  ),
  Refresh: (p: IconProps) => (
    <Icon {...p}>
      <path d="M1 4v6h6" />
      <path d="M23 20v-6h-6" />
      <path d="M20.5 9A9 9 0 0 0 5.6 5.6L1 10" />
      <path d="M3.5 15a9 9 0 0 0 14.9 3.4L23 14" />
    </Icon>
  ),
};

export type IconName = keyof typeof Icons;
