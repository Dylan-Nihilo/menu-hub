import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { colors, typography, borderRadius } from '../../constants'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  loading?: boolean
  disabled?: boolean
}

export function Button({ title, onPress, variant = 'primary', loading, disabled }: ButtonProps) {
  const isDisabled = loading || disabled

  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], isDisabled && styles.disabled]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.background : colors.primary} />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surface },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  disabled: { opacity: 0.5 },
  text: { ...typography.body, fontWeight: '600' },
  primaryText: { color: colors.background },
  secondaryText: { color: colors.text.primary },
  outlineText: { color: colors.text.primary },
})
