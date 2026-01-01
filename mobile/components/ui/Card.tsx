import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { colors, borderRadius, spacing, shadows } from '../../lib/theme'

interface CardProps {
  children: React.ReactNode
  style?: ViewStyle
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({
  children,
  style,
  variant = 'default',
  padding = 'md',
}: CardProps) {
  return (
    <View
      style={[
        styles.card,
        variant === 'elevated' && shadows.md,
        variant === 'outlined' && styles.outlined,
        padding !== 'none' && styles[`padding_${padding}`],
        style,
      ]}
    >
      {children}
    </View>
  )
}

// 内层白色卡片，用于灰底容器内
interface CardInnerProps {
  children: React.ReactNode
  style?: ViewStyle
}

export function CardInner({ children, style }: CardInnerProps) {
  return (
    <View style={[styles.cardInner, style]}>
      {children}
    </View>
  )
}

// 列表项容器
interface CardListProps {
  children: React.ReactNode
  style?: ViewStyle
}

export function CardList({ children, style }: CardListProps) {
  return (
    <View style={[styles.cardList, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  outlined: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardInner: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  cardList: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  padding_sm: {
    padding: spacing.md,
  },
  padding_md: {
    padding: spacing.lg,
  },
  padding_lg: {
    padding: spacing.xl,
  },
})
