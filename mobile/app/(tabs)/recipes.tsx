import { useState, useEffect, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet, FlatList, TextInput, ScrollView, Image, Dimensions, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import { Feather } from '@expo/vector-icons'
import { useAuthStore } from '../../stores/authStore'
import { AnimatedPressable, AnimatedListItem } from '../../components/animated'

const API_BASE = 'http://192.168.88.233:3001/api'
const { width } = Dimensions.get('window')
const CARD_WIDTH = (width - 24 * 2 - 12) / 2

interface Recipe {
  id: string
  name: string
  category?: string
  coverImage?: string
  difficulty?: string
}

const categories = ['全部', '家常菜', '川菜', '粤菜', '西餐', '日料', '甜点', '汤羹', '其他']

export default function RecipesScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('全部')
  const { user, recipeRefreshKey } = useAuthStore()
  const router = useRouter()

  const filteredRecipes = useMemo(() => {
    return recipes
      .filter(r => activeCategory === '全部' || r.category === activeCategory)
      .filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [recipes, activeCategory, searchTerm])

  const loadRecipes = useCallback(async (isRefresh = false) => {
    if (!user?.coupleId) {
      setLoading(false)
      return
    }
    if (isRefresh) setRefreshing(true)
    try {
      const res = await fetch(`${API_BASE}/recipes?coupleId=${user.coupleId}`)
      const data = await res.json()
      setRecipes(Array.isArray(data) ? data : [])
    } catch {
      setRecipes([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user?.coupleId])

  useEffect(() => {
    loadRecipes()
  }, [loadRecipes])

  useEffect(() => {
    if (recipeRefreshKey > 0) {
      loadRecipes()
    }
  }, [recipeRefreshKey, loadRecipes])

  useFocusEffect(
    useCallback(() => {
      loadRecipes()
    }, [loadRecipes])
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.title}>菜谱</Text>
        <AnimatedPressable
          style={styles.addBtn}
          onPress={() => router.push('/recipes/new')}
        >
          <Feather name="plus" size={20} color="#fff" />
        </AnimatedPressable>
      </View>

      {/* 搜索框 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color="#a3a3a3" />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索菜谱"
            placeholderTextColor="#a3a3a3"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm ? (
            <AnimatedPressable onPress={() => setSearchTerm('')}>
              <Feather name="x" size={16} color="#a3a3a3" />
            </AnimatedPressable>
          ) : null}
        </View>
      </View>

      {/* 分类标签 */}
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map(cat => (
            <AnimatedPressable
              key={cat}
              style={[
                styles.categoryTag,
                activeCategory === cat && styles.categoryTagActive,
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>
                {cat}
              </Text>
            </AnimatedPressable>
          ))}
        </ScrollView>
      </View>

      {/* 菜谱列表 */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <View style={styles.skeletonFeatured} />
          <View style={styles.skeletonGrid}>
            <View style={styles.skeletonCard} />
            <View style={styles.skeletonCard} />
          </View>
        </View>
      ) : filteredRecipes.length === 0 ? (
        <View style={styles.emptyState}>
          <LinearGradient
            colors={['#f5f5f5', '#eeeeee']}
            style={styles.emptyIcon}
          >
            <Feather name="book-open" size={40} color="#a3a3a3" />
          </LinearGradient>
          <Text style={styles.emptyTitle}>还没有菜谱</Text>
          <Text style={styles.emptySubtitle}>添加你们喜欢的菜品吧</Text>
          <AnimatedPressable
            style={styles.emptyBtn}
            onPress={() => router.push('/recipes/new')}
          >
            <Text style={styles.emptyBtnText}>添加第一道菜</Text>
          </AnimatedPressable>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadRecipes(true)}
              tintColor="#0a0a0a"
            />
          }
        >
          {/* 大卡片 - 第一个菜谱 */}
          <AnimatedPressable
            style={styles.featuredCard}
            onPress={() => router.push(`/recipes/${filteredRecipes[0].id}`)}
          >
            <View style={styles.featuredImageContainer}>
              {filteredRecipes[0].coverImage ? (
                <Image source={{ uri: filteredRecipes[0].coverImage }} style={styles.featuredImage} />
              ) : (
                <View style={styles.featuredPlaceholder}>
                  <Feather name="image" size={48} color="#d4d4d4" />
                </View>
              )}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.6)']}
                style={styles.featuredGradient}
              />
              <View style={styles.featuredContent}>
                <Text style={styles.featuredName}>{filteredRecipes[0].name}</Text>
                {filteredRecipes[0].category && (
                  <Text style={styles.featuredCategory}>{filteredRecipes[0].category}</Text>
                )}
              </View>
            </View>
          </AnimatedPressable>

          {/* 网格列表 - 其余菜谱 */}
          {filteredRecipes.length > 1 && (
            <View style={styles.gridContainer}>
              {filteredRecipes.slice(1).map((item, index) => (
                <AnimatedPressable
                  key={item.id}
                  style={styles.recipeCard}
                  onPress={() => router.push(`/recipes/${item.id}`)}
                >
                  <View style={styles.recipeCardInner}>
                    <View style={styles.recipeImage}>
                      {item.coverImage ? (
                        <Image source={{ uri: item.coverImage }} style={styles.recipeImg} />
                      ) : (
                        <Feather name="image" size={32} color="#d4d4d4" />
                      )}
                    </View>
                    <View style={styles.recipeInfo}>
                      <Text style={styles.recipeName} numberOfLines={1}>{item.name}</Text>
                      {item.category && (
                        <Text style={styles.recipeCategory}>{item.category}</Text>
                      )}
                    </View>
                  </View>
                </AnimatedPressable>
              ))}
            </View>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#0a0a0a',
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0a0a0a',
  },
  categoryContainer: {
    paddingBottom: 12,
  },
  categoryScroll: {
    paddingHorizontal: 24,
    gap: 8,
  },
  categoryTag: {
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTagActive: {
    backgroundColor: '#0a0a0a',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
  },
  recipeCard: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  recipeCardInner: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    overflow: 'hidden',
  },
  recipeImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#ebebeb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeImg: {
    width: '100%',
    height: '100%',
  },
  recipeInfo: {
    padding: 12,
  },
  recipeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0a0a0a',
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  recipeCategory: {
    fontSize: 12,
    color: '#888',
  },
  difficultyTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#0a0a0a',
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#fff',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 64,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#0a0a0a',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#a3a3a3',
    marginTop: 4,
  },
  emptyBtn: {
    height: 48,
    paddingHorizontal: 32,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  emptyBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  // 滚动视图
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  // 加载状态
  loadingContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  skeletonFeatured: {
    width: '100%',
    aspectRatio: 16 / 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    marginBottom: 16,
  },
  skeletonGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  skeletonCard: {
    flex: 1,
    aspectRatio: 0.85,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
  },
  // 大卡片
  featuredCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  featuredImageContainer: {
    width: '100%',
    aspectRatio: 16 / 10,
    backgroundColor: '#f5f5f5',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ebebeb',
  },
  featuredGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  featuredContent: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
  },
  featuredName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  featuredCategory: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  // 网格容器
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
})
