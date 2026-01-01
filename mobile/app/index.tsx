import { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../stores/authStore'

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
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#0a0a0a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#a3a3a3',
  },
})
