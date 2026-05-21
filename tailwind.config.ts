import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        card: "var(--bg-card)",
        subtle: "var(--bg-subtle)",
        hover: "var(--bg-hover)",
        border: "var(--border)",
        fg: "var(--fg)",
        muted: "var(--fg-muted)",
        faint: "var(--fg-faint)",
        accent: {
          DEFAULT: "var(--accent)",
          subtle: "var(--accent-subtle)",
          fg: "var(--accent-fg)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          subtle: "var(--danger-subtle)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          subtle: "var(--warning-subtle)",
        },
        success: {
          DEFAULT: "var(--success)",
          subtle: "var(--success-subtle)",
        },
        info: {
          DEFAULT: "var(--info)",
          subtle: "var(--info-subtle)",
        },
        sidebar: {
          bg: "var(--sidebar-bg)",
          fg: "var(--sidebar-fg)",
          muted: "var(--sidebar-muted)",
          active: "var(--sidebar-active)",
          hover: "var(--sidebar-hover)",
          border: "var(--sidebar-border)",
        },
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        sm: "var(--radius-sm)",
        lg: "var(--radius-lg)",
      },
      fontSize: {
        "2xs": ["10.5px", { lineHeight: "1.4" }],
        xs: ["11.5px", { lineHeight: "1.5" }],
        sm: ["13px", { lineHeight: "1.5" }],
        base: ["14px", { lineHeight: "1.5" }],
        lg: ["15px", { lineHeight: "1.5" }],
        xl: ["18px", { lineHeight: "1.3" }],
        "2xl": ["22px", { lineHeight: "1.2" }],
        "3xl": ["28px", { lineHeight: "1.1" }],
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.05), 0 0 0 1px var(--border)",
        "card-md": "0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px var(--border)",
      },
    },
  },
  plugins: [],
};

export default config;
