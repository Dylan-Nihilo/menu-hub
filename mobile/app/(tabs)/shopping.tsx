import { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { useAuthStore } from '../../stores/authStore'
import { useToast, ConfirmModal } from '../../components/ui'
import { AnimatedPressable, AnimatedCheckbox, AnimatedListItem, AnimatedBottomBar, SwipeableRow } from '../../components/animated'

const API_BASE = 'http://192.168.88.233:3001/api'

interface ShoppingItem {
  id: string
  name: string
  amount?: string
  checked: boolean
  type?: string
  category?: string
  recipeId?: string
  recipeName?: string
}

interface Recipe {
  id: string
  name: string
  ingredients: string | null
}

interface RecipeGroup {
  recipeId: string
  recipeName: string
  items: ShoppingItem[]
}

const formatDate = (date: Date) => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return {
    month: date.getMonth() + 1,
    day: date.getDate(),
    weekday: weekdays[date.getDay()]
  }
}

export default function ShoppingScreen() {
  const [memoItems, setMemoItems] = useState<ShoppingItem[]>([])
  const [commonItems, setCommonItems] = useState<ShoppingItem[]>([])
  const [recipeGroups, setRecipeGroups] = useState<RecipeGroup[]>([])
  const [todayRecipes, setTodayRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemAmount, setNewItemAmount] = useState('')
  const [clearing, setClearing] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const { user } = useAuthStore()
  const { showToast } = useToast()
  const today = formatDate(new Date())
  const todayStr = new Date().toISOString().split('T')[0]

  const loadItems = useCallback(async () => {
    if (!user?.coupleId) {
      setLoading(false)
      return
    }
    try {
      const res = await fetch(`${API_BASE}/shopping?coupleId=${user.coupleId}&date=${todayStr}`)
      const data = await res.json()
      if (!Array.isArray(data)) {
        setMemoItems([])
        setCommonItems([])
        setRecipeGroups([])
        return
      }
      // 按类型分组
      const memo: ShoppingItem[] = []
      const common: ShoppingItem[] = []
      const recipes: Record<string, RecipeGroup> = {}
      data.forEach((item: ShoppingItem) => {
        if (item.type === 'memo') {
          memo.push(item)
        } else if (item.type === 'common') {
          common.push(item)
        } else if (item.type === 'recipe' && item.recipeId) {
          if (!recipes[item.recipeId]) {
            recipes[item.recipeId] = { recipeId: item.recipeId, recipeName: item.recipeName || '', items: [] }
          }
          recipes[item.recipeId].items.push(item)
        }
      })
      setMemoItems(memo)
      setCommonItems(common)
      setRecipeGroups(Object.values(recipes))
    } catch {
      setMemoItems([])
      setCommonItems([])
      setRecipeGroups([])
      showToast('加载购物清单失败', 'error')
    } finally {
      setLoading(false)
    }
  }, [user?.coupleId, todayStr, showToast])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  // 加载今日菜谱
  const loadTodayMenu = useCallback(async () => {
    if (!user?.coupleId) return
    try {
      const res = await fetch(`${API_BASE}/menu?coupleId=${user.coupleId}&date=${todayStr}`)
      if (res.ok) {
        const data = await res.json()
        const recipes = data?.items?.map((item: { recipe: Recipe }) => item.recipe).filter(Boolean) || []
        setTodayRecipes(recipes)
      }
    } catch {
      // Silent fail for today's menu - not critical
    }
  }, [user?.coupleId, todayStr])

  useEffect(() => {
    loadTodayMenu()
  }, [loadTodayMenu])

  // 切换到此 tab 时刷新数据
  useFocusEffect(
    useCallback(() => {
      loadItems()
      loadTodayMenu()
    }, [loadItems, loadTodayMenu])
  )

  // AI 生成购物清单
  const generateFromRecipes = async () => {
    if (todayRecipes.length === 0 || !user?.coupleId) return
    setGenerating(true)
    try {
      // 先清除已有的 AI 生成数据
      const existingIds = [...commonItems.map(i => i.id), ...recipeGroups.flatMap(g => g.items.map(i => i.id))]
      await Promise.all(existingIds.map(id => fetch(`${API_BASE}/shopping/${id}`, { method: 'DELETE' })))

      // 调用 AI 生成
      const res = await fetch(`${API_BASE}/ai/shopping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipes: todayRecipes }),
      })
      if (!res.ok) throw new Error('生成失败')
      const data = await res.json()

      // 保存到数据库
      const itemsToSave: any[] = []
      if (data.common?.length) {
        data.common.forEach((item: any) => itemsToSave.push({ ...item, type: 'common' }))
      }
      if (data.recipes?.length) {
        data.recipes.forEach((r: any) => {
          r.items.forEach((item: any) => itemsToSave.push({ ...item, type: 'recipe', recipeId: r.recipeId, recipeName: r.recipeName }))
        })
      }
      if (itemsToSave.length > 0) {
        await fetch(`${API_BASE}/shopping`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coupleId: user.coupleId, date: todayStr, items: itemsToSave }),
        })
        loadItems()
      }
      showToast('购物清单生成完成', 'success')
    } catch {
      showToast('生成失败，请重试', 'error')
    } finally {
      setGenerating(false)
    }
  }

  // 切换选中状态
  const toggleItem = async (id: string, type: string) => {
    let currentChecked = false
    if (type === 'memo') {
      currentChecked = memoItems.find(i => i.id === id)?.checked || false
    } else if (type === 'common') {
      currentChecked = commonItems.find(i => i.id === id)?.checked || false
    } else {
      const group = recipeGroups.find(g => g.recipeId === type)
      currentChecked = group?.items.find(i => i.id === id)?.checked || false
    }
    // 乐观更新前端状态
    if (type === 'memo') {
      setMemoItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item))
    } else if (type === 'common') {
      setCommonItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item))
    } else {
      setRecipeGroups(prev => prev.map(group =>
        group.recipeId === type
          ? { ...group, items: group.items.map(item => item.id === id ? { ...item, checked: !item.checked } : item) }
          : group
      ))
    }
    try {
      const res = await fetch(`${API_BASE}/shopping/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checked: !currentChecked }),
      })
      if (!res.ok) throw new Error()
    } catch {
      // 回滚状态
      if (type === 'memo') {
        setMemoItems(prev => prev.map(item => item.id === id ? { ...item, checked: currentChecked } : item))
      } else if (type === 'common') {
        setCommonItems(prev => prev.map(item => item.id === id ? { ...item, checked: currentChecked } : item))
      } else {
        setRecipeGroups(prev => prev.map(group =>
          group.recipeId === type
            ? { ...group, items: group.items.map(item => item.id === id ? { ...item, checked: currentChecked } : item) }
            : group
        ))
      }
      showToast('更新失败', 'error')
    }
  }

  // 删除项目
  const deleteItem = async (id: string, type: string) => {
    try {
      const res = await fetch(`${API_BASE}/shopping/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      // 删除成功后更新状态
      if (type === 'memo') {
        setMemoItems(prev => prev.filter(item => item.id !== id))
      } else if (type === 'common') {
        setCommonItems(prev => prev.filter(item => item.id !== id))
      } else {
        setRecipeGroups(prev => prev.map(group =>
          group.recipeId === type
            ? { ...group, items: group.items.filter(item => item.id !== id) }
            : group
        ))
      }
    } catch {
      showToast('删除失败', 'error')
    }
  }

  const addItem = async () => {
    if (!newItemName.trim() || !user?.coupleId) return
    try {
      const res = await fetch(`${API_BASE}/shopping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coupleId: user.coupleId,
          name: newItemName,
          amount: newItemAmount || '',
          category: '',
          type: 'memo',
          listDate: todayStr,
        }),
      })
      if (!res.ok) throw new Error()
      loadItems()
      showToast('已添加到清单', 'success')
      setNewItemName('')
      setNewItemAmount('')
      setShowAddModal(false)
    } catch {
      showToast('添加失败，请重试', 'error')
    }
  }

  // 清除已完成
  const clearCompleted = async () => {
    setClearing(true)
    const checkedIds = [
      ...memoItems.filter(i => i.checked).map(i => i.id),
      ...commonItems.filter(i => i.checked).map(i => i.id),
      ...recipeGroups.flatMap(g => g.items.filter(i => i.checked).map(i => i.id)),
    ]
    try {
      await Promise.all(checkedIds.map(id => fetch(`${API_BASE}/shopping/${id}`, { method: 'DELETE' })))
      loadItems()
      showToast(`已清除 ${checkedIds.length} 项`, 'success')
    } catch {
      showToast('清除失败，请重试', 'error')
    } finally {
      setClearing(false)
      setShowClearConfirm(false)
    }
  }

  // 统计
  const allItems = [...memoItems, ...commonItems, ...recipeGroups.flatMap(g => g.items)]
  const checkedCount = allItems.filter(i => i.checked).length
  const totalCount = allItems.length

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 头部 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Feather name="calendar" size={20} color="#666" />
          <View>
            <Text style={styles.title}>{today.month}月{today.day}日</Text>
            <Text style={styles.subtitle}>{today.weekday} · 买菜清单</Text>
          </View>
        </View>
        <AnimatedPressable
          style={styles.addBtn}
          onPress={() => setShowAddModal(true)}
        >
          <Feather name="plus" size={20} color="#fff" />
        </AnimatedPressable>
      </View>

      {/* 统计 */}
      {totalCount > 0 && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>共 {totalCount} 项 · 已完成 {checkedCount} 项</Text>
        </View>
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 今日菜谱 + AI生成 - 对齐 Web 版 */}
        {todayRecipes.length > 0 && (
          <View style={styles.recipeCard}>
            <View style={styles.recipeHeader}>
              <Feather name="coffee" size={18} color="#666" />
              <Text style={styles.recipeTitle}>今日菜谱</Text>
            </View>
            <View style={styles.recipeTags}>
              {todayRecipes.map((recipe, index) => (
                <View key={`${recipe.id}-${index}`} style={styles.recipeTag}>
                  <Text style={styles.recipeTagText}>{recipe.name}</Text>
                </View>
              ))}
            </View>
            <AnimatedPressable
              style={[
                styles.aiBtn,
                generating && styles.aiBtnDisabled,
              ]}
              onPress={generateFromRecipes}
              disabled={generating}
            >
              {generating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <MaterialCommunityIcons name="brain" size={18} color="#fff" />
              )}
              <Text style={styles.aiBtnText}>{generating ? '生成中...' : 'AI 生成购物清单'}</Text>
            </AnimatedPressable>
          </View>
        )}

        {/* 公共食材 */}
        {commonItems.length > 0 && (
          <View style={styles.groupSection}>
            <View style={styles.groupHeader}>
              <View style={[styles.groupDot, { backgroundColor: '#0a0a0a' }]} />
              <Text style={styles.groupTitle}>公共食材</Text>
              <Text style={styles.groupCount}>({commonItems.length})</Text>
            </View>
            <View style={styles.groupCard}>
              {commonItems.map((item, i) => (
                <AnimatedListItem key={item.id} index={i}>
                  <SwipeableRow onDelete={() => deleteItem(item.id, 'common')}>
                    <TouchableOpacity
                      style={[styles.item, item.checked && styles.itemCheckedBg, i < commonItems.length - 1 && styles.itemBorder]}
                      onPress={() => toggleItem(item.id, 'common')}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
                        {item.checked && <Feather name="check" size={12} color="#fff" />}
                      </View>
                      <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>{item.name}</Text>
                      <Text style={[styles.itemAmount, item.checked && styles.itemAmountChecked]}>{item.amount}</Text>
                    </TouchableOpacity>
                  </SwipeableRow>
                </AnimatedListItem>
              ))}
            </View>
          </View>
        )}

        {/* 菜谱分组 */}
        {recipeGroups.map(group => group.items.length > 0 && (
          <View key={group.recipeId} style={styles.groupSection}>
            <View style={styles.groupHeader}>
              <View style={[styles.groupDot, { backgroundColor: '#666' }]} />
              <Text style={styles.groupTitle}>{group.recipeName}</Text>
              <Text style={styles.groupCount}>({group.items.length})</Text>
            </View>
            <View style={styles.groupCard}>
              {group.items.map((item, i) => (
                <AnimatedListItem key={item.id} index={i}>
                  <SwipeableRow onDelete={() => deleteItem(item.id, group.recipeId)}>
                    <TouchableOpacity
                      style={[styles.item, item.checked && styles.itemCheckedBg, i < group.items.length - 1 && styles.itemBorder]}
                      onPress={() => toggleItem(item.id, group.recipeId)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
                        {item.checked && <Feather name="check" size={12} color="#fff" />}
                      </View>
                      <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>{item.name}</Text>
                      <Text style={[styles.itemAmount, item.checked && styles.itemAmountChecked]}>{item.amount}</Text>
                    </TouchableOpacity>
                  </SwipeableRow>
                </AnimatedListItem>
              ))}
            </View>
          </View>
        ))}

        {/* 备忘录 */}
        {memoItems.length > 0 && (
          <View style={styles.groupSection}>
            <View style={styles.groupHeader}>
              <View style={[styles.groupDot, { backgroundColor: '#a3a3a3' }]} />
              <Text style={styles.groupTitle}>备忘录</Text>
              <Text style={styles.groupCount}>({memoItems.length})</Text>
            </View>
            <View style={styles.groupCard}>
              {memoItems.map((item, i) => (
                <AnimatedListItem key={item.id} index={i}>
                  <SwipeableRow onDelete={() => deleteItem(item.id, 'memo')}>
                    <TouchableOpacity
                      style={[styles.item, item.checked && styles.itemCheckedBg, i < memoItems.length - 1 && styles.itemBorder]}
                      onPress={() => toggleItem(item.id, 'memo')}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
                        {item.checked && <Feather name="check" size={12} color="#fff" />}
                      </View>
                      <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>{item.name}</Text>
                      <Text style={[styles.itemAmount, item.checked && styles.itemAmountChecked]}>{item.amount}</Text>
                    </TouchableOpacity>
                  </SwipeableRow>
                </AnimatedListItem>
              ))}
            </View>
          </View>
        )}

        {/* 空状态 - 对齐 Web 版渐变图标 */}
        {totalCount === 0 && todayRecipes.length === 0 && !loading && (
          <View style={styles.empty}>
            <LinearGradient
              colors={['#f5f5f5', '#eeeeee']}
              style={styles.emptyIcon}
            >
              <Feather name="shopping-cart" size={40} color="#a3a3a3" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>还没有购物清单</Text>
            <Text style={styles.emptySubtitle}>选择今日菜谱或手动添加</Text>
          </View>
        )}

        <View style={{ height: checkedCount > 0 ? 100 : 40 }} />
      </ScrollView>

      {/* 底部清除栏 - 动画毛玻璃效果 */}
      <AnimatedBottomBar visible={checkedCount > 0}>
        <View style={styles.bottomContent}>
          <View style={styles.bottomLeft}>
            <View style={styles.bottomBadge}>
              <Text style={styles.bottomBadgeText}>{checkedCount}</Text>
            </View>
            <Text style={styles.bottomText}>项已选中</Text>
          </View>
          <AnimatedPressable
            style={styles.clearBtn}
            onPress={() => setShowClearConfirm(true)}
          >
            <Feather name="trash-2" size={16} color="#fff" />
            <Text style={styles.clearBtnText}>清除已选</Text>
          </AnimatedPressable>
        </View>
      </AnimatedBottomBar>

      {/* 添加弹窗 - 修复键盘遮挡 */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowAddModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>添加到清单</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Feather name="x" size={20} color="#0a0a0a" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="物品名称"
              placeholderTextColor="#a3a3a3"
              value={newItemName}
              onChangeText={setNewItemName}
              autoFocus
            />
            <TextInput
              style={styles.modalInput}
              placeholder="数量，如：2个"
              placeholderTextColor="#a3a3a3"
              value={newItemAmount}
              onChangeText={setNewItemAmount}
            />
            <AnimatedPressable
              style={styles.modalBtn}
              onPress={addItem}
            >
              <Text style={styles.modalBtnText}>添加</Text>
            </AnimatedPressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 清除确认弹窗 */}
      <ConfirmModal
        visible={showClearConfirm}
        title="清除已选项目"
        message={`确定要清除 ${checkedCount} 个已选项目吗？`}
        confirmText="清除"
        cancelText="取消"
        confirmStyle="danger"
        onConfirm={clearCompleted}
        onCancel={() => setShowClearConfirm(false)}
        loading={clearing}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#0a0a0a',
  },
  subtitle: {
    fontSize: 13,
    color: '#a3a3a3',
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
  statsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  statsText: {
    fontSize: 13,
    color: '#a3a3a3',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  recipeCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  recipeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0a0a0a',
  },
  recipeTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  recipeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  recipeTagText: {
    fontSize: 13,
    color: '#0a0a0a',
  },
  aiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 40,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
  },
  aiBtnDisabled: {
    opacity: 0.5,
  },
  aiBtnPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  aiBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  itemCheckedBg: {
    backgroundColor: '#fafafa',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d4d4d4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0a0a0a',
    borderColor: '#0a0a0a',
  },
  itemName: {
    flex: 1,
    fontSize: 15,
    color: '#0a0a0a',
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: '#737373',
  },
  itemAmount: {
    fontSize: 13,
    color: '#737373',
  },
  itemAmountChecked: {
    color: '#a3a3a3',
  },
  deleteBtn: {
    padding: 4,
  },
  groupSection: {
    marginBottom: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  groupDot: {
    width: 4,
    height: 16,
    borderRadius: 2,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  groupCount: {
    fontSize: 12,
    color: '#a3a3a3',
  },
  groupCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    overflow: 'hidden',
  },
  empty: {
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
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  bottomContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bottomBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBadgeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  bottomText: {
    fontSize: 15,
    color: '#0a0a0a',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
  },
  clearBtnPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  clearBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0a0a0a',
  },
  modalInput: {
    height: 48,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#0a0a0a',
    marginBottom: 12,
  },
  modalBtn: {
    height: 48,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  modalBtnPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
})
