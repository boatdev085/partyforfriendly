export const theme = {
  colors: {
    bg: "#0d0f14",
    bgCard: "#161920",
    bgHover: "#1e2130",
    border: "#252836",
    borderLight: "#2e3347",
    primary: "#7c6aff",
    primaryHover: "#6b58f0",
    primaryGlow: "rgba(124, 106, 255, 0.25)",
    accent: "#00d4aa",
    accentGlow: "rgba(0, 212, 170, 0.2)",
    text: "#e8eaf0",
    textMuted: "#8a8fa8",
    textDim: "#5a5f75",
    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    full: "#f97316",
  },
  fonts: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  radii: {
    sm: "6px",
    md: "10px",
    lg: "16px",
    xl: "24px",
    full: "9999px",
  },
  shadows: {
    card: "0 2px 12px rgba(0,0,0,0.4)",
    glow: "0 0 20px rgba(124, 106, 255, 0.3)",
  },
};

export type Theme = typeof theme;
