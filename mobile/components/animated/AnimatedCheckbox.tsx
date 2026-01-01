import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { Feather } from '@expo/vector-icons'
import { springConfig } from '../../lib/motion'
import { colors, borderRadius } from '../../lib/theme'

interface AnimatedCheckboxProps {
  checked: boolean
  size?: number
}

export function AnimatedCheckbox({ checked, size = 20 }: AnimatedCheckboxProps) {
  const scale = useSharedValue(checked ? 1 : 0)

  useEffect(() => {
    scale.value = withSpring(checked ? 1 : 0, springConfig.bouncy)
  }, [checked])

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }))

  return (
    <View style={[
      styles.box,
      { width: size, height: size, borderRadius: size / 4 },
      checked && styles.boxChecked
    ]}>
      <Animated.View style={checkStyle}>
        <Feather name="check" size={size * 0.6} color="#fff" />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 2,
    borderColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  boxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
})
