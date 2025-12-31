# Menu Hub 改进实现代码

本文档包含所有 UI 细节问题的改进代码实现。

---

## 1. 首页改进代码

### 改进 1.1：菜单卡片交互优化

**文件**：`src/app/(main)/home/page.improved.tsx`

```tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, ChefHat, X, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { AppLayout, ScrollArea } from '@/components/layout'

interface MenuItem {
  id: string
  recipe?: { id: string; name: string }
  selectedBy?: { nickname: string }
}

export default function HomePageImproved() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const { user } = useAuthStore()
  const router = useRouter()

  const loadTodayMenu = useCallback(async () => {
    if (!user?.coupleId) return
    try {
      const today = new Date().toISOString().split('T')[0]
      const res = await fetch(`/api/menu?coupleId=${user.coupleId}&date=${today}`)
      if (!res.ok) throw new Error('加载失败')
      const data = await res.json()
      setMenuItems(data?.items || [])
    } catch {
      setMenuItems([])
    } finally {
      setLoading(false)
    }
  }, [user?.coupleId])

  useEffect(() => {
    if (user?.coupleId) loadTodayMenu()
    else setLoading(false)
  }, [user?.coupleId, loadTodayMenu])

  const handleDeleteMenuItem = async (id: string) => {
    try {
      await fetch(`/api/menu/${id}`, { method: 'DELETE' })
      setMenuItems(menuItems.filter(item => item.id !== id))
    } catch (error) {
      console.error('Failed to delete menu item:', error)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 11) return '早上好'
    if (hour < 14) return '中午好'
    if (hour < 18) return '下午好'
    return '晚上好'
  }

  const dateStr = new Date().toLocaleDateString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'long'
  })

  return (
    <AppLayout>
      <header className="px-6 pt-4 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-gray-500">{dateStr}</p>
          <h1 className="text-3xl font-bold text-foreground mt-1">
            {getGreeting()}，{user?.nickname || '你好'}
          </h1>
        </motion.div>
      </header>

      <ScrollArea className="px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">今日菜单</h2>
            {menuItems.length > 0 && (
              <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded-full">
                {menuItems.length} 道菜
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 bg-white rounded-xl animate-pulse" />
              ))}
            </div>
          ) : menuItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="w-20 h-20 mx-auto bg-gradient-to-br from-primary-50 to-primary-100 rounded-full flex items-center justify-center mb-4 shadow-md"
              >
                <ChefHat className="w-10 h-10 text-primary-500" />
              </motion.div>
              <p className="text-base font-semibold text-foreground">今天还没点菜</p>
              <p className="text-sm text-gray-600 mt-1">和 TA 一起选择今天吃什么吧</p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => router.push(`/recipes/${item.recipe?.id}`)}
                  className="flex items-center justify-between p-3 bg-white rounded-xl cursor-pointer hover:bg-gray-50 active:scale-95 transition-all group"
                >
                  <span className="text-base text-foreground group-hover:text-primary-500 transition-colors font-medium">
                    {item.recipe?.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{item.selectedBy?.nickname}</span>
                    {hoveredId === item.id && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteMenuItem(item.id)
                        }}
                        className="p-1 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        <div className="h-24" />
      </ScrollArea>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="fixed left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-200"
        style={{ bottom: 'calc(var(--nav-height) + var(--safe-bottom))' }}
      >
        <Link
          href="/select"
          className="flex items-center justify-center gap-2 w-full h-12 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-base font-semibold hover:shadow-lg active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          点菜
        </Link>
      </motion.div>
    </AppLayout>
  )
}
```

---

## 2. 菜谱列表改进代码

### 改进 2.1：菜品卡片信息完善

**文件**：`src/app/(main)/recipes/page.improved.tsx`

```tsx
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Search, Filter } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { AppLayout, ScrollArea } from '@/components/layout'

interface Recipe {
  id: string
  name: string
  category?: string
  difficulty?: string
  prepTime?: number
  cookTime?: number
  coverImage?: string
}

const categories = ['全部', '家常菜', '川菜', '粤菜', '西餐', '日料', '甜点', '汤羹']

export default function RecipesPageImproved() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('全部')
  const { user } = useAuthStore()

  const loadRecipes = useCallback(async () => {
    if (!user?.coupleId) return
    try {
      const res = await fetch(`/api/recipes?coupleId=${user.coupleId}`)
      if (!res.ok) throw new Error('加载失败')
      setRecipes(await res.json())
    } catch {
      setRecipes([])
    } finally {
      setLoading(false)
    }
  }, [user?.coupleId])

  useEffect(() => {
    if (user?.coupleId) loadRecipes()
    else setLoading(false)
  }, [user?.coupleId, loadRecipes])

  const filteredRecipes = useMemo(() => {
    return recipes
      .filter(r => activeCategory === '全部' || r.category === activeCategory)
      .filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [recipes, activeCategory, searchTerm])

  return (
    <AppLayout>
      <header className="px-6 pt-4 pb-4 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-foreground">菜谱</h1>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/recipes/new" className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-lg transition-shadow">
              <Plus className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>

        {/* 搜索框 */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索菜谱..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-gray-100 rounded-lg text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
          />
        </div>

        {/* 分类筛选 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-foreground hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <ScrollArea className="px-6">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/5] border border-gray-200 rounded-2xl animate-pulse bg-gray-50" />
            ))}
          </div>
        ) : filteredRecipes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center pt-16"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-gradient-to-br from-primary-50 to-primary-100 rounded-full flex items-center justify-center mb-4"
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary-500">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </motion.div>
            <p className="text-lg font-semibold text-foreground">还没有菜谱</p>
            <p className="text-sm text-gray-600 mt-1">添加你们喜欢的菜品吧</p>
            <Link
              href="/recipes/new"
              className="mt-6 h-12 px-8 flex items-center bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-base font-semibold hover:shadow-lg active:scale-95 transition-all"
            >
              添加第一道菜
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-4">
            {filteredRecipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/recipes/${recipe.id}`}>
                  <div className="bg-white rounded-2xl overflow-hidden active:scale-95 transition-transform shadow-sm hover:shadow-md">
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                      {recipe.coverImage ? (
                        <img src={recipe.coverImage} alt={recipe.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      ) : (
                        <span className="text-gray-400">无图</span>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      <p className="font-semibold text-base text-foreground truncate">{recipe.name}</p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 flex-wrap">
                        {recipe.difficulty && (
                          <span className="px-1.5 py-0.5 bg-gray-100 rounded">
                            {recipe.difficulty}
                          </span>
                        )}
                        {recipe.prepTime && recipe.cookTime && (
                          <span className="px-1.5 py-0.5 bg-gray-100 rounded">
                            ⏱ {recipe.prepTime + recipe.cookTime}分钟
                          </span>
                        )}
                        {recipe.category && (
                          <span className="px-1.5 py-0.5 bg-primary-50 text-primary-600 rounded">
                            {recipe.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </ScrollArea>
    </AppLayout>
  )
}
```

---

## 3. 购物清单改进代码

### 改进 3.1：完整的购物清单功能

**文件**：`src/app/(main)/shopping/page.improved.tsx`

```tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Share2, Download, X } from 'lucide-react'
import { AppLayout, ScrollArea } from '@/components/layout'

interface ShoppingItem {
  id: string
  name: string
  qty: string
  checked: boolean
  category: string
}

const defaultCategories = ['蔬菜', '肉类', '蛋奶', '调味料', '其他']

export default function ShoppingListPageImproved() {
  const [items, setItems] = useState<ShoppingItem[]>([
    { id: '1', name: '西兰花', qty: '1颗', checked: false, category: '蔬菜' },
    { id: '2', name: '胡萝卜', qty: '2根', checked: true, category: '蔬菜' },
    { id: '3', name: '猪排', qty: '300g', checked: false, category: '肉类' },
    { id: '4', name: '鸡蛋', qty: '6个', checked: false, category: '蛋奶' },
  ])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', qty: '', category: '蔬菜' })

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, ShoppingItem[]>)

  const toggleItem = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
  }

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const addItem = () => {
    if (!newItem.name.trim()) return
    setItems([...items, {
      id: Date.now().toString(),
      ...newItem,
      checked: false
    }])
    setNewItem({ name: '', qty: '', category: '蔬菜' })
    setShowAddModal(false)
  }

  const clearCompleted = () => {
    setItems(items.filter(item => !item.checked))
  }

  const checkedCount = items.filter(i => i.checked).length

  return (
    <AppLayout>
      <header className="px-6 pt-4 pb-4 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-foreground">买菜清单</h1>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-lg transition-shadow"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {checkedCount}/{items.length} 已完成
          </p>
          {checkedCount > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={clearCompleted}
              className="text-xs text-primary-500 hover:text-primary-600 font-medium"
            >
              清空已完成
            </motion.button>
          )}
        </div>
      </header>

      <ScrollArea className="px-6">
        {Object.entries(groupedItems).map(([category, list], categoryIndex) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.08 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full" />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                {category}
              </h3>
              <span className="text-xs text-gray-400 ml-auto">{list.length} 项</span>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {list.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: categoryIndex * 0.08 + index * 0.05 }}
                  className={`flex items-center justify-between p-4 active:bg-gray-50 transition-colors group
                    ${index < list.length - 1 ? 'border-b border-gray-100' : ''}
                    ${item.checked ? 'opacity-60' : ''}
                  `}
                >
                  <label className="flex items-center gap-3 flex-1 cursor-pointer">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      onClick={() => toggleItem(item.id)}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0
                        ${item.checked
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 border-primary-600'
                          : 'border-gray-300 hover:border-primary-500'}
                      `}
                    >
                      {item.checked && (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </motion.svg>
                      )}
                    </motion.div>
                    <div className="flex-1">
                      <span className={`text-base ${item.checked ? 'line-through text-gray-400' : 'text-foreground'}`}>
                        {item.name}
                      </span>
                    </div>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{item.qty}</span>
                    <motion.button
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      onClick={() => deleteItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}

        <div className="h-8" />
      </ScrollArea>

      {/* 添加项目 Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 z-50"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">添加购物项</h2>
                <button onClick={() => setShowAddModal(false)} className="p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="物品名称"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full h-12 px-4 bg-gray-100 rounded-xl text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                />

                <input
                  type="text"
                  placeholder="数量，如：2个"
                  value={newItem.qty}
                  onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })}
                  className="w-full h-12 px-4 bg-gray-100 rounded-xl text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                />

                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full h-12 px-4 bg-gray-100 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                >
                  {defaultCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <button
                  onClick={addItem}
                  className="w-full h-12 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-base font-semibold hover:shadow-lg active:scale-95 transition-all"
                >
                  添加
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  )
}
```

---

## 4. 个人资料改进代码

### 改进 4.1：优化头部和菜单

**文件**：`src/app/(main)/profile/page.improved.tsx`

```tsx
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { LogOut, ChevronRight, Heart, Settings, HelpCircle, MessageSquare } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'
import { AppLayout, ScrollArea } from '@/components/layout'

export default function ProfilePageImproved() {
  const { user } = useAuthStore()
  const { signOut } = useAuth()

  const initials = user?.nickname?.slice(0, 2) || '?'

  const menuItems = [
    { icon: Heart, label: '情侣空间', href: '/couple-space', color: 'text-red-500' },
    { icon: MessageSquare, label: '消息', href: '/messages', color: 'text-blue-500' },
    { icon: Settings, label: '设置', href: '/settings', color: 'text-gray-600' },
    { icon: HelpCircle, label: '帮助与反馈', href: '/help', color: 'text-orange-500' },
  ]

  return (
    <AppLayout>
      <header className="px-6 pt-4 pb-4 shrink-0">
        <h1 className="text-3xl font-bold text-foreground">我的</h1>
      </header>

      <ScrollArea className="px-6">
        {/* 用户卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 mb-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl shadow-sm"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg"
          >
            {initials}
          </motion.div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">{user?.nickname || '未登录'}</h2>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
        </motion.div>

        {/* 菜单列表 */}
        <div className="space-y-4 mb-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={item.href}>
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl hover:bg-gray-50 active:scale-95 transition-all shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <span className="text-base font-medium text-foreground">{item.label}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* 退出登录 */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: menuItems.length * 0.05 }}
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 active:scale-95 transition-all font-medium"
        >
          <LogOut className="w-5 h-5" />
          退出登录
        </motion.button>
      </ScrollArea>
    </AppLayout>
  )
}
```

---

## 5. 全局样式改进

### 改进 5.1：完整的设计系统

**文件**：`src/app/globals.improved.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* 颜色系统 */
  --color-primary: #FF6B6B;
  --color-primary-dark: #FF5252;
  --color-foreground: #0a0a0a;
  --color-text-muted: #666666;
  --color-text-subtle: #999999;
  --color-bg: #ffffff;
  --color-bg-secondary: #FAFAFA;
  --color-border: #E5E5E5;
  --color-success: #4CAF50;
  --color-warning: #FF9800;
  --color-error: #F44336;
  
  /* 间距系统 */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 20px;
  --space-2xl: 24px;
  --space-3xl: 32px;
  
  /* 圆角系统 */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  --radius-full: 9999px;
  
  /* 阴影系统 */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  
  /* 其他 */
  --nav-height: 64px;
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-top: env(safe-area-inset-top, 0px);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  height: 100%;
  -webkit-font-smoothing: antialiased;
}

body {
  min-height: 100%;
  color: var(--color-foreground);
  background: var(--color-bg);
  font-family: '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'PingFang SC', sans-serif;
  font-size: 15px;
  line-height: 1.5;
  -webkit-tap-highlight-color: transparent;
  overflow-x: hidden;
}

/* 工具类 */
@layer components {
  .card {
    @apply bg-white rounded-2xl p-4 shadow-sm;
  }
  
  .card-hover {
    @apply card hover:shadow-md transition-shadow;
  }
  
  .btn-primary {
    @apply h-12 px-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:shadow-lg active:scale-95 transition-all;
  }
  
  .btn-secondary {
    @apply h-12 px-6 bg-gray-100 text-foreground rounded-xl font-semibold hover:bg-gray-200 active:scale-95 transition-all;
  }
  
  .input-base {
    @apply w-full h-12 px-4 bg-gray-100 rounded-xl text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all;
  }
}
```

---

## 📋 实现检查清单

- [ ] 首页改进 (菜单卡片交互)
- [ ] 菜谱列表改进 (搜索/筛选/菜品卡片)
- [ ] 购物清单改进 (添加/编辑/删除)
- [ ] 个人资料改进 (菜单优化)
- [ ] 全局样式改进 (设计系统)

---

## 🚀 快速开始

1. 复制改进的代码到对应的文件
2. 验证 TypeScript 类型
3. 测试所有功能
4. 提交更改

**预计时间：2-3 小时**

