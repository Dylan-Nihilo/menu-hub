import { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useAuthStore } from '../../stores/authStore'
import { useToast, ConfirmModal } from '../../components/ui'
import { AnimatedPressable } from '../../components/animated'

const API_BASE = 'http://192.168.88.233:3001/api'

interface Recipe {
  id: string
  name: string
  coverImage?: string
  category?: string
  difficulty?: string
  prepTime?: number
  cookTime?: number
  ingredients?: string
  steps?: string
}

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const router = useRouter()
  const { showToast } = useToast()

  const loadRecipe = useCallback(async () => {
    if (!id) return
    try {
      const res = await fetch(`${API_BASE}/recipes/${id}`)
      if (res.ok) {
        setRecipe(await res.json())
      } else {
        showToast('加载菜谱失败', 'error')
      }
    } catch {
      showToast('网络错误，请重试', 'error')
    }
    setLoading(false)
  }, [id, showToast])

  useEffect(() => {
    loadRecipe()
  }, [loadRecipe])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`${API_BASE}/recipes/${id}`, { method: 'DELETE' })
      if (res.ok) {
        useAuthStore.getState().triggerRecipeRefresh()
        setShowDeleteConfirm(false)
        router.back()
        setTimeout(() => showToast('菜谱已删除', 'success'), 300)
      } else {
        showToast('删除失败，请重试', 'error')
      }
    } catch {
      showToast('网络错误，请重试', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const ingredients = recipe?.ingredients ? JSON.parse(recipe.ingredients) : []
  const steps = recipe?.steps ? JSON.parse(recipe.steps) : []
  const totalTime = (recipe?.prepTime || 0) + (recipe?.cookTime || 0)

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 头部 */}
      <View style={styles.header}>
        <AnimatedPressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color="#0a0a0a" />
        </AnimatedPressable>
        <AnimatedPressable
          onPress={() => setShowDeleteConfirm(true)}
          disabled={deleting}
          style={styles.deleteBtn}
        >
          <Feather name="trash-2" size={20} color="#ef4444" />
        </AnimatedPressable>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 封面图 */}
        <View style={styles.coverImage}>
          {recipe?.coverImage ? (
            <Image
              source={{ uri: recipe.coverImage }}
              style={styles.coverImg}
            />
          ) : (
            <Feather name="image" size={48} color="#d4d4d4" />
          )}
        </View>

        {/* 标题和标签 */}
        <View style={styles.content}>
          <Text style={styles.title}>{recipe?.name || '加载中...'}</Text>

          <View style={styles.tags}>
            {recipe?.difficulty && (
              <View style={styles.tagBlack}>
                <Text style={styles.tagBlackText}>{recipe.difficulty}</Text>
              </View>
            )}
            {totalTime > 0 && (
              <View style={styles.tagTime}>
                <Feather name="clock" size={14} color="#666" />
                <Text style={styles.tagTimeText}>{totalTime}分钟</Text>
              </View>
            )}
            {recipe?.category && (
              <View style={styles.tagGray}>
                <Text style={styles.tagGrayText}>{recipe.category}</Text>
              </View>
            )}
          </View>

          {/* 食材 */}
          {ingredients.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>食材</Text>
              <View style={styles.ingredientCard}>
                {ingredients.map((item: { name: string; amount: string }, i: number) => (
                  <View key={i} style={[styles.ingredientItem, i < ingredients.length - 1 && styles.ingredientBorder]}>
                    <Text style={styles.ingredientName}>{item.name}</Text>
                    <Text style={styles.ingredientAmount}>{item.amount}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 步骤 */}
          {steps.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>步骤</Text>
              {steps.map((step: { content: string }, i: number) => (
                <View key={i} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepContent}>{step.content}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 底部按钮 */}
      <View style={styles.footer}>
        <AnimatedPressable style={styles.startBtn} activeOpacity={0.8}>
          <Text style={styles.startBtnText}>开始做菜</Text>
        </AnimatedPressable>
      </View>

      {/* 删除确认弹窗 */}
      <ConfirmModal
        visible={showDeleteConfirm}
        title="删除菜谱"
        message="确定要删除这道菜谱吗？删除后无法恢复。"
        confirmText="删除"
        cancelText="取消"
        confirmStyle="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        loading={deleting}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 48,
  },
  backBtn: { padding: 4 },
  deleteBtn: { padding: 4 },
  scrollView: { flex: 1 },
  coverImage: {
    aspectRatio: 16 / 9,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImg: {
    width: '100%',
    height: '100%',
  },
  content: { padding: 16 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0a0a0a',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tagBlack: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
  },
  tagBlackText: {
    fontSize: 12,
    color: '#fff',
  },
  tagTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagTimeText: {
    fontSize: 14,
    color: '#666',
  },
  tagGray: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  tagGrayText: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0a0a0a',
    marginBottom: 12,
  },
  ingredientCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    overflow: 'hidden',
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  ingredientBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  ingredientName: {
    fontSize: 15,
    color: '#0a0a0a',
  },
  ingredientAmount: {
    fontSize: 14,
    color: '#666',
  },
  stepItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#fff',
  },
  stepContent: {
    flex: 1,
    fontSize: 15,
    color: '#0a0a0a',
    lineHeight: 22,
    paddingTop: 4,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  startBtn: {
    height: 56,
    backgroundColor: '#0a0a0a',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
})