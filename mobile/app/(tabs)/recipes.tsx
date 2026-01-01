import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
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

export default function RecipesScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (user?.coupleId) {
      api.get(`/recipes?coupleId=${user.coupleId}`)
        .then(data => setRecipes(Array.isArray(data) ? data : []))
        .catch(() => setRecipes([]))
        .finally(() => setLoading(false))
    }
  }, [user?.coupleId])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>食谱库</Text>
        <TouchableOpacity onPress={() => router.push('/recipes/new')}>
          <Feather name="plus" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => router.push(`/recipes/${item.id}`)}
          >
            <Text style={styles.itemName}>{item.name}</Text>
            {item.category && (
              <Text style={styles.itemCategory}>{item.category}</Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Feather name="book-open" size={40} color={colors.text.muted} />
              <Text style={styles.emptyText}>还没有食谱</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
  },
  title: { ...typography.h2, color: colors.text.primary },
  list: { padding: spacing['2xl'], gap: spacing.md },
  item: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  itemName: { ...typography.body, fontWeight: '500', color: colors.text.primary },
  itemCategory: { ...typography.caption, color: colors.text.muted, marginTop: spacing.xs },
  empty: { alignItems: 'center', paddingTop: 100 },
  emptyText: { ...typography.body, color: colors.text.muted, marginTop: spacing.lg },
})
