import { useState } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../stores/authStore'
import { api } from '../../lib/api'
import { colors, typography, spacing, borderRadius } from '../../constants'

export default function JoinPairScreen() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, setUser } = useAuthStore()
  const router = useRouter()

  const handleJoin = async () => {
    if (!code) return Alert.alert('提示', '请输入邀请码')
    setLoading(true)
    try {
      const data = await api.post('/couple/join', { userId: user?.id, inviteCode: code })
      setUser({ ...user!, coupleId: data.id })
      router.replace('/(tabs)/home')
    } catch {
      Alert.alert('加入失败', '邀请码无效')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>加入配对</Text>
        <Text style={styles.subtitle}>输入另一半的邀请码</Text>

        <TextInput
          style={styles.input}
          placeholder="邀请码"
          placeholderTextColor={colors.text.muted}
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleJoin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? '加入中...' : '加入'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing['2xl'], justifyContent: 'center' },
  title: { ...typography.h1, color: colors.text.primary, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.text.muted, textAlign: 'center', marginTop: spacing.sm },
  input: {
    height: 56, backgroundColor: colors.surface, borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.xl, marginVertical: spacing['2xl'],
    ...typography.body, color: colors.text.primary, textAlign: 'center',
    fontSize: 20, letterSpacing: 4,
  },
  button: {
    height: 56, backgroundColor: colors.primary,
    borderRadius: borderRadius.xl, alignItems: 'center', justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { ...typography.body, fontWeight: '600', color: colors.background },
})
