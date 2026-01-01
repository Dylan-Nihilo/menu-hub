import React from 'react'
import { Text, StyleSheet, Pressable, ViewStyle, TextStyle } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors, borderRadius, fontSize, fontWeight, animation } from '../../lib/theme'

interface TagProps {
  label: string
  active?: boolean
  onPress?: () => void
  icon?: keyof typeof Feather.glyphMap
  size?: 'sm' | 'md' | 'lg'
  variant?: 'filled' | 'outlined'
  style?: ViewStyle
  textStyle?: TextStyle
}

export function Tag({
  label,
  active = false,
  onPress,
  icon,
  size = 'md',
  variant = 'filled',
  style,
  textStyle,
}: TagProps) {
  const sizeStyles = {
    sm: { height: 28, paddingHorizontal: 12, iconSize: 12, fontSize: fontSize.xs },
    md: { height: 32, paddingHorizontal: 16, iconSize: 14, fontSize: fontSize.sm },
    lg: { height: 36, paddingHorizontal: 20, iconSize: 16, fontSize: fontSize.md },
  }

  const s = sizeStyles[size]

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.container,
        { height: s.height, paddingHorizontal: s.paddingHorizontal },
        active ? styles.active : (variant === 'outlined' ? styles.outlined : styles.inactive),
        pressed && styles.pressed,
        style,
      ]}
    >
      {icon && (
        <Feather
          name={icon}
          size={s.iconSize}
          color={active ? colors.textInverse : colors.textSecondary}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.text,
          { fontSize: s.fontSize },
          active ? styles.textActive : styles.textInactive,
          textStyle,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  inactive: {
    backgroundColor: colors.card,
  },
  active: {
    backgroundColor: colors.primary,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    transform: [{ scale: animation.press.scale }],
    opacity: 0.9,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: fontWeight.medium,
  },
  textInactive: {
    color: colors.textSecondary,
  },
  textActive: {
    color: colors.textInverse,
  },
})
