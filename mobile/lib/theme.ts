// Design System - 与 Web 端对齐的设计规范
// 基于 src/lib/utils/design-tokens.ts

export const colors = {
  // 主色调
  primary: '#0a0a0a',
  primaryLight: '#333333',

  // 中性色
  white: '#ffffff',
  background: '#ffffff',
  card: '#f5f5f5',
  cardInner: '#ffffff',

  // 灰度
  gray50: '#fafafa',
  gray100: '#f5f5f5',
  gray200: '#eeeeee',
  gray300: '#e0e0e0',
  gray400: '#bdbdbd',
  gray500: '#9e9e9e',
  gray600: '#757575',
  gray700: '#616161',

  // 文字
  textPrimary: '#0a0a0a',
  textSecondary: '#666666',
  textTertiary: '#a3a3a3',
  textInverse: '#ffffff',

  // 边框
  border: '#f5f5f5',
  borderLight: '#f0f0f0',

  // 透明度
  overlay: 'rgba(0, 0, 0, 0.5)',
  glassWhite: 'rgba(255, 255, 255, 0.8)',
  glassWhiteStrong: 'rgba(255, 255, 255, 0.95)',
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
}

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
}

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 14,
  base: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
}

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
}

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
}

// 动画配置
export const animation = {
  press: {
    scale: 0.98,
    duration: 100,
  },
  spring: {
    damping: 15,
    stiffness: 150,
  },
}

// 组件尺寸
export const componentSizes = {
  button: {
    sm: { height: 40, paddingHorizontal: 16 },
    md: { height: 48, paddingHorizontal: 20 },
    lg: { height: 56, paddingHorizontal: 24 },
  },
  input: {
    height: 48,
    paddingHorizontal: 16,
  },
  icon: {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  },
}

export default {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
  animation,
  componentSizes,
}
