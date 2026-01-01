import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, Link } from 'expo-router'
import { useAuthStore } from '../../stores/authStore'
import { api } from '../../lib/api'
import { colors, typography, spacing, borderRadius } from '../../constants'

export default function CreatePairScreen() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)
  const { user, setUser } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    api.post('/couple/create', { userId: user?.id })
      .then(data => {
        setCode(data.inviteCode)
        setUser({ ...user!, coupleId: data.id })
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>邀请 TA</Text>
        <Text style={styles.subtitle}>分享邀请码给你的另一半</Text>

        <View style={styles.codeBox}>
          <Text style={styles.code}>{loading ? '...' : code}</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/(tabs)/home')}
        >
          <Text style={styles.buttonText}>进入首页</Text>
        </TouchableOpacity>
      </View>

      <Link href="/pair/join" asChild>
        <TouchableOpacity style={styles.link}>
          <Text style={styles.linkText}>已有邀请码？加入配对</Text>
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing['2xl'], justifyContent: 'center' },
  title: { ...typography.h1, color: colors.text.primary, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.text.muted, textAlign: 'center', marginTop: spacing.sm },
  codeBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    padding: spacing['2xl'],
    marginVertical: spacing['2xl'],
    alignItems: 'center',
  },
  code: { fontSize: 32, fontWeight: '700', color: colors.primary, letterSpacing: 4 },
  button: {
    height: 56, backgroundColor: colors.primary,
    borderRadius: borderRadius.xl, alignItems: 'center', justifyContent: 'center',
  },
  buttonText: { ...typography.body, fontWeight: '600', color: colors.background },
  link: { padding: spacing['2xl'], alignItems: 'center' },
  linkText: { ...typography.caption, color: colors.text.secondary },
})
