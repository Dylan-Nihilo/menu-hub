import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useAuthStore } from '../../stores/authStore'
import { colors, typography, spacing, borderRadius } from '../../constants'

export default function ProfileScreen() {
  const { user, setUser } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    Alert.alert('退出登录', '确定要退出吗？', [
      { text: '取消', style: 'cancel' },
      { text: '确定', onPress: () => {
        setUser(null)
        router.replace('/(auth)/login')
      }},
    ])
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.nickname?.[0] || '?'}</Text>
        </View>
        <Text style={styles.name}>{user?.nickname}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <Feather name="settings" size={20} color={colors.text.primary} />
          <Text style={styles.menuText}>设置</Text>
          <Feather name="chevron-right" size={20} color={colors.text.muted} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>退出登录</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'center', paddingVertical: spacing['2xl'] },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 32, fontWeight: '600', color: colors.background },
  name: { ...typography.h2, color: colors.text.primary, marginTop: spacing.lg },
  email: { ...typography.caption, color: colors.text.muted, marginTop: spacing.xs },
  menu: { paddingHorizontal: spacing['2xl'] },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  menuText: { flex: 1, ...typography.body, color: colors.text.primary },
  logoutButton: {
    marginHorizontal: spacing['2xl'], marginTop: 'auto', marginBottom: spacing['2xl'],
    height: 48, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  logoutText: { ...typography.body, color: colors.text.secondary },
})
