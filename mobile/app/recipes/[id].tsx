import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { api } from '../../lib/api'
import { colors, typography, spacing, borderRadius } from '../../constants'

interface Recipe {
  id: string
  name: string
  category?: string
  ingredients?: string
  steps?: string
}

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (id) {
      api.get(`/recipes/${id}`).then(setRecipe).catch(() => {})
    }
  }, [id])

  const ingredients = recipe?.ingredients ? JSON.parse(recipe.ingredients) : []
  const steps = recipe?.steps ? JSON.parse(recipe.steps) : []

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>{recipe?.name || '加载中...'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {recipe?.category && (
          <Text style={styles.category}>{recipe.category}</Text>
        )}

        <Text style={styles.sectionTitle}>食材</Text>
        {ingredients.map((item: { name: string; amount: string }, i: number) => (
          <View key={i} style={styles.ingredientItem}>
            <Text style={styles.ingredientName}>{item.name}</Text>
            <Text style={styles.ingredientAmount}>{item.amount}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>步骤</Text>
        {steps.map((step: { content: string }, i: number) => (
          <View key={i} style={styles.stepItem}>
            <Text style={styles.stepNumber}>{i + 1}</Text>
            <Text style={styles.stepContent}>{step.content}</Text>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg },
  title: { ...typography.h3, color: colors.text.primary },
  content: { flex: 1, padding: spacing['2xl'] },
  category: { ...typography.caption, color: colors.text.muted, marginBottom: spacing.lg },
  sectionTitle: { ...typography.h3, color: colors.text.primary, marginTop: spacing.xl, marginBottom: spacing.md },
  ingredientItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  ingredientName: { ...typography.body, color: colors.text.primary },
  ingredientAmount: { ...typography.body, color: colors.text.muted },
  stepItem: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  stepNumber: { ...typography.body, fontWeight: '600', color: colors.primary },
  stepContent: { flex: 1, ...typography.body, color: colors.text.primary },
})
