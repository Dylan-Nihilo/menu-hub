import { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, Image, Modal, ActivityIndicator, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuthStore } from '../../stores/authStore'
import { useToast, ConfirmModal } from '../../components/ui'
import { AnimatedPressable } from '../../components/animated'

const API_BASE = 'http://192.168.88.233:3001/api'
const { width } = Dimensions.get('window')

const COOKING_TIPS = [
  '正在准备食材...',
  '热锅中...',
  '调配调料...',
  '大厨正在创作...',
  '摆盘装饰中...',
]

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
  const [generating, setGenerating] = useState(false)
  const [generatingTip, setGeneratingTip] = useState(COOKING_TIPS[0])
  const [cardImage, setCardImage] = useState<string | null>(null)
  const [showCardModal, setShowCardModal] = useState(false)
  const router = useRouter()
  const { showToast } = useToast()
  const insets = useSafeAreaInsets()

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

  const handleGenerateCard = async () => {
    if (!recipe) return
    setGenerating(true)
    setGeneratingTip(COOKING_TIPS[0])

    let tipIndex = 0
    const tipInterval = setInterval(() => {
      tipIndex = (tipIndex + 1) % COOKING_TIPS.length
      setGeneratingTip(COOKING_TIPS[tipIndex])
    }, 2000)

    try {
      const res = await fetch(`${API_BASE}/ai-image/recipe-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: recipe.name,
          category: recipe.category,
          difficulty: recipe.difficulty,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          ingredients: recipe.ingredients ? JSON.parse(recipe.ingredients) : [],
        }),
      })
      const data = await res.json()
      if (data.image) {
        setCardImage(data.image)
        setShowCardModal(true)
      } else {
        showToast(data.error || '生成失败', 'error')
      }
    } catch {
      showToast('网络错误，请重试', 'error')
    } finally {
      clearInterval(tipInterval)
      setGenerating(false)
    }
  }

  const handleShareCard = async () => {
    if (!cardImage) return
    try {
      const base64Data = cardImage.split(',')[1]
      const fileUri = FileSystem.cacheDirectory + `recipe-${recipe?.name || 'card'}.jpg`
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      })
      await Sharing.shareAsync(fileUri)
    } catch {
      showToast('分享失败', 'error')
    }
  }

  const ingredients = recipe?.ingredients ? JSON.parse(recipe.ingredients) : []
  const steps = recipe?.steps ? JSON.parse(recipe.steps) : []
  const totalTime = (recipe?.prepTime || 0) + (recipe?.cookTime || 0)

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#0a0a0a" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* 沉浸式封面 */}
        <View style={styles.coverContainer}>
          {recipe?.coverImage ? (
            <Image source={{ uri: recipe.coverImage }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Feather name="image" size={64} color="#d4d4d4" />
            </View>
          )}
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.6)']}
            locations={[0, 0.3, 1]}
            style={styles.coverGradient}
          />

          {/* 浮动头部按钮 */}
          <View style={[styles.floatingHeader, { paddingTop: insets.top + 8 }]}>
            <AnimatedPressable style={styles.floatingBtn} onPress={() => router.back()}>
              <Feather name="chevron-left" size={24} color="#fff" />
            </AnimatedPressable>
            <View style={styles.floatingRight}>
              <AnimatedPressable
                style={styles.floatingBtn}
                onPress={handleGenerateCard}
                disabled={generating}
              >
                {generating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Feather name="share" size={20} color="#fff" />
                )}
              </AnimatedPressable>
              <AnimatedPressable
                style={[styles.floatingBtn, styles.deleteFloatingBtn]}
                onPress={() => setShowDeleteConfirm(true)}
              >
                <Feather name="trash-2" size={20} color="#fff" />
              </AnimatedPressable>
            </View>
          </View>

          {/* 封面底部信息 */}
          <View style={styles.coverInfo}>
            <Text style={styles.coverTitle}>{recipe?.name}</Text>
            <View style={styles.coverMeta}>
              {recipe?.category && (
                <View style={styles.coverTag}>
                  <Text style={styles.coverTagText}>{recipe.category}</Text>
                </View>
              )}
              {recipe?.difficulty && (
                <View style={styles.coverTag}>
                  <Text style={styles.coverTagText}>{recipe.difficulty}</Text>
                </View>
              )}
              {totalTime > 0 && (
                <View style={styles.coverTag}>
                  <Feather name="clock" size={12} color="#fff" />
                  <Text style={styles.coverTagText}>{totalTime}分钟</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* 内容区域 */}
        <View style={styles.content}>
          {/* 时间详情卡片 */}
          {(recipe?.prepTime || recipe?.cookTime) && (
            <View style={styles.timeCard}>
              {recipe?.prepTime && (
                <View style={styles.timeItem}>
                  <Text style={styles.timeValue}>{recipe.prepTime}</Text>
                  <Text style={styles.timeLabel}>准备(分钟)</Text>
                </View>
              )}
              {recipe?.prepTime && recipe?.cookTime && <View style={styles.timeDivider} />}
              {recipe?.cookTime && (
                <View style={styles.timeItem}>
                  <Text style={styles.timeValue}>{recipe.cookTime}</Text>
                  <Text style={styles.timeLabel}>烹饪(分钟)</Text>
                </View>
              )}
            </View>
          )}

          {/* 食材 */}
          {ingredients.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Feather name="shopping-bag" size={16} color="#0a0a0a" />
                </View>
                <Text style={styles.sectionTitle}>食材清单</Text>
                <Text style={styles.sectionCount}>{ingredients.length}种</Text>
              </View>
              <View style={styles.ingredientList}>
                {ingredients.map((item: { name: string; amount: string }, i: number) => (
                  <View key={i} style={styles.ingredientItem}>
                    <View style={styles.ingredientDot} />
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
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Feather name="list" size={16} color="#0a0a0a" />
                </View>
                <Text style={styles.sectionTitle}>烹饪步骤</Text>
                <Text style={styles.sectionCount}>{steps.length}步</Text>
              </View>
              <View style={styles.stepList}>
                {steps.map((step: { content: string }, i: number) => (
                  <View key={i} style={styles.stepItem}>
                    <View style={styles.stepLeft}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>{i + 1}</Text>
                      </View>
                      {i < steps.length - 1 && <View style={styles.stepLine} />}
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepText}>{step.content}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* 底部按钮 */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <AnimatedPressable style={styles.startBtn}>
          <Feather name="play" size={20} color="#fff" />
          <Text style={styles.startBtnText}>开始做菜</Text>
        </AnimatedPressable>
      </View>

      {/* 删除确认 */}
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

      {/* 生成中 */}
      <Modal visible={generating} transparent animationType="fade">
        <View style={styles.generatingOverlay}>
          <View style={styles.generatingContent}>
            <ActivityIndicator size="large" color="#0a0a0a" />
            <Text style={styles.generatingTip}>{generatingTip}</Text>
          </View>
        </View>
      </Modal>

      {/* 卡片预览 */}
      <Modal
        visible={showCardModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCardModal(false)}
      >
        <View style={styles.cardModalOverlay}>
          <View style={styles.cardModalContent}>
            <Text style={styles.cardModalTitle}>菜谱卡片</Text>
            {cardImage && (
              <Image source={{ uri: cardImage }} style={styles.cardImage} resizeMode="contain" />
            )}
            <View style={styles.cardModalButtons}>
              <AnimatedPressable style={styles.cardShareBtn} onPress={handleShareCard}>
                <Feather name="share-2" size={18} color="#fff" />
                <Text style={styles.cardShareBtnText}>分享</Text>
              </AnimatedPressable>
              <AnimatedPressable style={styles.cardCloseBtn} onPress={() => setShowCardModal(false)}>
                <Text style={styles.cardCloseBtnText}>关闭</Text>
              </AnimatedPressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  // 沉浸式封面
  coverContainer: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: '#f5f5f5',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ebebeb',
  },
  coverGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  floatingBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingRight: {
    flexDirection: 'row',
    gap: 8,
  },
  deleteFloatingBtn: {
    backgroundColor: 'rgba(239,68,68,0.8)',
  },
  coverInfo: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
  },
  coverTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  coverMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  coverTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  coverTagText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },
  // 内容区域
  content: {
    padding: 20,
    marginTop: -20,
    paddingTop: 32,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  // 时间卡片
  timeCard: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  timeItem: {
    flex: 1,
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0a0a0a',
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  timeDivider: {
    width: 1,
    backgroundColor: '#e5e5e5',
    marginHorizontal: 16,
  },
  // 区块
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#0a0a0a',
  },
  sectionCount: {
    fontSize: 13,
    color: '#a3a3a3',
  },
  // 食材列表 - 两列布局
  ingredientList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 12,
  },
  ingredientItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  ingredientDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#0a0a0a',
    marginRight: 8,
  },
  ingredientName: {
    fontSize: 14,
    color: '#0a0a0a',
    flex: 1,
  },
  ingredientAmount: {
    fontSize: 12,
    color: '#888',
  },
  // 步骤列表
  stepList: {
    paddingLeft: 4,
  },
  stepItem: {
    flexDirection: 'row',
  },
  stepLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  stepLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#e5e5e5',
    marginVertical: 8,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 24,
  },
  stepText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
    paddingTop: 6,
  },
  // 底部
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    backgroundColor: '#0a0a0a',
    borderRadius: 28,
  },
  startBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // 弹窗
  generatingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generatingContent: {
    alignItems: 'center',
    padding: 40,
  },
  generatingTip: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0a0a0a',
    marginTop: 24,
  },
  cardModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  cardModalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  cardModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0a0a0a',
    marginBottom: 16,
  },
  cardImage: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  cardModalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    width: '100%',
  },
  cardShareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    backgroundColor: '#0a0a0a',
    borderRadius: 24,
  },
  cardShareBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  cardCloseBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCloseBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
})
