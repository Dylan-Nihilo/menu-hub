import React from 'react'
import { View, StyleSheet, Pressable, Text } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated'
import { Feather } from '@expo/vector-icons'
import { springConfig } from '../../lib/motion'

interface SwipeableRowProps {
  children: React.ReactNode
  onDelete?: () => void
  deleteThreshold?: number
}

const DELETE_WIDTH = 80
const SNAP_THRESHOLD = 40

export function SwipeableRow({
  children,
  onDelete,
  deleteThreshold = -DELETE_WIDTH,
}: SwipeableRowProps) {
  const translateX = useSharedValue(0)
  const isOpen = useSharedValue(false)

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      const newValue = event.translationX + (isOpen.value ? deleteThreshold : 0)
      // 限制滑动范围
      translateX.value = Math.max(deleteThreshold * 1.2, Math.min(0, newValue))
    })
    .onEnd((event) => {
      const shouldOpen = translateX.value < -SNAP_THRESHOLD
      const shouldDelete = translateX.value < deleteThreshold * 1.1

      if (shouldDelete && onDelete) {
        // 滑动超过阈值，执行删除
        translateX.value = withTiming(-500, { duration: 200 }, () => {
          runOnJS(onDelete)()
        })
      } else if (shouldOpen) {
        // 打开删除按钮
        translateX.value = withSpring(deleteThreshold, springConfig.gentle)
        isOpen.value = true
      } else {
        // 关闭
        translateX.value = withSpring(0, springConfig.gentle)
        isOpen.value = false
      }
    })

  const handleDelete = () => {
    translateX.value = withTiming(-500, { duration: 200 }, () => {
      if (onDelete) runOnJS(onDelete)()
    })
  }

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  const deleteButtonStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.abs(translateX.value) / SNAP_THRESHOLD),
  }))

  return (
    <View style={styles.container}>
      {/* 删除按钮背景 */}
      <Animated.View style={[styles.deleteContainer, deleteButtonStyle]}>
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Feather name="trash-2" size={20} color="#fff" />
          <Text style={styles.deleteText}>删除</Text>
        </Pressable>
      </Animated.View>

      {/* 内容 */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.content, contentStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    backgroundColor: '#fff',
  },
  deleteContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DELETE_WIDTH,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
})
