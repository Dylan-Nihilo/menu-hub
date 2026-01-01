import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface GlassBarProps {
  children: React.ReactNode
  style?: ViewStyle
  intensity?: number
  position?: 'top' | 'bottom'
}

export function GlassBar({
  children,
  style,
  intensity = 80,
  position = 'bottom'
}: GlassBarProps) {
  const insets = useSafeAreaInsets()
  const paddingBottom = position === 'bottom' ? Math.max(insets.bottom, 16) : 16
  const paddingTop = position === 'top' ? Math.max(insets.top, 16) : 16

  return (
    <BlurView
      intensity={intensity}
      tint="light"
      style={[
        styles.container,
        position === 'bottom' ? styles.bottom : styles.top,
        { paddingBottom, paddingTop },
        style
      ]}
    >
      {children}
    </BlurView>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  bottom: {
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  top: {
    top: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
})
