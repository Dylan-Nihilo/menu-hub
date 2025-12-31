export const colors = {
  primary: { 500: '#FF6B6B', 600: '#FF5252', 700: '#FF3838' },
  neutral: { 100: '#F5F5F5', 500: '#666666', 900: '#0a0a0a' },
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
}

export const spacing = {
  xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '20px', '2xl': '24px',
}

export const borderRadius = {
  sm: '4px', md: '6px', lg: '8px', xl: '12px', '2xl': '16px',
}

export const componentSizes = {
  button: {
    xs: { height: '32px', padding: '0 12px', fontSize: '12px' },
    sm: { height: '40px', padding: '0 16px', fontSize: '13px' },
    md: { height: '48px', padding: '0 20px', fontSize: '15px' },
    lg: { height: '56px', padding: '0 24px', fontSize: '17px' },
  },
}

export default { colors, spacing, borderRadius, componentSizes }
