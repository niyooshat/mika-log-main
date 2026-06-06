/**
 * Cottagecore soft-girl palette for mika
 * Warm creams, dusty roses, sage greens, and antique lavender.
 */

import { Platform } from 'react-native';

// ── Brand ────────────────────────────────────────────────────────────────────
export const CC = {
  // Backgrounds
  cream:        '#fdf6ee',   // warm parchment – main bg
  parchment:    '#f5ead8',   // slightly deeper warm bg for cards
  roseWhite:    '#fdf0f4',   // blush white for card surfaces
  // Accent pinks
  dustyRose:    '#d4849b',   // primary brand pink
  blush:        '#e8a0b0',   // lighter rose
  roseMist:     '#f2c5ce',   // very pale rose
  // Greens
  sage:         '#9aaa8a',   // sage green
  fern:         '#7a9270',   // deeper sage
  mossLight:    '#dde8d5',   // very pale sage for badges
  // Accent purple
  lavender:     '#c8b4d4',   // antique lavender
  lavenderMist: '#ede5f5',   // very pale lavender
  // Neutrals
  bark:         '#6b5040',   // warm brown – primary text
  mushroom:     '#9e8a78',   // muted brown – secondary text
  linen:        '#e8ddd0',   // divider / border
  // Utility
  error:        '#b05060',
  errorBg:      '#fceef0',
};

export const Colors = {
  light: {
    text:           CC.bark,
    background:     CC.cream,
    tint:           CC.dustyRose,
    icon:           CC.mushroom,
    tabIconDefault: CC.mushroom,
    tabIconSelected: CC.dustyRose,
  },
  dark: {
    text:           '#f5ead8',
    background:     '#2e2319',
    tint:           CC.blush,
    icon:           '#b09a84',
    tabIconDefault: '#b09a84',
    tabIconSelected: CC.blush,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
