import { useMemo } from 'react';
import { LightColors, DarkColors } from '@/theme/colors';
import { useThemeStore } from '@/store/theme.store';

export function useTheme() {
  const isDark = useThemeStore((s) => s.isDark);
  const toggle = useThemeStore((s) => s.toggle);
  return useMemo(() => ({
    colors: isDark ? DarkColors : LightColors,
    isDark,
    toggle,
  }), [isDark, toggle]);
}
