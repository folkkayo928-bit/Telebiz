export type StoreTheme = Record<string, string | boolean>;
const DEFAULTS: StoreTheme = { primaryColor: '#09090B', accentColor: '#2563EB', fontFamily: 'Plus Jakarta Sans' };
export function normalizeStoreTheme(input: unknown, fallback: Record<string, unknown> = {}): StoreTheme {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input as Record<string, unknown> : {};
  const result: StoreTheme = { ...DEFAULTS };
  const keys = ['primaryColor','accentColor','backgroundColor','fontFamily','tastePreset','backgroundType','backgroundPattern','pageDarkness','headingTransform','productCardStyle','productGridColumns','productAspectRatio','cardRadius','cardBackgroundStyle','headerStyle','buttonStyle'];
  for (const key of keys) { const v = source[key] ?? fallback[key]; if (typeof v !== 'string' || !v.trim() || v.length > 80) continue; const clean = v.trim(); if (['primaryColor', 'accentColor', 'backgroundColor'].includes(key)) { if (/^#[0-9a-fA-F]{6}$/.test(clean)) result[key] = clean.toUpperCase(); } else { result[key] = clean; } }
  for (const key of ['showStockBadges','showStarRatings']) { const v = source[key] ?? fallback[key]; if (typeof v === 'boolean') result[key] = v; }
  return result;
}
export function validateBuilderPayload(layout: unknown, pages: unknown, theme: unknown): string | null {
  if (!Array.isArray(layout) || layout.length > 50) return 'Invalid store layout.';
  if (!Array.isArray(pages) || pages.length > 20) return 'Invalid store pages.';
  if (!theme || typeof theme !== 'object' || Array.isArray(theme)) return 'Invalid store theme.';
  return null;
}
