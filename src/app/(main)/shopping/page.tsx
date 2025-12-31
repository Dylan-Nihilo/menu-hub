'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, X, Sparkles, ChefHat, Calendar, Loader2 } from 'lucide-react'
import { AppLayout, ScrollArea } from '@/components/layout'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/components/ui/Toast'

const defaultCategories = ['蔬菜', '水果', '肉类', '海鲜', '蛋奶', '调味料', '其他']

interface ShoppingItem {
  id: string
  name: string
  amount: string
  checked: boolean
  category: string
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

// 根据食材名称猜测分类
const guessCategory = (name: string): string => {
  const categories: Record<string, string[]> = {
    '蔬菜': ['菜', '萝卜', '白菜', '青菜', '菠菜', '芹菜', '韭菜', '葱', '蒜', '姜', '洋葱', '土豆', '番茄', '西红柿', '黄瓜', '茄子', '辣椒', '豆角', '豆芽', '蘑菇', '香菇', '木耳', '笋', '莲藕', '南瓜', '冬瓜', '苦瓜', '丝瓜', '西兰花', '花菜', '生菜', '油麦菜', '空心菜', '娃娃菜'],
    '肉类': ['肉', '猪', '牛', '羊', '鸡', '鸭', '鹅', '排骨', '五花', '里脊', '腿肉', '翅', '胸肉', '肥肠', '猪蹄', '牛腩', '羊排'],
    '海鲜': ['鱼', '虾', '蟹', '贝', '蛤', '蚝', '鱿鱼', '墨鱼', '海参', '扇贝', '龙虾', '螃蟹', '带鱼', '鲈鱼', '鲫鱼', '鲤鱼', '三文鱼', '金枪鱼'],
    '蛋奶': ['蛋', '奶', '牛奶', '鸡蛋', '鸭蛋', '皮蛋', '奶酪', '黄油', '奶油', '酸奶'],
    '调味料': ['盐', '糖', '酱', '醋', '油', '料酒', '生抽', '老抽', '蚝油', '香油', '花椒', '八角', '桂皮', '香叶', '味精', '鸡精', '胡椒', '辣椒粉', '五香粉', '淀粉', '面粉'],
    '水果': ['苹果', '香蕉', '橙', '柠檬', '葡萄', '草莓', '蓝莓', '芒果', '菠萝', '西瓜', '哈密瓜', '桃', '梨', '樱桃', '荔枝', '龙眼'],
  }

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(kw => name.includes(kw))) {
      return category
    }
  }
  return '其他'
}

export default function ShoppingListPage() {
  const { user } = useAuthStore()
  const { addToast } = useToast()
  const [memoItems, setMemoItems] = useState<ShoppingItem[]>([])
  const [commonItems, setCommonItems] = useState<ShoppingItem[]>([])
  const [recipeGroups, setRecipeGroups] = useState<RecipeGroup[]>([])
  const [todayRecipes, setTodayRecipes] = useState<Recipe[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', amount: '', category: '蔬菜' })
  const [generating, setGenerating] = useState(false)
  const today = formatDate(new Date())
  const todayStr = new Date().toISOString().split('T')[0]

  // 加载购物清单
  const loadShoppingList = useCallback(async () => {
    if (!user?.coupleId) return
    try {
      const res = await fetch(`/api/shopping?coupleId=${user.coupleId}&date=${todayStr}`)
      if (res.ok) {
        const items = await res.json()
        // 按类型分组
        const memo: ShoppingItem[] = []
        const common: ShoppingItem[] = []
        const recipes: Record<string, RecipeGroup> = {}

        items.forEach((item: ShoppingItem & { type: string; recipeId?: string; recipeName?: string }) => {
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
      }
    } catch { /* 静默失败 */ }
  }, [user?.coupleId, todayStr])

  // 加载今日菜单
  const loadTodayMenu = useCallback(async () => {
    if (!user?.coupleId) return
    try {
      const dateStr = new Date().toISOString().split('T')[0]
      const res = await fetch(`/api/menu?coupleId=${user.coupleId}&date=${dateStr}`)
      if (res.ok) {
        const data = await res.json()
        const recipes = data?.items?.map((item: { recipe: Recipe }) => item.recipe).filter(Boolean) || []
        setTodayRecipes(recipes)
      }
    } catch { /* 静默失败 */ }
  }, [user?.coupleId])

  useEffect(() => { loadTodayMenu() }, [loadTodayMenu])

  // 加载购物清单
  useEffect(() => { loadShoppingList() }, [loadShoppingList])

  // 页面可见时重新加载
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadTodayMenu()
        loadShoppingList()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [loadTodayMenu, loadShoppingList])

  // 切换选中状态
  const toggleItem = async (id: string, type: 'memo' | 'common' | string) => {
    // 先找到当前状态
    let currentChecked = false
    if (type === 'memo') {
      currentChecked = memoItems.find(i => i.id === id)?.checked || false
    } else if (type === 'common') {
      currentChecked = commonItems.find(i => i.id === id)?.checked || false
    } else {
      const group = recipeGroups.find(g => g.recipeId === type)
      currentChecked = group?.items.find(i => i.id === id)?.checked || false
    }

    // 调用 API
    try {
      await fetch(`/api/shopping/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checked: !currentChecked }),
      })
    } catch { /* 静默失败 */ }

    // 更新前端状态
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
  }

  // 删除项目
  const deleteItem = async (id: string, type: 'memo' | 'common' | string) => {
    try {
      await fetch(`/api/shopping/${id}`, { method: 'DELETE' })
    } catch { /* 静默失败 */ }

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
  }

  // 添加备忘录项目
  const addMemoItem = async () => {
    if (!newItem.name.trim() || !user?.coupleId) return
    try {
      await fetch('/api/shopping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coupleId: user.coupleId,
          date: todayStr,
          items: [{ ...newItem, type: 'memo' }],
        }),
      })
      loadShoppingList()
    } catch { /* 静默失败 */ }
    setNewItem({ name: '', amount: '', category: '蔬菜' })
    setShowAddModal(false)
  }

  // 清除已完成
  const clearCompleted = async () => {
    const checkedIds = [
      ...memoItems.filter(i => i.checked).map(i => i.id),
      ...commonItems.filter(i => i.checked).map(i => i.id),
      ...recipeGroups.flatMap(g => g.items.filter(i => i.checked).map(i => i.id)),
    ]
    // 批量删除
    await Promise.all(checkedIds.map(id => fetch(`/api/shopping/${id}`, { method: 'DELETE' })))
    loadShoppingList()
  }

  // 使用 AI 智能聚合食材
  const generateFromRecipes = async () => {
    if (todayRecipes.length === 0 || !user?.coupleId) return
    setGenerating(true)
    try {
      // 先清除当天已有的 AI 生成数据（保留备忘录）
      const existingIds = [
        ...commonItems.map(i => i.id),
        ...recipeGroups.flatMap(g => g.items.map(i => i.id)),
      ]
      if (existingIds.length > 0) {
        await Promise.all(existingIds.map(id => fetch(`/api/shopping/${id}`, { method: 'DELETE' })))
      }

      // 调用 AI 做智能聚合
      const res = await fetch('/api/ai/shopping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipes: todayRecipes }),
      })

      if (!res.ok) throw new Error('生成失败')
      const data = await res.json()

      // 准备保存到数据库的数据
      const itemsToSave: { name: string; amount: string; category: string; type: string; recipeId?: string; recipeName?: string }[] = []

      // 公共食材
      if (data.common?.length) {
        data.common.forEach((item: { name: string; amount: string; category: string }) => {
          itemsToSave.push({ ...item, type: 'common' })
        })
      }

      // 菜谱专属食材
      if (data.recipes?.length) {
        data.recipes.forEach((r: { recipeId: string; recipeName: string; items: { name: string; amount: string; category: string }[] }) => {
          r.items.forEach(item => {
            itemsToSave.push({ ...item, type: 'recipe', recipeId: r.recipeId, recipeName: r.recipeName })
          })
        })
      }

      // 保存到数据库
      if (itemsToSave.length > 0) {
        await fetch('/api/shopping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coupleId: user.coupleId, date: todayStr, items: itemsToSave }),
        })
        loadShoppingList()
      }

      addToast({ message: '购物清单生成成功', type: 'success' })
    } catch {
      addToast({ message: '生成失败，请重试', type: 'error' })
    } finally {
      setGenerating(false)
    }
  }

  // 统计
  const allItems = [...memoItems, ...commonItems, ...recipeGroups.flatMap(g => g.items)]
  const checkedCount = allItems.filter(i => i.checked).length
  const totalCount = allItems.length

  // 渲染列表项
  const renderItem = (item: ShoppingItem, type: 'memo' | 'common' | string, isLast: boolean) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => toggleItem(item.id, type)}
      className={`flex items-center justify-between p-4 cursor-pointer active:bg-gray-100 transition-all group
        ${!isLast ? 'border-b border-gray-100' : ''} ${item.checked ? 'bg-gray-100/50' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0
          ${item.checked ? 'bg-[#0a0a0a] border-[#0a0a0a]' : 'border-[#d4d4d4]'}`}>
          {item.checked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
        </div>
        <span className={`text-[15px] transition-all ${item.checked ? 'line-through text-[#737373]' : 'text-[#0a0a0a]'}`}>{item.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-[13px] ${item.checked ? 'text-[#a3a3a3]' : 'text-[#737373]'}`}>{item.amount}</span>
        <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id, type) }}
          className="p-1 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <Trash2 className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </motion.div>
  )

  return (
    <AppLayout>
      {/* 头部：日期 + 添加按钮 */}
      <header className="px-6 pt-4 pb-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[#666]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-[28px] font-semibold text-[#0a0a0a]">{today.month}月{today.day}日</h1>
              <p className="text-[13px] text-[#a3a3a3]">{today.weekday} · 买菜清单</p>
            </div>
          </div>
          <button onClick={() => setShowAddModal(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#0a0a0a] text-white active:scale-95 transition-transform">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      <ScrollArea className="px-6">
        {/* 今日菜谱 + AI生成 */}
        {todayRecipes.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-50 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <ChefHat className="w-5 h-5 text-[#666]" />
              <span className="text-[14px] font-medium text-[#0a0a0a]">今日菜谱</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {todayRecipes.map(recipe => (
                <span key={recipe.id} className="px-3 py-1 bg-white rounded-full text-[13px] text-[#0a0a0a]">{recipe.name}</span>
              ))}
            </div>
            <button onClick={generateFromRecipes} disabled={generating}
              className="w-full flex items-center justify-center gap-2 h-10 bg-[#0a0a0a] text-white rounded-xl text-[14px] font-medium active:scale-[0.98] transition-transform disabled:opacity-50">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? '生成中...' : 'AI 生成购物清单'}
            </button>
          </motion.div>
        )}

        {/* 统计 */}
        {totalCount > 0 && (
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] text-[#a3a3a3]">共 {totalCount} 项 · 已完成 {checkedCount} 项</p>
          </div>
        )}

        {/* 公共食材 */}
        {commonItems.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="w-1 h-4 bg-[#0a0a0a] rounded-full" />
              <h3 className="text-[13px] text-[#666] font-medium">公共食材</h3>
              <span className="text-[12px] text-[#a3a3a3]">({commonItems.length})</span>
            </div>
            <div className="bg-gray-50 rounded-2xl overflow-hidden">
              {commonItems.map((item, i) => renderItem(item, 'common', i === commonItems.length - 1))}
            </div>
          </motion.div>
        )}

        {/* 菜谱分组 */}
        {recipeGroups.map((group, gi) => group.items.length > 0 && (
          <motion.div key={group.recipeId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.1 }} className="mb-6">
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="w-1 h-4 bg-[#666] rounded-full" />
              <h3 className="text-[13px] text-[#666] font-medium">{group.recipeName}</h3>
              <span className="text-[12px] text-[#a3a3a3]">({group.items.length})</span>
            </div>
            <div className="bg-gray-50 rounded-2xl overflow-hidden">
              {group.items.map((item, i) => renderItem(item, group.recipeId, i === group.items.length - 1))}
            </div>
          </motion.div>
        ))}

        {/* 备忘录 */}
        {memoItems.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="w-1 h-4 bg-[#a3a3a3] rounded-full" />
              <h3 className="text-[13px] text-[#666] font-medium">备忘录</h3>
              <span className="text-[12px] text-[#a3a3a3]">({memoItems.length})</span>
            </div>
            <div className="bg-gray-50 rounded-2xl overflow-hidden">
              {memoItems.map((item, i) => renderItem(item, 'memo', i === memoItems.length - 1))}
            </div>
          </motion.div>
        )}

        {/* 空状态 */}
        {totalCount === 0 && todayRecipes.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center pt-16">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
              <ChefHat className="w-10 h-10 text-[#a3a3a3]" />
            </div>
            <p className="mt-5 text-[17px] font-medium text-[#0a0a0a]">还没有购物清单</p>
            <p className="mt-1 text-[14px] text-[#a3a3a3]">选择今日菜谱或手动添加</p>
          </motion.div>
        )}

        <div className="h-8" />
      </ScrollArea>

      {/* 添加 Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 z-50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#0a0a0a]">添加到备忘录</h2>
                <button onClick={() => setShowAddModal(false)} className="p-1"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <input type="text" placeholder="物品名称" value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full h-12 px-4 bg-gray-100 rounded-xl text-[15px] placeholder:text-[#a3a3a3] outline-none focus:ring-2 focus:ring-[#0a0a0a]" />
                <input type="text" placeholder="数量，如：2个" value={newItem.amount}
                  onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                  className="w-full h-12 px-4 bg-gray-100 rounded-xl text-[15px] placeholder:text-[#a3a3a3] outline-none focus:ring-2 focus:ring-[#0a0a0a]" />
                <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full h-12 px-4 bg-gray-100 rounded-xl text-[15px] outline-none focus:ring-2 focus:ring-[#0a0a0a]">
                  {defaultCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <button onClick={addMemoItem}
                  className="w-full h-12 bg-[#0a0a0a] text-white rounded-xl text-[15px] font-medium active:scale-[0.98] transition-transform">添加</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 底部操作栏 */}
      <AnimatePresence>
        {checkedCount > 0 && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 z-30 safe-area-bottom">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0a0a0a] flex items-center justify-center">
                  <span className="text-white font-semibold text-[15px]">{checkedCount}</span>
                </div>
                <span className="text-[15px] text-[#0a0a0a]">项已选中</span>
              </div>
              <button onClick={clearCompleted}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0a0a0a] text-white rounded-xl text-[14px] font-medium active:scale-[0.98] transition-transform">
                <Trash2 className="w-4 h-4" />清除已选
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  )
}
