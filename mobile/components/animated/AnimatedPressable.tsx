import React from 'react'
import { Pressable, PressableProps, ViewStyle } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated'
import { motion, springConfig, isReduceMotionEnabled, getDuration } from '../../lib/motion'

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable)

interface AnimatedPressableProps extends PressableProps {
  children: React.ReactNode
  style?: ViewStyle | ViewStyle[]
  scaleOnPress?: number
  animationType?: 'timing' | 'spring'
}

export function AnimatedPressable({
  children,
  style,
  scaleOnPress = motion.scale.pressed,
  animationType = 'spring',
  onPressIn,
  onPressOut,
  ...props
}: AnimatedPressableProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = (e: any) => {
    // 尊重用户的 reduce-motion 偏好
    if (isReduceMotionEnabled()) {
      onPressIn?.(e)
      return
    }

    if (animationType === 'spring') {
      scale.value = withSpring(scaleOnPress, springConfig.stiff)
    } else {
      scale.value = withTiming(scaleOnPress, { duration: getDuration(motion.duration.fast) })
    }
    onPressIn?.(e)
  }

  const handlePressOut = (e: any) => {
    if (isReduceMotionEnabled()) {
      onPressOut?.(e)
      return
    }

    if (animationType === 'spring') {
      scale.value = withSpring(1, springConfig.gentle)
    } else {
      scale.value = withTiming(1, { duration: getDuration(motion.duration.fast) })
    }
    onPressOut?.(e)
  }

  return (
    <AnimatedPressableBase
      style={[animatedStyle, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
    >
      {children}
    </AnimatedPressableBase>
  )
}
