import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { AnimatedPressable } from '../../components/animated'

const menuItems = [
  { icon: 'user' as const, label: '个人资料', route: '/settings/profile' },
  { icon: 'lock' as const, label: '修改密码', route: '/settings/password' },
  { icon: 'heart' as const, label: '情侣设置', route: '/settings/couple' },
]

export default function SettingsScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <AnimatedPressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color="#0a0a0a" />
        </AnimatedPressable>
        <Text style={styles.title}>设置</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.menu}>
        {menuItems.map((item) => (
          <AnimatedPressable
            key={item.route}
            style={styles.menuItem}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
          >
            <View style={styles.menuIcon}>
              <Feather name={item.icon} size={20} color="#666" />
            </View>
            <Text style={styles.menuText}>{item.label}</Text>
            <Feather name="chevron-right" size={20} color="#a3a3a3" />
          </AnimatedPressable>
        ))}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 17, fontWeight: '600', color: '#0a0a0a' },
  menu: { padding: 24, gap: 12 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#0a0a0a',
    marginLeft: 12,
  },
})
