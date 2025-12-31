'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, ChefHat } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { AppLayout, ScrollArea } from '@/components/layout'

interface MenuItem {
  id: string
  recipe?: { name: string }
  selectedBy?: { nickname: string }
}

export default function HomePage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()

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
              <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center mb-4">
                <ChefHat className="w-8 h-8 text-[#a3a3a3]" />
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
                  className="flex items-center justify-between p-3 bg-white rounded-xl"
                >
                  <span className="text-[15px] text-[#0a0a0a]">{item.recipe?.name}</span>
                  <span className="text-[13px] text-[#a3a3a3]">{item.selectedBy?.nickname}</span>
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
        className="absolute bottom-[calc(var(--nav-height)+var(--safe-bottom)+16px)] left-6 right-6"
      >
        <Link
          href="/select"
          className="flex items-center justify-center gap-2 w-full h-[48px] bg-[#0a0a0a] text-white rounded-xl text-[15px] font-medium active:scale-[0.98] transition-transform"
        >
          <Plus className="w-5 h-5" />
          点菜
        </Link>
      </motion.div>
    </AppLayout>
  )
}
