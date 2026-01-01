import { TextInput, StyleSheet, TextInputProps } from 'react-native'
import { colors, typography, borderRadius, spacing } from '../../constants'

interface InputProps extends TextInputProps {
  error?: boolean
}

export function Input({ error, style, ...props }: InputProps) {
  return (
    <TextInput
      style={[styles.input, error && styles.error, style]}
      placeholderTextColor={colors.text.muted}
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  input: {
    height: 56,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.xl,
    ...typography.body,
    color: colors.text.primary,
  },
  error: {
    borderWidth: 1,
    borderColor: '#F44336',
  },
})
