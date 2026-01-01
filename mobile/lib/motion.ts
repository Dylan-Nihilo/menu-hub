import { Easing, ReduceMotion } from 'react-native-reanimated'
import { AccessibilityInfo } from 'react-native'

// 检测用户是否启用了减少动态效果
let reduceMotionEnabled = false
AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
  reduceMotionEnabled = enabled
})
AccessibilityInfo.addEventListener('reduceMotionChanged', enabled => {
  reduceMotionEnabled = enabled
})

export const isReduceMotionEnabled = () => reduceMotionEnabled

// 动效配置 - 全局统一
export const motion = {
  // 时长配置 (ms)
  duration: {
    instant: 80,
    fast: 120,
    normal: 200,
    slow: 300,
    page: 250,
  },

  // 缓动函数
  easing: {
    // 主要缓动 - cubic-bezier(0.22, 1, 0.36, 1)
    smooth: Easing.bezier(0.22, 1, 0.36, 1),
    // 弹性效果
    spring: Easing.bezier(0.34, 1.56, 0.64, 1),
    // 减速
    decelerate: Easing.out(Easing.cubic),
    // 加速
    accelerate: Easing.in(Easing.cubic),
  },

  // 缩放配置
  scale: {
    pressed: 0.97,
    selected: 1.02,
    modal: {
      from: 0.95,
      to: 1,
    },
  },

  // 位移配置
  translate: {
    slideUp: -8,
    slideDown: 20,
    bottomBar: 100,
  },

  // 透明度
  opacity: {
    disabled: 0.5,
    pressed: 0.9,
    overlay: 0.5,
  },

  // 阴影增强
  shadow: {
    normal: {
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    pressed: {
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
  },

  // 模糊强度
  blur: {
    light: 60,
    medium: 80,
    heavy: 100,
  },
}

// Spring 配置 (用于 react-native-reanimated)
export const springConfig = {
  gentle: {
    damping: 20,
    stiffness: 150,
    mass: 1,
  },
  bouncy: {
    damping: 12,
    stiffness: 180,
    mass: 0.8,
  },
  stiff: {
    damping: 25,
    stiffness: 300,
    mass: 1,
  },
}

// 列表动画配置 - 优化：极小 stagger，避免卡顿
export const listAnimation = {
  staggerDelay: 20, // 极小延迟
  maxStaggerItems: 5, // 最多前 5 个有延迟
  entrance: {
    duration: 180,
    translateY: 8,
    scale: 0.98,
    opacity: 0,
  },
  exit: {
    duration: 150,
    scale: 0.95,
    opacity: 0,
    translateY: -8,
  },
}

// 模态动画配置 - 统一参数
export const modalAnimation = {
  overlay: {
    duration: 180,
    opacity: { from: 0, to: 0.5 },
  },
  content: {
    duration: 220,
    scale: { from: 0.95, to: 1 },
    translateY: { from: 12, to: 0 },
    opacity: { from: 0, to: 1 },
  },
}

// 底部栏动画配置
export const bottomBarAnimation = {
  duration: 250,
  translateY: { from: 100, to: 0 },
  opacity: { from: 0, to: 1 },
}

// 卡片动画配置
export const cardAnimation = {
  entrance: {
    duration: 200,
    scale: { from: 0.96, to: 1 },
    opacity: { from: 0, to: 1 },
  },
  press: {
    scale: 0.97,
    duration: 80,
  },
}

// 获取考虑 reduce-motion 的时长
export const getDuration = (duration: number) => {
  return reduceMotionEnabled ? 0 : duration
}

export default motion
