import { describe, expect, test } from 'bun:test';
import { normalizeStoreTheme, validateBuilderPayload } from './storeTheme';

describe('store theme persistence', () => {
  test('preserves saved custom colors and fonts', () => {
    const theme = normalizeStoreTheme({ primaryColor: '#123ABC', accentColor: '#ABCDEF', fontFamily: 'Fraunces' });
    expect(theme.primaryColor).toBe('#123ABC');
    expect(theme.accentColor).toBe('#ABCDEF');
    expect(theme.fontFamily).toBe('Fraunces');
  });
  test('uses business theme as a fallback for partial versions', () => {
    const theme = normalizeStoreTheme({ fontFamily: 'Cinzel' }, { primaryColor: '#445566' });
    expect(theme.primaryColor).toBe('#445566');
    expect(theme.fontFamily).toBe('Cinzel');
  });
  test('rejects invalid builder payload shapes', () => {
    expect(validateBuilderPayload([], [], {})).toBeNull();
    expect(validateBuilderPayload('bad', [], {})).not.toBeNull();
    expect(validateBuilderPayload([], Array(21).fill({}), {})).not.toBeNull();
  });
});
