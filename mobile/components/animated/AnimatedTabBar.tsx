import React, { useEffect } from 'react'
import { View, StyleSheet, Pressable, LayoutChangeEvent } from 'react-native'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { Feather } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { springConfig } from '../../lib/motion'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const TAB_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  home: 'home',
  recipes: 'book-open',
  shopping: 'shopping-cart',
  profile: 'user',
}

const TAB_LABELS: Record<string, string> = {
  home: '首页',
  recipes: '食谱',
  shopping: '购物',
  profile: '我的',
}

interface TabItemProps {
  route: string
  isFocused: boolean
  onPress: () => void
  onLongPress: () => void
}

function TabItem({ route, isFocused, onPress, onLongPress }: TabItemProps) {
  const scale = useSharedValue(1)
  const iconTranslateY = useSharedValue(0)

  // 选中时的动画
  useEffect(() => {
    if (isFocused) {
      // 图标上弹效果
      iconTranslateY.value = withSpring(-2, springConfig.bouncy)
    } else {
      iconTranslateY.value = withSpring(0, springConfig.gentle)
    }
  }, [isFocused])

  const handlePressIn = () => {
    scale.value = withSpring(0.9, springConfig.stiff)
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig.bouncy)
  }

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: iconTranslateY.value }],
  }))

  const icon = TAB_ICONS[route] || 'circle'
  const label = TAB_LABELS[route] || route

  return (
    <AnimatedPressable
      style={[styles.tabItem, containerStyle]}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={iconStyle}>
        <Feather
          name={icon}
          size={22}
          color={isFocused ? '#0a0a0a' : '#a3a3a3'}
        />
      </Animated.View>
      <Animated.Text
        style={[
          styles.tabLabel,
          { color: isFocused ? '#0a0a0a' : '#a3a3a3' },
        ]}
      >
        {label}
      </Animated.Text>
    </AnimatedPressable>
  )
}

export function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const indicatorPosition = useSharedValue(0)
  const tabWidth = useSharedValue(0)

  // 指示器滑动动画
  useEffect(() => {
    indicatorPosition.value = withSpring(state.index, springConfig.gentle)
  }, [state.index])

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout
    tabWidth.value = width / state.routes.length
  }

  const indicatorStyle = useAnimatedStyle(() => {
    const width = tabWidth.value
    return {
      transform: [{ translateX: indicatorPosition.value * width }],
      width: width,
    }
  })

  return (
    <View
      style={[styles.container, { paddingBottom: insets.bottom }]}
      onLayout={handleLayout}
    >
      {/* 滑动指示器 */}
      <Animated.View style={[styles.indicator, indicatorStyle]}>
        <View style={styles.indicatorDot} />
      </Animated.View>

      {/* Tab 项 */}
      {state.routes.map((route, index) => {
        const isFocused = state.index === index

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          })

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name)
          }
        }

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          })
        }

        return (
          <TabItem
            key={route.key}
            route={route.name}
            isFocused={isFocused}
            onPress={onPress}
            onLongPress={onLongPress}
          />
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#f0f0f0',
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    height: 2,
    alignItems: 'center',
  },
  indicatorDot: {
    width: 20,
    height: 2,
    backgroundColor: '#0a0a0a',
    borderRadius: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
})
