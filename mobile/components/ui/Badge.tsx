import { View, Text, StyleSheet } from 'react-native'
import { colors, typography, borderRadius, spacing } from '../../constants'

interface BadgeProps {
  label: string
  variant?: 'default' | 'active'
}

export function Badge({ label, variant = 'default' }: BadgeProps) {
  return (
    <View style={[styles.badge, variant === 'active' && styles.active]}>
      <Text style={[styles.text, variant === 'active' && styles.activeText]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
  },
  active: { backgroundColor: colors.primary },
  text: { ...typography.caption, color: colors.text.secondary },
  activeText: { color: colors.background },
})
