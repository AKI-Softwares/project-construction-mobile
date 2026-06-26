import { LightColors, DarkColors } from '@/theme/colors';
import { useThemeStore } from '@/store/theme.store';

export function useTheme() {
  const { isDark, toggle } = useThemeStore();
  return {
    colors: isDark ? DarkColors : LightColors,
    isDark,
    toggle,
  };
}
