import React, { useEffect } from 'react'
import { ViewStyle } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated'
import { colors, borderRadius } from '../../lib/theme'

interface SkeletonProps {
  width?: number | string
  height?: number
  radius?: number
  style?: ViewStyle
  delay?: number // 错开动画延迟
}

export function Skeleton({
  width = '100%',
  height = 20,
  radius = borderRadius.md,
  style,
  delay = 0,
}: SkeletonProps) {
  const opacity = useSharedValue(0.4)

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0.8, {
          duration: 1000,
          easing: Easing.inOut(Easing.ease)
        }),
        -1,
        true
      )
    )
  }, [delay])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius: radius,
          backgroundColor: colors.gray200,
        },
        animatedStyle,
        style,
      ]}
    />
  )
}
