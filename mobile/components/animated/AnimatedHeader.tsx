import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated'

interface AnimatedHeaderProps {
  scrollY: SharedValue<number>
  title: string
  minHeight?: number
  maxHeight?: number
  children?: React.ReactNode
  style?: ViewStyle
}

const DEFAULT_MIN_HEIGHT = 60
const DEFAULT_MAX_HEIGHT = 120

export function AnimatedHeader({
  scrollY,
  title,
  minHeight = DEFAULT_MIN_HEIGHT,
  maxHeight = DEFAULT_MAX_HEIGHT,
  children,
  style,
}: AnimatedHeaderProps) {
  const scrollRange = maxHeight - minHeight

  const headerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, scrollRange],
      [maxHeight, minHeight],
      Extrapolation.CLAMP
    )
    return { height }
  })

  const titleStyle = useAnimatedStyle(() => {
    const fontSize = interpolate(
      scrollY.value,
      [0, scrollRange],
      [28, 17],
      Extrapolation.CLAMP
    )
    const translateY = interpolate(
      scrollY.value,
      [0, scrollRange],
      [0, -8],
      Extrapolation.CLAMP
    )
    return {
      fontSize,
      transform: [{ translateY }],
    }
  })

  return (
    <Animated.View style={[styles.header, headerStyle, style]}>
      <Animated.Text style={[styles.title, titleStyle]}>
        {title}
      </Animated.Text>
      {children}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontWeight: '700',
    color: '#0a0a0a',
  },
})
