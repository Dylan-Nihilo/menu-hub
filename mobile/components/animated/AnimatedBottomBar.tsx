import React, { useEffect } from 'react'
import { ViewStyle } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { motion, bottomBarAnimation, isReduceMotionEnabled, getDuration } from '../../lib/motion'

interface AnimatedBottomBarProps {
  children: React.ReactNode
  visible: boolean
  style?: ViewStyle
}

export function AnimatedBottomBar({ children, visible, style }: AnimatedBottomBarProps) {
  const insets = useSafeAreaInsets()
  const { translateY: ty, opacity: op, duration } = bottomBarAnimation

  const translateY = useSharedValue(ty.from)
  const opacity = useSharedValue(op.from)

  useEffect(() => {
    const dur = getDuration(duration)
    translateY.value = withTiming(visible ? ty.to : ty.from, {
      duration: dur,
      easing: Easing.out(Easing.cubic),
    })
    opacity.value = withTiming(visible ? op.to : op.from, { duration: dur })
  }, [visible])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }))

  if (!visible) return null

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <BlurView
        intensity={motion.blur.medium}
        tint="light"
        style={[styles.blur, { paddingBottom: Math.max(insets.bottom, 16) }, style]}
      >
        {children}
      </BlurView>
    </Animated.View>
  )
}

const styles = {
  container: { position: 'absolute' as const, bottom: 0, left: 0, right: 0 },
  blur: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
}
