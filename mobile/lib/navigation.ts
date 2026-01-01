import { TransitionPresets } from '@react-navigation/stack'
import { Easing } from 'react-native-reanimated'

// 页面切换动画配置
export const screenTransition = {
  // 时长
  duration: {
    open: 280,
    close: 250,
  },
  // 缓动
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
}

// Stack 屏幕通用配置
export const stackScreenOptions = {
  headerShown: false,
  animation: 'slide_from_right' as const,
  animationDuration: screenTransition.duration.open,
  gestureEnabled: true,
  gestureDirection: 'horizontal' as const,
  fullScreenGestureEnabled: true,
}

// Modal 屏幕配置
export const modalScreenOptions = {
  headerShown: false,
  presentation: 'modal' as const,
  animation: 'slide_from_bottom' as const,
  animationDuration: screenTransition.duration.open,
  gestureEnabled: true,
  gestureDirection: 'vertical' as const,
}

// 淡入淡出配置（用于 Tab 切换）
export const fadeScreenOptions = {
  headerShown: false,
  animation: 'fade' as const,
  animationDuration: 200,
}

// 自定义过渡动画 - iOS 风格
export const iosTransitionSpec = {
  open: {
    animation: 'timing' as const,
    config: {
      duration: screenTransition.duration.open,
      easing: screenTransition.easing,
    },
  },
  close: {
    animation: 'timing' as const,
    config: {
      duration: screenTransition.duration.close,
      easing: screenTransition.easing,
    },
  },
}
