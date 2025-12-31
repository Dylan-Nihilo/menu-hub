/**
 * 设计系统常量
 * 用于在 TypeScript/JavaScript 中引用设计系统的值
 */

// ==================== 颜色系统 ====================

export const colors = {
  // 品牌色（温暖红系）
  primary: {
    50: '#FFF5F5',
    100: '#FFE5E5',
    200: '#FFC9C9',
    300: '#FF9999',
    400: '#FF7777',
    500: '#FF6B6B', // 主色
    600: '#FF5252',
    700: '#FF3838',
    800: '#E63946',
    900: '#D62828',
  },

  // 中性色
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#999999',
    500: '#666666',
    600: '#525252',
    700: '#1A1A1A',
    800: '#0F0F0F',
    900: '#0a0a0a',
  },

  // 语义色
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // 背景和表面色
  background: '#FFFFFF',
  surface: '#FAFAFA',
  border: '#E5E5E5',
}

// ==================== 排版系统 ====================

export const typography = {
  // 字体大小
  fontSize: {
    xs: '12px',
    sm: '13px',
    base: '15px',
    lg: '17px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '28px',
    '4xl': '32px',
  },

  // 行高
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // 字重
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // 预设文本样式
  styles: {
    h1: {
      fontSize: '32px',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '28px',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '24px',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '20px',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '17px',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '15px',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body: {
      fontSize: '15px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '13px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    small: {
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
  },
}

// ==================== 间距系统 ====================

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px',
  '5xl': '48px',
}

// ==================== 圆角系统 ====================

export const borderRadius = {
  none: '0px',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '20px',
  full: '9999px',
}

// ==================== 阴影系统 ====================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
}

// ==================== 动画系统 ====================

export const animations = {
  // 过渡时间
  duration: {
    fast: '200ms',
    normal: '300ms',
    slow: '400ms',
  },

  // 缓动函数
  easing: {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    linear: 'linear',
  },

  // 预设动画
  presets: {
    fadeIn: {
      duration: 300,
      easing: 'ease-in-out',
    },
    slideUp: {
      duration: 300,
      easing: 'ease-out',
    },
    slideDown: {
      duration: 300,
      easing: 'ease-out',
    },
    scaleIn: {
      duration: 200,
      easing: 'ease-out',
    },
  },
}

// ==================== 组件尺寸 ====================

export const componentSizes = {
  button: {
    xs: { height: '32px', padding: '0 12px', fontSize: '12px' },
    sm: { height: '40px', padding: '0 16px', fontSize: '13px' },
    md: { height: '48px', padding: '0 20px', fontSize: '15px' },
    lg: { height: '56px', padding: '0 24px', fontSize: '17px' },
  },

  input: {
    sm: { height: '36px', padding: '0 12px', fontSize: '13px' },
    md: { height: '44px', padding: '0 16px', fontSize: '15px' },
    lg: { height: '52px', padding: '0 20px', fontSize: '17px' },
  },

  icon: {
    xs: '16px',
    sm: '20px',
    md: '24px',
    lg: '32px',
    xl: '40px',
  },

  avatar: {
    xs: '24px',
    sm: '32px',
    md: '40px',
    lg: '48px',
    xl: '64px',
  },
}

// ==================== 布局系统 ====================

export const layout = {
  navHeight: '64px',
  headerHeight: '56px',
  maxWidth: '1200px',
  containerPadding: '16px',
}

// ==================== 工具函数 ====================

/**
 * 获取颜色值
 * @example getColor('primary', 500) // '#FF6B6B'
 */
export function getColor(
  colorName: keyof typeof colors,
  shade?: number
): string {
  const color = colors[colorName]
  if (typeof color === 'string') {
    return color
  }
  if (shade && shade in color) {
    return color[shade as keyof typeof color]
  }
  return '#000000'
}

/**
 * 获取间距值
 * @example getSpacing('lg') // '16px'
 */
export function getSpacing(size: keyof typeof spacing): string {
  return spacing[size]
}

/**
 * 获取圆角值
 * @example getBorderRadius('xl') // '12px'
 */
export function getBorderRadius(size: keyof typeof borderRadius): string {
  return borderRadius[size]
}

/**
 * 获取阴影值
 * @example getShadow('md') // '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
 */
export function getShadow(size: keyof typeof shadows): string {
  return shadows[size]
}

/**
 * 生成 RGB 颜色值
 * @example rgbColor('#FF6B6B') // 'rgb(255, 107, 107)'
 */
export function rgbColor(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return hex
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  return `rgb(${r}, ${g}, ${b})`
}

/**
 * 生成 RGBA 颜色值
 * @example rgbaColor('#FF6B6B', 0.5) // 'rgba(255, 107, 107, 0.5)'
 */
export function rgbaColor(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return hex
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// ==================== 导出所有常量 ====================

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  componentSizes,
  layout,
}
