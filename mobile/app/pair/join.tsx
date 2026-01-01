import { useState } from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useAuthStore } from '../../stores/authStore'
import { AnimatedPressable } from '../../components/animated'

const API_BASE = 'http://192.168.88.233:3001/api'

export default function JoinPairScreen() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user, setUser } = useAuthStore()
  const router = useRouter()

  const handleJoin = async () => {
    if (!code) {
      setError('请输入邀请码')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/couple/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, inviteCode: code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '邀请码无效')
        return
      }
      setUser({ ...user!, coupleId: data.id })
      router.replace('/(tabs)/home')
    } catch {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Feather name="users" size={48} color="#0a0a0a" />
        </View>
        <Text style={styles.title}>加入配对</Text>
        <Text style={styles.subtitle}>输入另一半的邀请码</Text>

        <TextInput
          style={styles.input}
          placeholder="邀请码"
          placeholderTextColor="#a3a3a3"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <AnimatedPressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleJoin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? '加入中...' : '加入'}</Text>
        </AnimatedPressable>
      </View>
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
  input: {
    width: '100%',
    height: 56,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 24,
    marginVertical: 32,
    fontSize: 20,
    color: '#0a0a0a',
    textAlign: 'center',
    letterSpacing: 4,
  },
  error: { fontSize: 13, color: '#dc2626', marginBottom: 16 },
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontSize: 15, fontWeight: '600', color: '#fff' },
})
