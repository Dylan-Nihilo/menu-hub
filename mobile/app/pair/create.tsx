import { useState, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, Link } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useAuthStore } from '../../stores/authStore'
import { AnimatedPressable } from '../../components/animated'

const API_BASE = 'http://192.168.88.233:3001/api'

export default function CreatePairScreen() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)
  const { user, setUser } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    const createCouple = async () => {
      try {
        const res = await fetch(`${API_BASE}/couple/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user?.id }),
        })
        const data = await res.json()
        setCode(data.inviteCode)
        setUser({ ...user!, coupleId: data.id })
      } catch {}
      setLoading(false)
    }
    createCouple()
  }, [])

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Feather name="heart" size={48} color="#0a0a0a" />
        </View>
        <Text style={styles.title}>邀请 TA</Text>
        <Text style={styles.subtitle}>分享邀请码给你的另一半</Text>

        <View style={styles.codeBox}>
          <Text style={styles.code}>{loading ? '...' : code}</Text>
        </View>

        <AnimatedPressable
          style={styles.button}
          onPress={() => router.replace('/(tabs)/home')}
        >
          <Text style={styles.buttonText}>进入首页</Text>
        </AnimatedPressable>
      </View>

      <Link href="/pair/join" asChild>
        <AnimatedPressable style={styles.link}>
          <Text style={styles.linkText}>已有邀请码？加入配对</Text>
        </AnimatedPressable>
      </Link>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 28, fontWeight: '600', color: '#0a0a0a', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#a3a3a3', textAlign: 'center', marginTop: 8 },
  codeBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 48,
    marginVertical: 32,
  },
  code: { fontSize: 32, fontWeight: '700', color: '#0a0a0a', letterSpacing: 4 },
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  link: { padding: 24, alignItems: 'center' },
  linkText: { fontSize: 14, color: '#666' },
})
