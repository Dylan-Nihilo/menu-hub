import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useAuthStore } from '../../stores/authStore'
import { api } from '../../lib/api'
import { colors, typography, spacing, borderRadius } from '../../constants'

interface Recipe {
  id: string
  name: string
  category?: string
}

export default function SelectScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const { user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (user?.coupleId) {
      api.get(`/recipes?coupleId=${user.coupleId}`)
        .then(data => setRecipes(Array.isArray(data) ? data : []))
    }
  }, [user?.coupleId])

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleConfirm = async () => {
    if (selected.length === 0) return Alert.alert('提示', '请选择至少一道菜')
    const date = new Date().toISOString().split('T')[0]
    for (const recipeId of selected) {
      await api.post('/menu', { coupleId: user?.coupleId, date, recipeId, userId: user?.id })
    }
    router.back()
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="x" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>选择菜品</Text>
        <TouchableOpacity onPress={handleConfirm}>
          <Text style={styles.confirmBtn}>确定 ({selected.length})</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={recipes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => toggleSelect(item.id)}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              {item.category && <Text style={styles.itemCategory}>{item.category}</Text>}
            </View>
            <Feather
              name={selected.includes(item.id) ? 'check-circle' : 'circle'}
              size={24}
              color={selected.includes(item.id) ? colors.primary : colors.text.muted}
            />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg },
  title: { ...typography.h3, color: colors.text.primary },
  confirmBtn: { ...typography.body, fontWeight: '600', color: colors.primary },
  list: { padding: spacing['2xl'] },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.lg, marginBottom: spacing.md },
  itemInfo: { flex: 1 },
  itemName: { ...typography.body, fontWeight: '500', color: colors.text.primary },
  itemCategory: { ...typography.caption, color: colors.text.muted, marginTop: spacing.xs },
})
