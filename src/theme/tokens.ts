// Design tokens. Single source for the MUI theme and the CSS custom properties
// (see GlobalTokens), so emotion components and MUI components stay in sync.
//
// Neutrals are a cool graphite; the only accent is an indigo derived from the
// HOPR navy (hue 240).

export type ColorMode = 'light' | 'dark';

export type Tokens = {
  bg: string;
  surface: string;
  surface2: string;
  surface3: string;
  border: string;
  borderStrong: string;
  text: string;
  text2: string;
  text3: string;
  accent: string;
  accentHover: string;
  accentContrast: string;
  accentSoft: string;
  accentText: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  focus: string;
  shadowOverlay: string;
  scrollbar: string;
};

export const tokens: Record<ColorMode, Tokens> = {
  light: {
    bg: '#f6f6f8',
    surface: '#ffffff',
    surface2: '#f3f3f6',
    surface3: '#eaeaef',
    border: '#e4e4ea',
    borderStrong: '#d2d2db',
    text: '#17171f',
    text2: '#53535f',
    text3: '#8a8a96',
    accent: '#3434c4',
    accentHover: '#2a2aa6',
    accentContrast: '#ffffff',
    accentSoft: '#eeeefc',
    accentText: '#2c2cad',
    success: '#17804b',
    successSoft: '#e7f4ec',
    warning: '#a35a00',
    warningSoft: '#fbf1e2',
    danger: '#c3352f',
    dangerSoft: '#fcebea',
    focus: 'rgba(52, 52, 196, 0.35)',
    shadowOverlay: '0 12px 32px -8px rgba(23, 23, 31, 0.18), 0 2px 6px rgba(23, 23, 31, 0.06)',
    scrollbar: '#d2d2db',
  },
  dark: {
    bg: '#0d0d11',
    surface: '#141419',
    surface2: '#1a1a21',
    surface3: '#22222b',
    border: '#25252e',
    borderStrong: '#33333e',
    text: '#ececf1',
    text2: '#a5a5b0',
    text3: '#6f6f7b',
    accent: '#8c8cf2',
    accentHover: '#a3a3f6',
    accentContrast: '#0d0d11',
    accentSoft: 'rgba(140, 140, 242, 0.12)',
    accentText: '#a9a9f7',
    success: '#45b97c',
    successSoft: 'rgba(69, 185, 124, 0.12)',
    warning: '#e0a443',
    warningSoft: 'rgba(224, 164, 67, 0.12)',
    danger: '#ef6a63',
    dangerSoft: 'rgba(239, 106, 99, 0.12)',
    focus: 'rgba(140, 140, 242, 0.45)',
    shadowOverlay: '0 16px 40px -8px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.04)',
    scrollbar: '#33333e',
  },
};

export const fonts = {
  sans: "'IBM Plex Sans Variable', 'IBM Plex Sans', system-ui, -apple-system, 'Segoe UI', sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace",
};

export const radius = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
};

// Layout dimensions shared by the navbar, drawer, content and info bar.
export const layout = {
  navBarHeight: 52,
  drawerWidth: 232,
  minDrawerWidth: 56,
  infoBarWidth: 264,
};

// Maps every token to a CSS custom property name, e.g. surface2 -> --surface-2.
const cssVarName = (key: string) =>
  `--${key
    .replace(/([A-Z])/g, '-$1')
    .replace(/(\d)/g, '-$1')
    .toLowerCase()}`;

export const toCssVars = (t: Tokens) =>
  Object.fromEntries(Object.entries(t).map(([key, value]) => [cssVarName(key), value]));

// `v.surface2` -> 'var(--surface-2)', for use in emotion template literals.
export const v = Object.fromEntries(Object.keys(tokens.light).map((key) => [key, `var(${cssVarName(key)})`])) as Record<
  keyof Tokens,
  string
>;
