import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated'
import { Feather } from '@expo/vector-icons'

interface RefreshIndicatorProps {
  refreshing: boolean
  progress?: number // 0-1 下拉进度
}

export function RefreshIndicator({ refreshing, progress = 0 }: RefreshIndicatorProps) {
  const rotation = useSharedValue(0)
  const scale = useSharedValue(0.8)

  useEffect(() => {
    if (refreshing) {
      // 加载中：持续旋转
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      )
      scale.value = withSpring(1, { damping: 15, stiffness: 150 })
    } else {
      // 停止旋转
      cancelAnimation(rotation)
      rotation.value = withTiming(0, { duration: 200 })
      scale.value = withSpring(0.8, { damping: 20, stiffness: 200 })
    }
  }, [refreshing])

  // 下拉时的旋转（非刷新状态）
  useEffect(() => {
    if (!refreshing && progress > 0) {
      rotation.value = progress * 180
    }
  }, [progress, refreshing])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
    opacity: refreshing ? 1 : Math.min(progress * 2, 1),
  }))

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconWrapper, animatedStyle]}>
        <Feather name="refresh-cw" size={20} color="#0a0a0a" />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
