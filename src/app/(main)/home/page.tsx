'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChefHat, Trash2, Shuffle, Sparkles, Flame, Leaf, Beef, Fish, Zap, Home } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { AppLayout, ScrollArea } from '@/components/layout'

interface MenuItem {
  id: string
  recipe?: { id: string; name: string; category?: string }
  selectedBy?: { nickname: string }
}

interface Recipe {
  id: string
  name: string
  category?: string
  cookTime?: number
}

// 口味标签
const moodTags = [
  { id: 'spicy', label: '想吃辣', icon: Flame },
  { id: 'light', label: '清淡', icon: Leaf },
  { id: 'meat', label: '想吃肉', icon: Beef },
  { id: 'seafood', label: '海鲜', icon: Fish },
  { id: 'quick', label: '快手菜', icon: Zap },
  { id: 'comfort', label: '家常', icon: Home },
]

export default function HomePage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [weekMenus, setWeekMenus] = useState<Record<string, MenuItem[]>>({})
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [randomRecipe, setRandomRecipe] = useState<Recipe | null>(null)
  const [selectedMoods, setSelectedMoods] = useState<string[]>([])
  const [isSpinning, setIsSpinning] = useState(false)
  const { user } = useAuthStore()
  const router = useRouter()

  const loadTodayMenu = useCallback(async (date: Date) => {
    if (!user?.coupleId) return
    try {
      const dateStr = date.toISOString().split('T')[0]
      const res = await fetch(`/api/menu?coupleId=${user.coupleId}&date=${dateStr}`)
      if (!res.ok) throw new Error('加载失败')
      const data = await res.json()
      setMenuItems(data?.items || [])
      setWeekMenus(prev => ({ ...prev, [dateStr]: data?.items || [] }))
    } catch {
      setMenuItems([])
    } finally {
      setLoading(false)
    }
  }, [user?.coupleId])

  // 加载食谱库
  const loadRecipes = useCallback(async () => {
    if (!user?.coupleId) return
    try {
      const res = await fetch(`/api/recipes?coupleId=${user.coupleId}`)
      if (res.ok) {
        const data = await res.json()
        setRecipes(Array.isArray(data) ? data : [])
      }
    } catch {
      // 静默失败
    }
  }, [user?.coupleId])

  useEffect(() => {
    if (user?.coupleId) {
      loadTodayMenu(selectedDate)
      loadRecipes()
    } else {
      setLoading(false)
    }
  }, [user?.coupleId, loadTodayMenu, loadRecipes, selectedDate])

  const handleDeleteMenuItem = async (id: string) => {
    try {
      const res = await fetch(`/api/menu/item/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMenuItems(menuItems.filter(item => item.id !== id))
      }
    } catch { /* 静默失败 */ }
  }

  // 生成一周日期
  const getWeekDays = () => {
    const today = new Date()
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      days.push(date)
    }
    return days
  }

  // 随机推荐
  const handleRandomPick = () => {
    if (recipes.length === 0) return
    setIsSpinning(true)
    // 模拟转动效果
    let count = 0
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * recipes.length)
      setRandomRecipe(recipes[randomIndex])
      count++
      if (count > 10) {
        clearInterval(interval)
        setIsSpinning(false)
      }
    }, 100)
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

  const dateStr = new Date().toLocaleDateString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'long'
  })

  return (
    <AppLayout>
      {/* 头部问候 */}
      <header className="px-6 pt-4 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-[14px] text-[#a3a3a3]">{dateStr}</p>
          <h1 className="text-[28px] font-semibold text-[#0a0a0a] mt-1">
            {getGreeting()}，{user?.nickname || '你好'}
          </h1>
        </motion.div>
      </header>

      <ScrollArea className="px-6">
        {/* 星期日历 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {getWeekDays().map((date, index) => {
              const isSelected = date.toDateString() === selectedDate.toDateString()
              const isToday = date.toDateString() === new Date().toDateString()
              const dateKey = date.toISOString().split('T')[0]
              const hasMenu = (weekMenus[dateKey]?.length || 0) > 0

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`flex-shrink-0 w-12 py-2 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-[#0a0a0a] text-white'
                      : 'bg-gray-50 text-[#0a0a0a] active:scale-95'
                  }`}
                >
                  <p className={`text-[11px] ${isSelected ? 'text-white/70' : 'text-[#a3a3a3]'}`}>
                    {['日', '一', '二', '三', '四', '五', '六'][date.getDay()]}
                  </p>
                  <p className={`text-[17px] font-semibold ${isToday && !isSelected ? 'text-[#0a0a0a]' : ''}`}>
                    {date.getDate()}
                  </p>
                  {hasMenu && (
                    <div className={`w-1 h-1 rounded-full mx-auto mt-1 ${isSelected ? 'bg-white' : 'bg-[#0a0a0a]'}`} />
                  )}
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* 今日菜单卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-50 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-medium text-[#0a0a0a]">今日菜单</h2>
            {menuItems.length > 0 && (
              <span className="text-[13px] text-[#a3a3a3]">{menuItems.length} 道菜</span>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 bg-white rounded-xl animate-pulse" />
              ))}
            </div>
          ) : menuItems.length === 0 ? (
            <div className="py-8 text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#F5F5F5] to-[#EEEEEE] rounded-full flex items-center justify-center mb-4 shadow-sm">
                <ChefHat className="w-10 h-10 text-[#0a0a0a]" />
              </div>
              <p className="text-[15px] font-medium text-[#0a0a0a]">今天还没点菜</p>
              <p className="text-[13px] text-[#a3a3a3] mt-1">和 TA 一起选择今天吃什么吧</p>
            </div>
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
                  className="flex items-center justify-between p-3 bg-white rounded-xl cursor-pointer hover:bg-gray-50 active:scale-[0.98] transition-all"
                >
                  <span className="text-[15px] text-[#0a0a0a] font-medium">{item.recipe?.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-[#a3a3a3]">{item.selectedBy?.nickname}</span>
                    {hoveredId === item.id && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteMenuItem(item.id)
                        }}
                        className="p-1 hover:bg-gray-100 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* 心情口味 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-4"
        >
          <h3 className="text-[13px] text-[#666] font-medium mb-2">今天想吃</h3>
          <div className="flex flex-wrap gap-2">
            {moodTags.map(tag => {
              const Icon = tag.icon
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleMood(tag.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] transition-all active:scale-95 ${
                    selectedMoods.includes(tag.id)
                      ? 'bg-[#0a0a0a] text-white'
                      : 'bg-gray-100 text-[#666]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tag.label}
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* 随机推荐 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 bg-gray-50 rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] text-[#666] font-medium">今天吃什么？</h3>
            <button
              onClick={handleRandomPick}
              disabled={recipes.length === 0 || isSpinning}
              className="flex items-center gap-1 text-[13px] text-[#0a0a0a] font-medium disabled:opacity-50"
            >
              <Shuffle className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
              换一个
            </button>
          </div>

          <AnimatePresence mode="wait">
            {randomRecipe ? (
              <motion.div
                key={randomRecipe.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => router.push(`/recipes/${randomRecipe.id}`)}
                className="bg-white rounded-xl p-4 cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[17px] font-semibold text-[#0a0a0a]">{randomRecipe.name}</p>
                    {randomRecipe.category && (
                      <p className="text-[13px] text-[#a3a3a3] mt-1">{randomRecipe.category}</p>
                    )}
                  </div>
                  <Sparkles className="w-5 h-5 text-[#a3a3a3]" />
                </div>
              </motion.div>
            ) : (
              <button
                onClick={handleRandomPick}
                disabled={recipes.length === 0}
                className="w-full py-6 text-center text-[#a3a3a3] text-[14px] disabled:opacity-50"
              >
                {recipes.length === 0 ? '还没有食谱' : '点击随机推荐一道菜'}
              </button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 底部留白 */}
        <div className="h-24" />
      </ScrollArea>

      {/* 底部固定按钮 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="fixed left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100"
        style={{ bottom: 'calc(var(--nav-height) + var(--safe-bottom))' }}
      >
        <Link
          href="/select"
          className="flex items-center justify-center gap-2 w-full h-[48px] bg-[#0a0a0a] text-white rounded-xl text-[15px] font-medium active:scale-[0.98] transition-transform shadow-lg"
        >
          <Plus className="w-5 h-5" />
          点菜
        </Link>
      </motion.div>
    </AppLayout>
  )
}
