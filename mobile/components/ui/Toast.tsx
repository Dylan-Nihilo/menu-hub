import { View, Text, StyleSheet, Animated } from 'react-native'
import { useEffect, useRef } from 'react'
import { colors, typography, borderRadius, spacing } from '../../constants'

interface ToastProps {
  message: string
  visible: boolean
  onHide: () => void
}

export function Toast({ message, visible, onHide }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => onHide())
    }
  }, [visible])

  if (!visible) return null

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: spacing['2xl'],
    right: spacing['2xl'],
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
  },
  text: { ...typography.body, color: colors.background },
})
