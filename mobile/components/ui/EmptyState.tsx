import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'
import { colors, fontSize, fontWeight, borderRadius, animation } from '../../lib/theme'

interface EmptyStateProps {
  icon: keyof typeof Feather.glyphMap
  title: string
  subtitle?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gray100, colors.gray200]}
        style={styles.iconContainer}
      >
        <Feather name={icon} size={40} color={colors.textTertiary} />
      </LinearGradient>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionButtonPressed,
          ]}
          onPress={onAction}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 20,
  },
  actionButton: {
    marginTop: 20,
    height: 44,
    paddingHorizontal: 24,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonPressed: {
    transform: [{ scale: animation.press.scale }],
    opacity: 0.9,
  },
  actionText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textInverse,
  },
})
