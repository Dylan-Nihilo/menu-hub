import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration: number
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void
  hideToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

function ToastItem({ toast, onHide }: { toast: Toast; onHide: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(50)).current

  useEffect(() => {
    // 进入动画
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start()

    // 自动消失
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 50, duration: 200, useNativeDriver: true }),
      ]).start(() => onHide())
    }, toast.duration)

    return () => clearTimeout(timer)
  }, [toast.duration, onHide])

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return { bg: '#0a0a0a', text: '#ffffff', icon: 'check-circle' as const }
      case 'error':
        return { bg: '#ffffff', text: '#0a0a0a', icon: 'alert-circle' as const, border: '#e5e5e5' }
      case 'warning':
        return { bg: '#f5f5f5', text: '#0a0a0a', icon: 'alert-triangle' as const }
      case 'info':
      default:
        return { bg: '#f5f5f5', text: '#666666', icon: 'info' as const, border: '#e5e5e5' }
    }
  }

  const style = getStyles()

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          opacity,
          transform: [{ translateY }],
          backgroundColor: style.bg,
          borderColor: style.border,
          borderWidth: style.border ? 1 : 0,
        },
      ]}
    >
      <Feather name={style.icon} size={18} color={style.text} />
      <Text style={[styles.toastText, { color: style.text }]}>{toast.message}</Text>
      <TouchableOpacity onPress={onHide} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Feather name="x" size={16} color={style.text} style={{ opacity: 0.6 }} />
      </TouchableOpacity>
    </Animated.View>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const insets = useSafeAreaInsets()

  const showToast = useCallback((message: string, type: ToastType = 'success', duration: number = 3000) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, message, type, duration }])
  }, [])

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <View style={[styles.container, { bottom: 100 + insets.bottom }]} pointerEvents="box-none">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onHide={() => hideToast(toast.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 24,
    right: 24,
    alignItems: 'center',
    gap: 8,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    width: '100%',
  },
  toastText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
})
