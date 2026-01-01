import { useState, useEffect, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView, Image, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useAuthStore } from '../../stores/authStore'
import { AnimatedPressable, FadeInView, Skeleton, AnimatedListItem } from '../../components/animated'

const API_BASE = 'http://192.168.88.233:3001/api'
const { width } = Dimensions.get('window')
const CARD_WIDTH = (width - 24 * 2 - 12) / 2

interface Recipe {
  id: string
  name: string
  category?: string
  coverImage?: string
}

const categories = ['全部', '家常菜', '川菜', '粤菜', '西餐', '日料', '甜点', '汤羹', '其他']

export default function RecipesScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('全部')
  const { user, recipeRefreshKey } = useAuthStore()
  const router = useRouter()

  const filteredRecipes = useMemo(() => {
    return recipes
      .filter(r => activeCategory === '全部' || r.category === activeCategory)
      .filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [recipes, activeCategory, searchTerm])

  const loadRecipes = useCallback(async () => {
    if (!user?.coupleId) {
      setLoading(false)
      return
    }
    try {
      const res = await fetch(`${API_BASE}/recipes?coupleId=${user.coupleId}`)
      const data = await res.json()
      setRecipes(Array.isArray(data) ? data : [])
    } catch {
      setRecipes([])
    } finally {
      setLoading(false)
    }
  }, [user?.coupleId])

  useEffect(() => {
    loadRecipes()
  }, [loadRecipes])

  // 监听全局刷新信号
  useEffect(() => {
    if (recipeRefreshKey > 0) {
      loadRecipes()
    }
  }, [recipeRefreshKey, loadRecipes])

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 页面标题 */}
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
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <Feather name="x" size={16} color="#a3a3a3" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* 分类标签 - 对齐 Web 版 */}
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
        <View style={styles.gridContainer}>
          {[1, 2, 3, 4].map(i => (
            <View key={i} style={styles.skeletonCard} />
          ))}
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
        <FlatList
          data={filteredRecipes}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item, index }) => (
            <AnimatedListItem index={index}>
              <AnimatedPressable
                style={styles.recipeCard}
                onPress={() => router.push(`/recipes/${item.id}`)}
              >
                <View style={styles.recipeImage}>
                  {item.coverImage ? (
                    <Image source={{ uri: item.coverImage }} style={styles.recipeImg} />
                  ) : (
                    <Feather name="image" size={32} color="#a3a3a3" />
                  )}
                </View>
                <View style={styles.recipeInfo}>
                  <Text style={styles.recipeName} numberOfLines={1}>{item.name}</Text>
                  {item.category && (
                    <Text style={styles.recipeCategory}>{item.category}</Text>
                  )}
                </View>
              </AnimatedPressable>
            </AnimatedListItem>
          )}
        />
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
    borderRadius: 18,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
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
    paddingHorizontal: 16,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTagActive: {
    backgroundColor: '#0a0a0a',
  },
  categoryTagPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 12,
  },
  skeletonCard: {
    width: CARD_WIDTH,
    aspectRatio: 0.8,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
  },
  gridContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  gridRow: {
    gap: 12,
  },
  recipeCard: {
    width: CARD_WIDTH,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  recipeCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  recipeImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
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
    fontWeight: '500',
    color: '#0a0a0a',
  },
  recipeCategory: {
    fontSize: 13,
    color: '#a3a3a3',
    marginTop: 2,
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
    backgroundColor: '#f5f5f5',
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
  emptyBtnPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  emptyBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
})
