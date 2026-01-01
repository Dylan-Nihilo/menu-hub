import { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useAuthStore } from '../../stores/authStore'
import { api } from '../../lib/api'
import { colors, typography, spacing, borderRadius } from '../../constants'

interface MenuItem {
  id: string
  recipe?: { id: string; name: string }
  selectedBy?: { nickname: string }
}

export default function HomeScreen() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { user } = useAuthStore()
  const router = useRouter()

  const loadMenu = useCallback(async () => {
    if (!user?.coupleId) return
    try {
      const dateStr = new Date().toISOString().split('T')[0]
      const data = await api.get(`/menu?coupleId=${user.coupleId}&date=${dateStr}`)
      setMenuItems(data?.items || [])
    } catch {
      setMenuItems([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user?.coupleId])

  useEffect(() => {
    loadMenu()
  }, [loadMenu])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 11) return '早上好'
    if (hour < 14) return '中午好'
    if (hour < 18) return '下午好'
    return '晚上好'
  }

  const dateStr = new Date().toLocaleDateString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'long',
  })

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.date}>{dateStr}</Text>
        <Text style={styles.greeting}>
          {getGreeting()}，{user?.nickname || '你好'}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true)
            loadMenu()
          }} />
        }
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>今日菜单</Text>
            {menuItems.length > 0 && (
              <Text style={styles.cardCount}>{menuItems.length} 道菜</Text>
            )}
          </View>

          {loading ? (
            <View style={styles.skeleton} />
          ) : menuItems.length === 0 ? (
            <View style={styles.empty}>
              <Feather name="coffee" size={40} color={colors.text.muted} />
              <Text style={styles.emptyTitle}>今天还没点菜</Text>
              <Text style={styles.emptySubtitle}>和 TA 一起选择今天吃什么吧</Text>
            </View>
          ) : (
            <View style={styles.menuList}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={() => router.push(`/recipes/${item.recipe?.id}`)}
                >
                  <Text style={styles.menuItemName}>{item.recipe?.name}</Text>
                  <Text style={styles.menuItemBy}>{item.selectedBy?.nickname}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/select')}
        >
          <Feather name="plus" size={20} color={colors.background} />
          <Text style={styles.addButtonText}>点菜</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing['2xl'], paddingTop: spacing.lg, paddingBottom: spacing['2xl'] },
  date: { ...typography.caption, color: colors.text.muted },
  greeting: { ...typography.h1, color: colors.text.primary, marginTop: spacing.xs },
  content: { flex: 1, paddingHorizontal: spacing['2xl'] },
  card: { backgroundColor: colors.surface, borderRadius: borderRadius['2xl'], padding: spacing.xl },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  cardTitle: { ...typography.body, fontWeight: '500', color: colors.text.primary },
  cardCount: { ...typography.caption, color: colors.text.muted },
  skeleton: { height: 56, backgroundColor: colors.background, borderRadius: borderRadius.xl },
  empty: { alignItems: 'center', paddingVertical: spacing['2xl'] },
  emptyTitle: { ...typography.body, fontWeight: '500', color: colors.text.primary, marginTop: spacing.lg },
  emptySubtitle: { ...typography.caption, color: colors.text.muted, marginTop: spacing.xs },
  menuList: { gap: spacing.sm },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.background, borderRadius: borderRadius.xl, padding: spacing.md },
  menuItemName: { ...typography.body, fontWeight: '500', color: colors.text.primary },
  menuItemBy: { ...typography.caption, color: colors.text.muted },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, height: 48, backgroundColor: colors.primary, borderRadius: borderRadius.xl },
  addButtonText: { ...typography.body, fontWeight: '600', color: colors.background },
})
