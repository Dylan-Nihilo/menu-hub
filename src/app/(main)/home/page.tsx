'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, ChefHat, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { AppLayout, ScrollArea } from '@/components/layout'

interface MenuItem {
  id: string
  recipe?: { id: string; name: string }
  selectedBy?: { nickname: string }
}

export default function HomePage() {
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
    setMenuItems(menuItems.filter(item => item.id !== id))
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
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#FFF5F5] to-[#FFE5E5] rounded-full flex items-center justify-center mb-4 shadow-sm">
                <ChefHat className="w-10 h-10 text-[#FF6B6B]" />
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
                        className="p-1 hover:bg-red-50 rounded-lg"
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
          className="flex items-center justify-center gap-2 w-full h-[48px] bg-[#FF6B6B] text-white rounded-xl text-[15px] font-medium active:scale-[0.98] transition-transform shadow-lg"
        >
          <Plus className="w-5 h-5" />
          点菜
        </Link>
      </motion.div>
    </AppLayout>
  )
}
