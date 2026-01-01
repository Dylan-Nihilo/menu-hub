import { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../stores/authStore'
import { colors, typography } from '../constants'

export default function SplashScreen() {
  const router = useRouter()
  const { user, isLoading } = useAuthStore()

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (user) {
          router.replace('/(tabs)/home')
        } else {
          router.replace('/(auth)/login')
        }
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [user, isLoading, router])

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Text style={styles.logoText}>壹</Text>
      </View>
      <Text style={styles.title}>壹餐</Text>
      <Text style={styles.subtitle}>和 TA 一起，吃好每一餐</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.background,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.muted,
  },
})
