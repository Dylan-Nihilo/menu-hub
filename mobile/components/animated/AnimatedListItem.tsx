import React, { useEffect } from 'react'
import { ViewStyle } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated'
import { motion, listAnimation, isReduceMotionEnabled, getDuration } from '../../lib/motion'

interface AnimatedListItemProps {
  children: React.ReactNode
  style?: ViewStyle
  index?: number
  isDeleting?: boolean
  onDeleteComplete?: () => void
  enableEntrance?: boolean
}

export function AnimatedListItem({
  children,
  style,
  index = 0,
  isDeleting = false,
  onDeleteComplete,
  enableEntrance = true,
}: AnimatedListItemProps) {
  const { entrance, exit, staggerDelay, maxStaggerItems } = listAnimation

  const opacity = useSharedValue(enableEntrance ? entrance.opacity : 1)
  const translateY = useSharedValue(enableEntrance ? entrance.translateY : 0)
  const scale = useSharedValue(enableEntrance ? entrance.scale : 1)

  // 入场动画
  useEffect(() => {
    if (!enableEntrance || isReduceMotionEnabled()) {
      opacity.value = 1
      translateY.value = 0
      scale.value = 1
      return
    }

    // 极小 stagger，最多前 N 个
    const staggerIndex = Math.min(index, maxStaggerItems)
    const delay = staggerIndex * staggerDelay
    const duration = getDuration(entrance.duration)

    opacity.value = withDelay(delay, withTiming(1, { duration }))
    translateY.value = withDelay(delay, withTiming(0, {
      duration,
      easing: Easing.out(Easing.cubic),
    }))
    scale.value = withDelay(delay, withTiming(1, { duration }))
  }, [])

  // 退出动画
  useEffect(() => {
    if (!isDeleting) return

    const duration = getDuration(exit.duration)
    if (duration === 0) {
      onDeleteComplete?.()
      return
    }

    opacity.value = withTiming(exit.opacity, { duration })
    scale.value = withTiming(exit.scale, { duration })
    translateY.value = withTiming(exit.translateY, { duration }, () => {
      if (onDeleteComplete) runOnJS(onDeleteComplete)()
    })
  }, [isDeleting])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }))

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  )
}
