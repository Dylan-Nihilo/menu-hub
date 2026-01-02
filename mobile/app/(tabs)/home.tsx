import { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import { Feather } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated'
import { useAuthStore } from '../../stores/authStore'
import { useToast, ConfirmModal } from '../../components/ui'
import { AnimatedPressable, FadeInView, Skeleton, AnimatedListItem, AnimatedBottomBar, AnimatedHeader } from '../../components/animated'
import { colors, spacing, borderRadius, fontSize, shadows } from '../../lib/theme'

const API_BASE = 'http://192.168.88.233:3001/api'

interface MenuItem {
  id: string
  recipe?: { id: string; name: string; category?: string }
  selectedBy?: { nickname: string }
}

interface Recipe {
  id: string
  name: string
  category?: string
  ingredients?: string
  prepTime?: number
  cookTime?: number
}

// 口味标签 - 对应原版的 moodTags
const moodTags = [
  { id: 'spicy', label: '想吃辣', icon: 'sun' as const },
  { id: 'light', label: '清淡', icon: 'droplet' as const },
  { id: 'meat', label: '想吃肉', icon: 'target' as const },
  { id: 'seafood', label: '海鲜', icon: 'anchor' as const },
  { id: 'quick', label: '快手菜', icon: 'zap' as const },
  { id: 'comfort', label: '家常', icon: 'home' as const },
]

// 口味标签过滤逻辑
const MOOD_FILTERS: Record<string, (recipe: Recipe) => boolean> = {
  spicy: (r) => r.category === '川菜' || r.name.includes('辣') || (r.ingredients?.includes('辣') ?? false),
  light: (r) => r.category === '粤菜' || r.category === '汤羹' || r.name.includes('清') || r.name.includes('蒸'),
  meat: (r) => {
    const meatKeywords = ['肉', '鸡', '鸭', '牛', '羊', '猪', '排骨', '翅']
    return meatKeywords.some(k => r.name.includes(k) || (r.ingredients?.includes(k) ?? false))
  },
  seafood: (r) => {
    const seafoodKeywords = ['鱼', '虾', '蟹', '贝', '海', '鲜']
    return r.category === '日料' || seafoodKeywords.some(k => r.name.includes(k) || (r.ingredients?.includes(k) ?? false))
  },
  quick: (r) => ((r.prepTime || 0) + (r.cookTime || 0)) <= 30 && ((r.prepTime || 0) + (r.cookTime || 0)) > 0,
  comfort: (r) => r.category === '家常菜' || r.category === '其他',
}

export default function HomeScreen() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [weekMenus, setWeekMenus] = useState<Record<string, MenuItem[]>>({})
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [randomRecipe, setRandomRecipe] = useState<Recipe | null>(null)
  const [selectedMoods, setSelectedMoods] = useState<string[]>([])
  const [isSpinning, setIsSpinning] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [weekStats, setWeekStats] = useState({ meals: 0, recipes: 0, topCategory: '' })
  const { user, menuRefreshKey } = useAuthStore()
  const router = useRouter()
  const { showToast } = useToast()

  // 老虎机动画状态
  const slotTranslateY = useSharedValue(0)
  const slotOpacity = useSharedValue(1)
  const slotScale = useSharedValue(1)

  // 老虎机动画样式
  const slotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: slotTranslateY.value },
      { scale: slotScale.value },
    ],
    opacity: slotOpacity.value,
  }))

  // 加载菜单
  const loadMenu = useCallback(async (date: Date) => {
    if (!user?.coupleId) {
      setLoading(false)
      return
    }
    try {
      const dateStr = date.toISOString().split('T')[0]
      const res = await fetch(`${API_BASE}/menu?coupleId=${user.coupleId}&date=${dateStr}`)
      const data = await res.json()
      setMenuItems(data?.items || [])
      setWeekMenus(prev => ({ ...prev, [dateStr]: data?.items || [] }))
    } catch {
      setMenuItems([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user?.coupleId])

  // 加载食谱库
  const loadRecipes = useCallback(async () => {
    if (!user?.coupleId) return
    try {
      const res = await fetch(`${API_BASE}/recipes?coupleId=${user.coupleId}`)
      const data = await res.json()
      setRecipes(Array.isArray(data) ? data : [])
    } catch {}
  }, [user?.coupleId])

  // 计算本周统计
  const calculateWeekStats = useCallback(() => {
    const allMenuItems = Object.values(weekMenus).flat()
    const meals = allMenuItems.length
    const uniqueRecipes = new Set(allMenuItems.map(item => item.recipe?.id)).size

    // 统计分类
    const categoryCount: Record<string, number> = {}
    allMenuItems.forEach(item => {
      const cat = item.recipe?.category || '其他'
      categoryCount[cat] = (categoryCount[cat] || 0) + 1
    })

    const topCategory = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || ''

    setWeekStats({ meals, recipes: uniqueRecipes, topCategory })
  }, [weekMenus])

  useEffect(() => {
    loadMenu(selectedDate)
    loadRecipes()
  }, [loadMenu, loadRecipes, selectedDate])

  // 计算周统计
  useEffect(() => {
    calculateWeekStats()
  }, [calculateWeekStats])

  // 监听全局刷新信号
  useEffect(() => {
    if (menuRefreshKey > 0) {
      loadMenu(selectedDate)
    }
  }, [menuRefreshKey, loadMenu, selectedDate])

  // 切换到此 tab 时刷新
  useFocusEffect(
    useCallback(() => {
      loadMenu(selectedDate)
      loadRecipes()
    }, [loadMenu, loadRecipes, selectedDate])
  )

  // 生成一周日期
  const getWeekDays = () => {
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      return date
    })
  }

  // 根据口味标签过滤食谱
  const getFilteredRecipes = useCallback(() => {
    if (selectedMoods.length === 0) return recipes
    return recipes.filter(recipe =>
      selectedMoods.some(moodId => MOOD_FILTERS[moodId]?.(recipe))
    )
  }, [recipes, selectedMoods])

  // 随机推荐 - 优化后的老虎机动画
  const handleRandomPick = () => {
    const filteredRecipes = getFilteredRecipes()
    if (filteredRecipes.length === 0 || isSpinning) return
    setIsSpinning(true)

    // 预选最终结果
    const finalIndex = Math.floor(Math.random() * filteredRecipes.length)
    const finalRecipe = filteredRecipes[finalIndex]

    // 快速切换阶段 - 纯视觉效果
    let count = 0
    const totalSpins = 8
    const spinQueue: Recipe[] = []

    // 预生成随机序列，避免动画中计算
    for (let i = 0; i < totalSpins; i++) {
      spinQueue.push(filteredRecipes[Math.floor(Math.random() * filteredRecipes.length)])
    }

    const spin = () => {
      if (count >= totalSpins) {
        // 最终结果 - 弹入效果
        setRandomRecipe(finalRecipe)
        slotTranslateY.value = withSpring(0, { damping: 15, stiffness: 300 })
        slotScale.value = withSequence(
          withTiming(1.02, { duration: 100 }),
          withSpring(1, { damping: 15, stiffness: 300 })
        )
        slotOpacity.value = 1
        setIsSpinning(false)
        return
      }

      // 使用预生成的序列
      setRandomRecipe(spinQueue[count])

      // 简单的淡入淡出，不做位移避免卡顿
      slotOpacity.value = withSequence(
        withTiming(0.6, { duration: 40 }),
        withTiming(1, { duration: 40 })
      )

      count++
      // 速度逐渐变慢：80ms -> 200ms
      const delay = 80 + count * 15
      setTimeout(spin, delay)
    }

    // 初始动画
    slotOpacity.value = 0.8
    spin()
  }

  // 切换口味标签
  const toggleMood = (moodId: string) => {
    setSelectedMoods(prev =>
      prev.includes(moodId)
        ? prev.filter(id => id !== moodId)
        : [...prev, moodId]
    )
  }

  // 获取问候语
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 11) return '早上好'
    if (hour < 14) return '中午好'
    if (hour < 18) return '下午好'
    return '晚上好'
  }

  // 删除菜单项
  const handleDeleteMenuItem = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`${API_BASE}/menu/item/${deleteTarget.id}`, { method: 'DELETE' })
      if (res.ok) {
        const newMenuItems = menuItems.filter(item => item.id !== deleteTarget.id)
        setMenuItems(newMenuItems)
        // 同步更新 weekMenus 以刷新统计
        const dateKey = selectedDate.toISOString().split('T')[0]
        setWeekMenus(prev => ({ ...prev, [dateKey]: newMenuItems }))
        showToast('已从菜单移除', 'success')
      } else {
        showToast('删除失败，请重试', 'error')
      }
    } catch {
      showToast('网络错误，请重试', 'error')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  const dateStr = new Date().toLocaleDateString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'long',
  })

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 头部问候 - 对应原版 header */}
      <View style={styles.header}>
        <Text style={styles.dateText}>{dateStr}</Text>
        <Text style={styles.greeting}>{getGreeting()}，{user?.nickname || '你好'}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true)
              loadMenu(selectedDate)
              loadRecipes()
            }}
            tintColor="#0a0a0a"
            progressViewOffset={10}
          />
        }
      >
        {/* 周历 - 对齐 Web 版星期日历 */}
        <View style={styles.weekCalendarContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.weekCalendar}
          >
            {getWeekDays().map((date, index) => {
              const isSelected = date.toDateString() === selectedDate.toDateString()
              const isToday = date.toDateString() === new Date().toDateString()
              const dateKey = date.toISOString().split('T')[0]
              const hasMenu = (weekMenus[dateKey]?.length || 0) > 0

              return (
                <AnimatedPressable
                  key={index}
                  onPress={() => setSelectedDate(date)}
                  style={[
                    styles.dayItem,
                    isSelected && styles.dayItemSelected,
                  ]}
                >
                  <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
                    {['日', '一', '二', '三', '四', '五', '六'][date.getDay()]}
                  </Text>
                  <View style={styles.dayNumberContainer}>
                    <Text style={[
                      styles.dayNumber,
                      isSelected && styles.dayNumberSelected,
                      isToday && !isSelected && styles.dayNumberToday
                    ]}>
                      {date.getDate()}
                    </Text>
                  </View>
                  {/* 底部指示点：有菜单显示菜单点，否则今天显示今日点 */}
                  {hasMenu ? (
                    <View style={[styles.dayDot, isSelected && styles.dayDotSelected]} />
                  ) : isToday && !isSelected ? (
                    <View style={styles.todayIndicator} />
                  ) : null}
                </AnimatedPressable>
              )
            })}
          </ScrollView>
        </View>

        {/* 今日菜单卡片 */}
        <View style={styles.menuCard}>
          <View style={styles.menuCardHeader}>
            <Text style={styles.menuCardTitle}>今日菜单</Text>
            {menuItems.length > 0 && (
              <Text style={styles.menuCardCount}>{menuItems.length} 道菜</Text>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <View style={styles.skeleton} />
              <View style={styles.skeleton} />
            </View>
          ) : menuItems.length === 0 ? (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={['#f5f5f5', '#eeeeee']}
                style={styles.emptyIconContainer}
              >
                <Feather name="coffee" size={40} color="#0a0a0a" />
              </LinearGradient>
              <Text style={styles.emptyTitle}>今天还没点菜</Text>
              <Text style={styles.emptySubtitle}>和 TA 一起选择今天吃什么吧</Text>
            </View>
          ) : (
            <View style={styles.menuList}>
              {menuItems.map((item, index) => (
                <AnimatedListItem key={item.id} index={index}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => router.push(`/recipes/${item.recipe?.id}`)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.menuItemName}>{item.recipe?.name}</Text>
                    <View style={styles.menuItemRight}>
                      <Text style={styles.menuItemBy}>{item.selectedBy?.nickname}</Text>
                      <TouchableOpacity
                        onPress={() => setDeleteTarget(item)}
                        style={styles.deleteBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Feather name="trash-2" size={16} color="#a3a3a3" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </AnimatedListItem>
              ))}
            </View>
          )}
        </View>

        {/* 口味标签 - 对齐 Web 版心情口味 */}
        <View style={styles.moodSection}>
          <Text style={styles.sectionTitle}>今天想吃</Text>
          <View style={styles.moodTags}>
            {moodTags.map((tag) => (
              <AnimatedPressable
                key={tag.id}
                style={[
                  styles.moodTag,
                  selectedMoods.includes(tag.id) && styles.moodTagActive,
                ]}
                onPress={() => toggleMood(tag.id)}
              >
                <Feather
                  name={tag.icon}
                  size={14}
                  color={selectedMoods.includes(tag.id) ? '#fff' : '#666'}
                />
                <Text style={[
                  styles.moodTagText,
                  selectedMoods.includes(tag.id) && styles.moodTagTextActive
                ]}>
                  {tag.label}
                </Text>
              </AnimatedPressable>
            ))}
          </View>
        </View>

        {/* 随机推荐 - 对齐 Web 版白卡 + Sparkles */}
        <View style={styles.randomCard}>
          <View style={styles.randomHeader}>
            <View style={styles.randomTitleRow}>
              <Text style={styles.sectionTitle}>今天吃什么？</Text>
              {selectedMoods.length > 0 && (
                <Text style={styles.filterCount}>
                  {getFilteredRecipes().length} 道符合
                </Text>
              )}
            </View>
            <AnimatedPressable
              style={styles.shuffleBtn}
              onPress={handleRandomPick}
              disabled={getFilteredRecipes().length === 0 || isSpinning}
            >
              <Feather
                name="shuffle"
                size={16}
                color="#0a0a0a"
                style={getFilteredRecipes().length === 0 || isSpinning ? { opacity: 0.5 } : undefined}
              />
              <Text style={[styles.shuffleBtnText, (getFilteredRecipes().length === 0 || isSpinning) && { opacity: 0.5 }]}>换一个</Text>
            </AnimatedPressable>
          </View>

          {randomRecipe ? (
            <Animated.View style={slotAnimatedStyle}>
              <AnimatedPressable
                style={styles.randomResult}
                onPress={() => router.push(`/recipes/${randomRecipe.id}`)}
              >
                <View>
                  <Text style={styles.randomName}>{randomRecipe.name}</Text>
                  {randomRecipe.category && (
                    <Text style={styles.randomCategory}>{randomRecipe.category}</Text>
                  )}
                </View>
                <Feather name="star" size={20} color="#a3a3a3" />
              </AnimatedPressable>
            </Animated.View>
          ) : (
            <AnimatedPressable
              style={styles.randomEmpty}
              onPress={handleRandomPick}
              disabled={getFilteredRecipes().length === 0}
            >
              <Text style={styles.randomEmptyText}>
                {recipes.length === 0
                  ? '还没有食谱'
                  : getFilteredRecipes().length === 0
                    ? '没有符合条件的食谱'
                    : '点击随机推荐一道菜'}
              </Text>
            </AnimatedPressable>
          )}
        </View>

        {/* 本周统计卡片 */}
        {weekStats.meals > 0 && (
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>本周烹饪</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{weekStats.meals}</Text>
                <Text style={styles.statLabel}>餐</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{weekStats.recipes}</Text>
                <Text style={styles.statLabel}>道菜</Text>
              </View>
              {weekStats.topCategory && (
                <>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statCategory}>{weekStats.topCategory}</Text>
                    <Text style={styles.statLabel}>最爱</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* 底部留白 */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* 底部固定按钮 - 动画毛玻璃效果 */}
      <AnimatedBottomBar visible={true}>
        <AnimatedPressable
          style={styles.addButton}
          onPress={() => router.push('/select')}
        >
          <Feather name="plus" size={20} color="#fff" />
          <Text style={styles.addButtonText}>点菜</Text>
        </AnimatedPressable>
      </AnimatedBottomBar>

      {/* 删除确认对话框 */}
      <ConfirmModal
        visible={!!deleteTarget}
        title="移除菜品"
        message={`确定要将「${deleteTarget?.recipe?.name}」从今日菜单中移除吗？`}
        confirmText="移除"
        confirmStyle="danger"
        onConfirm={handleDeleteMenuItem}
        onCancel={() => setDeleteTarget(null)}
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
  // 头部
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  dateText: {
    fontSize: 14,
    color: '#a3a3a3',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '600',
    color: '#0a0a0a',
    marginTop: 4,
  },
  // 滚动区域
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  // 周历
  weekCalendarContainer: {
    marginBottom: 16,
    marginHorizontal: -24,
  },
  weekCalendar: {
    paddingHorizontal: 24,
    gap: 8,
  },
  dayItem: {
    width: 48,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  dayItemSelected: {
    backgroundColor: '#0a0a0a',
  },
  dayItemPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  dayLabel: {
    fontSize: 11,
    color: '#a3a3a3',
  },
  dayLabelSelected: {
    color: 'rgba(255,255,255,0.7)',
  },
  dayNumber: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0a0a0a',
    marginTop: 2,
  },
  dayNumberContainer: {
    alignItems: 'center',
  },
  dayNumberSelected: {
    color: '#fff',
  },
  dayNumberToday: {
    color: '#0a0a0a',
    fontWeight: '700',
  },
  todayIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0a0a0a',
    marginTop: 2,
  },
  dayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0a0a0a',
    marginTop: 4,
  },
  dayDotSelected: {
    backgroundColor: '#fff',
  },
  // 今日菜单卡片
  menuCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  menuCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  menuCardTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0a0a0a',
  },
  menuCardCount: {
    fontSize: 13,
    color: '#a3a3a3',
  },
  loadingContainer: {
    gap: 12,
  },
  skeleton: {
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0a0a0a',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#a3a3a3',
    marginTop: 4,
  },
  menuList: {
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
  },
  menuItemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0a0a0a',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuItemBy: {
    fontSize: 13,
    color: '#a3a3a3',
  },
  deleteBtn: {
    padding: 4,
  },
  // 口味标签
  moodSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  moodTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  moodTagActive: {
    backgroundColor: '#0a0a0a',
  },
  moodTagPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  moodTagText: {
    fontSize: 13,
    color: '#666',
  },
  moodTagTextActive: {
    color: '#fff',
  },
  // 随机推荐
  randomCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    padding: 16,
  },
  randomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  randomTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterCount: {
    fontSize: 12,
    color: '#a3a3a3',
    backgroundColor: '#e5e5e5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  shuffleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shuffleBtnPressed: {
    opacity: 0.6,
  },
  shuffleBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0a0a0a',
  },
  randomResult: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  randomResultPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#fafafa',
  },
  randomName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0a0a0a',
  },
  randomCategory: {
    fontSize: 13,
    color: '#a3a3a3',
    marginTop: 4,
  },
  randomEmpty: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  randomEmptyPressed: {
    opacity: 0.6,
  },
  randomEmptyText: {
    fontSize: 14,
    color: '#a3a3a3',
  },
  // 本周统计卡片
  statsCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
  },
  statsTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0a0a0a',
  },
  statCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0a0a0a',
  },
  statLabel: {
    fontSize: 12,
    color: '#a3a3a3',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#e5e5e5',
  },
  // 底部按钮 - 毛玻璃效果
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  addButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
})
