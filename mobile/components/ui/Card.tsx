import { View, StyleSheet, ViewProps } from 'react-native'
import { colors, borderRadius, spacing } from '../../constants'

interface CardProps extends ViewProps {
  children: React.ReactNode
}

export function Card({ children, style, ...props }: CardProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
  },
})
