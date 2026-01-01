import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { useAuthStore } from '../../stores/authStore'
import { api } from '../../lib/api'
import { colors, typography, spacing, borderRadius } from '../../constants'

interface ShoppingItem {
  id: string
  name: string
  amount?: string
  checked: boolean
}

export default function ShoppingScreen() {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    if (user?.coupleId) {
      const dateStr = new Date().toISOString().split('T')[0]
      api.get(`/shopping?coupleId=${user.coupleId}&date=${dateStr}`)
        .then(data => setItems(Array.isArray(data) ? data : []))
        .catch(() => setItems([]))
        .finally(() => setLoading(false))
    }
  }, [user?.coupleId])

  const toggleItem = async (id: string) => {
    const item = items.find(i => i.id === id)
    if (!item) return
    try {
      await api.put(`/shopping/${id}`, { checked: !item.checked })
      setItems(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i))
    } catch {}
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>购物清单</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => toggleItem(item.id)}>
            <Feather
              name={item.checked ? 'check-circle' : 'circle'}
              size={20}
              color={item.checked ? colors.text.muted : colors.primary}
            />
            <Text style={[styles.itemName, item.checked && styles.itemChecked]}>
              {item.name}
            </Text>
            {item.amount && <Text style={styles.itemAmount}>{item.amount}</Text>}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Feather name="shopping-cart" size={40} color={colors.text.muted} />
              <Text style={styles.emptyText}>暂无购物清单</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing['2xl'], paddingVertical: spacing.lg },
  title: { ...typography.h2, color: colors.text.primary },
  list: { padding: spacing['2xl'] },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  itemName: { flex: 1, ...typography.body, color: colors.text.primary },
  itemChecked: { textDecorationLine: 'line-through', color: colors.text.muted },
  itemAmount: { ...typography.caption, color: colors.text.muted },
  empty: { alignItems: 'center', paddingTop: 100 },
  emptyText: { ...typography.body, color: colors.text.muted, marginTop: spacing.lg },
})
