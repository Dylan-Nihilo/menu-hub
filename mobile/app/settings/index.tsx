import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { colors, typography, spacing, borderRadius } from '../../constants'

const menuItems = [
  { icon: 'user', label: '个人资料', route: '/settings/profile' },
  { icon: 'lock', label: '修改密码', route: '/settings/password' },
  { icon: 'heart', label: '情侣设置', route: '/settings/couple' },
]

export default function SettingsScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>设置</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={styles.menuItem}
            onPress={() => router.push(item.route as never)}
          >
            <Feather name={item.icon as never} size={20} color={colors.text.primary} />
            <Text style={styles.menuText}>{item.label}</Text>
            <Feather name="chevron-right" size={20} color={colors.text.muted} />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg },
  title: { ...typography.h3, color: colors.text.primary },
  menu: { padding: spacing['2xl'], gap: spacing.md },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.lg },
  menuText: { flex: 1, ...typography.body, color: colors.text.primary },
})
