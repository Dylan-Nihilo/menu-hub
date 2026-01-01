import React, { useEffect } from 'react'
import { Modal, Pressable, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { BlurView } from 'expo-blur'
import { modalAnimation, isReduceMotionEnabled, getDuration, motion } from '../../lib/motion'

interface AnimatedModalProps {
  visible: boolean
  onClose: () => void
  children: React.ReactNode
}

export function AnimatedModal({ visible, onClose, children }: AnimatedModalProps) {
  const { overlay, content } = modalAnimation

  const scale = useSharedValue(content.scale.from)
  const translateY = useSharedValue(content.translateY.from)
  const opacity = useSharedValue(0)
  const overlayOpacity = useSharedValue(0)

  useEffect(() => {
    const reduceMotion = isReduceMotionEnabled()
    const contentDuration = getDuration(content.duration)
    const overlayDuration = getDuration(overlay.duration)

    if (visible) {
      overlayOpacity.value = withTiming(overlay.opacity.to, { duration: overlayDuration })
      scale.value = withTiming(content.scale.to, {
        duration: contentDuration,
        easing: Easing.out(Easing.cubic),
      })
      translateY.value = withTiming(content.translateY.to, {
        duration: contentDuration,
        easing: Easing.out(Easing.cubic),
      })
      opacity.value = withTiming(content.opacity.to, { duration: contentDuration })
    } else {
      const exitDuration = contentDuration * 0.7
      overlayOpacity.value = withTiming(0, { duration: overlayDuration })
      scale.value = withTiming(content.scale.from, { duration: exitDuration })
      translateY.value = withTiming(content.translateY.from, { duration: exitDuration })
      opacity.value = withTiming(0, { duration: exitDuration })
    }
  }, [visible])

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }))

  const overlayStyle = useAnimatedStyle(() => ({
    backgroundColor: `rgba(0, 0, 0, ${overlayOpacity.value})`,
  }))

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <BlurView intensity={motion.blur.light} tint="dark" style={StyleSheet.absoluteFill} />
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View style={[styles.content, contentStyle]}>
          {children}
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  content: { width: '85%', maxWidth: 340 },
})
