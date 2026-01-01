import { View, Text, StyleSheet } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { colors, typography, spacing } from '../../constants'

interface EmptyStateProps {
  icon: keyof typeof Feather.glyphMap
  title: string
  subtitle?: string
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Feather name={icon} size={40} color={colors.text.muted} />
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: spacing['2xl'] },
  title: { ...typography.body, fontWeight: '500', color: colors.text.primary, marginTop: spacing.lg },
  subtitle: { ...typography.caption, color: colors.text.muted, marginTop: spacing.xs },
})
