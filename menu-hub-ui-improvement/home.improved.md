'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, ChefHat, Calendar, Users } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { AppLayout, ScrollArea } from '@/components/layout'
import { Button } from '@/components/ui'

interface MenuItem {
  id: string
  recipe?: { name: string }
  selectedBy?: { nickname: string }
}

export default function HomePageImproved() {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <AppLayout>
      {/* 头部问候 */}
      <header className="px-lg pt-lg pb-lg">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-sm text-neutral-500">{dateStr}</p>
          <h1 className="text-3xl font-bold text-neutral-900 mt-md">
            {getGreeting()}，{user?.nickname || '你好'}
          </h1>
        </motion.div>
      </header>

      <ScrollArea className="px-lg">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-lg"
        >
          {/* 快速操作卡片 */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-md">
            <Link href="/select">
              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="p-lg bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl border border-primary-200 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-500 text-white flex items-center justify-center mb-md">
                  <Plus className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-neutral-900">点菜</p>
                <p className="text-xs text-neutral-600 mt-xs">选择今天吃什么</p>
              </motion.div>
            </Link>

            <Link href="/recipes">
              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="p-lg bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl border border-neutral-200 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-neutral-900 text-white flex items-center justify-center mb-md">
                  <ChefHat className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-neutral-900">菜谱</p>
                <p className="text-xs text-neutral-600 mt-xs">查看菜谱库</p>
              </motion.div>
            </Link>
          </motion.div>

          {/* 今日菜单卡片 */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl border border-neutral-200 overflow-hidden"
          >
            <div className="p-lg border-b border-neutral-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-md">
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-neutral-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-neutral-900">今日菜单</h2>
                    <p className="text-xs text-neutral-500 mt-xs">
                      {menuItems.length > 0 ? `${menuItems.length} 道菜` : '还没点菜'}
                    </p>
                  </div>
                </div>
                {menuItems.length > 0 && (
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-500">{menuItems.length}</p>
                    <p className="text-xs text-neutral-500">道</p>
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="p-lg space-y-md">
                {[1, 2].map((i) => (
                  <div key={i} className="h-14 bg-neutral-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : menuItems.length === 0 ? (
              <div className="py-2xl text-center">
                <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-full flex items-center justify-center mb-lg">
                  <ChefHat className="w-8 h-8 text-neutral-400" />
                </div>
                <p className="text-base font-semibold text-neutral-900">今天还没点菜</p>
                <p className="text-sm text-neutral-500 mt-md">和 TA 一起选择今天吃什么吧</p>
                <Link href="/select" className="mt-lg inline-block">
                  <Button size="md">现在点菜</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-lg flex items-center justify-between hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center gap-md flex-1">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-600">
                        {index + 1}
                      </div>
                      <span className="text-base text-neutral-900 font-medium">{item.recipe?.name}</span>
                    </div>
                    <span className="text-sm text-neutral-500 flex-shrink-0 ml-md">
                      {item.selectedBy?.nickname}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* 统计卡片 */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-md">
            <div className="p-lg bg-neutral-50 rounded-2xl border border-neutral-200">
              <p className="text-xs text-neutral-600 font-medium">本周菜品</p>
              <p className="text-2xl font-bold text-neutral-900 mt-md">12 道</p>
            </div>
            <div className="p-lg bg-neutral-50 rounded-2xl border border-neutral-200">
              <div className="flex items-center gap-xs">
                <Users className="w-4 h-4 text-neutral-600" />
                <p className="text-xs text-neutral-600 font-medium">配对状态</p>
              </div>
              <p className="text-sm font-semibold text-neutral-900 mt-md">已配对</p>
            </div>
          </motion.div>

          {/* 底部留白 */}
          <div className="h-2xl" />
        </motion.div>
      </ScrollArea>

      {/* 底部浮动按钮 - 仅在有菜单时显示 */}
      {menuItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="fixed bottom-[calc(var(--nav-height)+var(--safe-bottom)+16px)] left-lg right-lg"
        >
          <Button fullWidth size="lg" icon={<Plus className="w-5 h-5" />}>
            继续点菜
          </Button>
        </motion.div>
      )}
    </AppLayout>
  )
}

/* 
改进说明：

1. **色彩系统**
   - 使用新的 primary-500 (温暖红色) 替代纯黑色
   - 添加渐变背景增加视觉层次
   - 使用 neutral 色系替代硬编码的灰度值

2. **排版和间距**
   - 使用 Tailwind 的 size tokens (lg, md, xs) 替代硬编码的 px 值
   - 统一的间距系统提高一致性
   - 改进的字体大小和权重

3. **组件增强**
   - 添加快速操作卡片
   - 改进的菜单展示（添加编号、统计信息）
   - 添加统计卡片展示配对状态
   - 改进的空状态设计

4. **交互改进**
   - 卡片 hover 效果更明显
   - 动画更流畅自然
   - 改进的加载状态

5. **情感化设计**
   - 使用温暖的颜色搭配
   - 更友好的文案
   - 更多的视觉反馈

6. **响应式设计**
   - 使用网格布局
   - 更好的移动端适配
*/
