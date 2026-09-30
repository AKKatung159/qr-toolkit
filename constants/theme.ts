import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
} from '@expo-google-fonts/outfit';

export const COLORS = {
  primary: '#FF8A3D',
  primaryLight: '#FFD8BD',
  primaryPastel: '#FFEBDD',
  black: '#171717',
  darkGray: '#2A2A2A',
  gray: '#737373',
  background: '#FFF9F5',
  white: '#FFFFFF',
  line: '#F2E6DB',
  pastelGreen: '#DDF5E5',
  pastelBlue: '#DDEEFF',
  pastelPurple: '#E9DFFF',
  pastelYellow: '#FFF1B8',
  pastelPink: '#FFE0EC',
  danger: '#FF6B6B',
  dangerText: '#C23B3B',
} as const;

/**
 * Shape rule, used everywhere:
 * - surfaces (cards, sheets, grouped lists): 24px  → rounded-3xl
 * - icon tiles and inputs:                   16px  → rounded-2xl
 * - anything you press (buttons, chips):     pill  → rounded-full
 */

/** Shadows are tinted with the brand orange instead of black, so they sit on the warm background. */
export const SHADOW = {
  soft: '0px 6px 20px rgba(154, 74, 18, 0.08)',
  lifted: '0px 12px 32px rgba(154, 74, 18, 0.18)',
} as const;

/**
 * Outfit weights. Each weight is its own font family on Android, so screens use these
 * via the Tailwind `font-body*`, `font-title`, `font-display` classes, never `font-bold`.
 */
export const FONTS = {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
};
