import { useState, useEffect, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView, Dimensions, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useAuthStore } from '../stores/authStore'
import { useToast } from '../components/ui'
import { AnimatedPressable, AnimatedBottomBar } from '../components/animated'

const API_BASE = 'http://192.168.88.233:3001/api'
const { width } = Dimensions.get('window')
const CARD_WIDTH = (width - 24 * 2 - 12) / 2

const categories = ['全部', '家常菜', '川菜', '粤菜', '西餐', '日料', '甜点', '汤羹', '其他']

interface Recipe {
  id: string
  name: string
  category?: string
}

export default function SelectScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('全部')
  const [loading, setLoading] = useState(false)
  const [loadingRecipes, setLoadingRecipes] = useState(true)
  const { user } = useAuthStore()
  const router = useRouter()
  const { showToast } = useToast()

  const loadRecipes = useCallback(async () => {
    if (!user?.coupleId) return
    setLoadingRecipes(true)
    try {
      const res = await fetch(`${API_BASE}/recipes?coupleId=${user.coupleId}`)
      const data = await res.json()
      setRecipes(Array.isArray(data) ? data : [])
    } catch {
      showToast('加载菜谱失败', 'error')
    } finally {
      setLoadingRecipes(false)
    }
  }, [user?.coupleId, showToast])

  useEffect(() => {
    loadRecipes()
  }, [loadRecipes])

  // 筛选菜谱
  const filteredRecipes = useMemo(() => {
    return recipes
      .filter(r => activeCategory === '全部' || r.category === activeCategory)
      .filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [recipes, activeCategory, searchTerm])

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleConfirm = async () => {
    if (selected.length === 0) {
      showToast('请选择至少一道菜', 'warning')
      return
    }
    setLoading(true)
    const date = new Date().toISOString().split('T')[0]
    try {
      for (const recipeId of selected) {
        await fetch(`${API_BASE}/menu`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coupleId: user?.coupleId, date, recipeId, userId: user?.id }),
        })
      }
      // 触发菜单刷新
      useAuthStore.getState().triggerMenuRefresh()
      showToast(`已添加 ${selected.length} 道菜到今日菜单`, 'success')
      router.dismiss()
    } catch {
      showToast('添加失败，请重试', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.dismiss()} style={styles.closeBtn}>
          <Feather name="x" size={24} color="#0a0a0a" />
        </TouchableOpacity>
        <Text style={styles.title}>点菜</Text>
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map(cat => (
          <AnimatedPressable
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={[
              styles.categoryTag,
              activeCategory === cat && styles.categoryTagActive,
            ]}
          >
            <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>
              {cat}
            </Text>
          </AnimatedPressable>
        ))}
      </ScrollView>

      {/* 列表 - 双列网格 对齐 Web 版 ring 选中效果 */}
      <FlatList
        data={filteredRecipes}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <AnimatedPressable
            style={styles.cardWrapper}
            onPress={() => toggleSelect(item.id)}
          >
            <View style={[
              styles.card,
              selected.includes(item.id) && styles.cardSelected
            ]}>
              {/* 图片占位区域 */}
              <View style={styles.cardImage}>
                <Feather name="image" size={32} color="#d4d4d4" />
              </View>
              {/* 菜名 */}
              <View style={styles.cardContent}>
                <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                {item.category && <Text style={styles.cardCategory}>{item.category}</Text>}
              </View>
            </View>
            {/* 选中标记 - 浮动勾标 */}
            {selected.includes(item.id) && (
              <View style={styles.checkBadge}>
                <Feather name="check" size={12} color="#fff" />
              </View>
            )}
          </AnimatedPressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            {loadingRecipes ? (
              <ActivityIndicator size="large" color="#0a0a0a" />
            ) : (
              <Text style={styles.emptyText}>没有找到菜谱</Text>
            )}
          </View>
        }
      />

      {/* 底部确认按钮 - 动画毛玻璃效果 */}
      <AnimatedBottomBar visible={selected.length > 0}>
        <AnimatedPressable
          style={[styles.confirmBtn, loading && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={loading}
        >
          <Text style={styles.confirmBtnText}>
            {loading ? '提交中...' : `确认选择 (${selected.length})`}
          </Text>
        </AnimatedPressable>
      </AnimatedBottomBar>
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
    justifyContent: 'center',
    paddingHorizontal: 16,
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  closeBtn: {
    position: 'absolute',
    left: 16,
    padding: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0a0a0a',
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingBottom: 12,
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
    paddingHorizontal: 24,
    paddingBottom: 12,
    gap: 8,
  },
  categoryTag: {
    paddingHorizontal: 16,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
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
  list: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 120,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    position: 'relative',
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  card: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardSelected: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0a0a0a',
    margin: -2,
    shadowColor: '#0a0a0a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#e5e5e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    padding: 12,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0a0a0a',
  },
  cardCategory: {
    fontSize: 12,
    color: '#a3a3a3',
    marginTop: 2,
  },
  checkBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 64,
  },
  emptyText: {
    fontSize: 14,
    color: '#a3a3a3',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  confirmBtn: {
    height: 48,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  confirmBtnDisabled: {
    opacity: 0.5,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
})
