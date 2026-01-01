import React, { useEffect } from 'react'
import { ViewStyle } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated'
import { motion } from '../../lib/motion'

interface FadeInViewProps {
  children: React.ReactNode
  style?: ViewStyle
  delay?: number
  duration?: number
  slideUp?: boolean
}

export function FadeInView({
  children,
  style,
  delay = 0,
  duration = motion.duration.normal,
  slideUp = true,
}: FadeInViewProps) {
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(slideUp ? 12 : 0)

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration }))
    if (slideUp) {
      translateY.value = withDelay(delay, withTiming(0, { duration }))
    }
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  )
}
