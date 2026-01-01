// 重新导出 theme.ts 作为唯一数据源
import { colors as themeColors, spacing, borderRadius, fontSize, fontWeight, shadows, animation, componentSizes } from '../lib/theme'

// 兼容旧的 colors 结构
export const colors = {
  primary: themeColors.primary,
  background: themeColors.background,
  surface: themeColors.card,
  text: {
    primary: themeColors.textPrimary,
    secondary: themeColors.textSecondary,
    muted: themeColors.textTertiary,
  },
  border: themeColors.border,
  // 新增
  ...themeColors,
}

export const typography = {
  h1: { fontSize: fontSize['3xl'], fontWeight: fontWeight.semibold },
  h2: { fontSize: fontSize.xl, fontWeight: fontWeight.semibold },
  h3: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  body: { fontSize: fontSize.base, fontWeight: fontWeight.normal },
  caption: { fontSize: fontSize.sm, fontWeight: fontWeight.normal },
  small: { fontSize: fontSize.xs, fontWeight: fontWeight.normal },
}

export { spacing, borderRadius, fontSize, fontWeight, shadows, animation, componentSizes }
