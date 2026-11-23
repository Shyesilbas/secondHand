import { theme } from './theme.js';

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const hexToRgbTuple = (hex) => {
  if (!hex || !HEX_RE.test(hex)) return null;
  const raw = hex.slice(1);
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  const n = parseInt(full, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
};

const readCssVar = (name) => {
  if (typeof window === 'undefined' || !document?.documentElement) return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
};

/**
 * Reads an RGB-channel CSS variable (e.g. "15 23 42") when present, otherwise falls back to a hex color.
 * Returns a valid CSS rgb()/rgba() string for canvas/SVG libraries (Chart.js, Leaflet) that cannot parse Tailwind classes.
 */
export const resolveRgbColor = (cssVarName, fallbackHex, alpha = 1) => {
  const raw = readCssVar(cssVarName);
  const tuple = raw
    ? raw.replace(/\s+/g, ', ')
    : hexToRgbTuple(fallbackHex) || '15, 23, 42';
  return alpha < 1 ? `rgba(${tuple}, ${alpha})` : `rgb(${tuple})`;
};

/**
 * Resolves the active color scheme ('light' | 'dark') from <meta name="color-scheme"> and OS preference.
 * Returns 'light' when the page only declares light mode.
 */
export const resolveActiveColorScheme = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 'light';
  const meta = document.querySelector('meta[name="color-scheme"]')?.getAttribute('content')?.trim().toLowerCase();
  if (meta === 'dark') return 'dark';
  if (meta === 'light' || !meta) return 'light';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const resolveChartColors = () => ({
  line: resolveRgbColor('--color-text-primary', theme.colors.text.primary),
  areaTop: resolveRgbColor('--color-text-primary', theme.colors.text.primary, 0.14),
  areaSoft: resolveRgbColor('--color-text-primary', theme.colors.text.primary, 0.06),
  areaBottom: resolveRgbColor('--color-text-primary', theme.colors.text.primary, 0),
  pointFill: resolveRgbColor('--color-bg-primary', theme.colors.background.primary),
  tick: resolveRgbColor('--color-text-tertiary', theme.colors.text.tertiary),
  grid: resolveRgbColor('--color-border', theme.colors.border.DEFAULT, 0.35),
  tooltipBg: resolveRgbColor('--color-bg-dark', theme.colors.background.dark, 0.94),
  tooltipBorder: resolveRgbColor('--color-border', theme.colors.border.DEFAULT, 0.25),
  tooltipText: resolveRgbColor('--color-text-inverse', theme.colors.text.inverse),
});

export const resolveMapColors = () => ({
  areaColor: resolveRgbColor('--color-accent-teal', theme.colors.accent.teal.DEFAULT),
});
