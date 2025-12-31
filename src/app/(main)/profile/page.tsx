'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { LogOut, ChevronRight, Heart, Settings, HelpCircle, MessageSquare } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'
import { AppLayout, ScrollArea } from '@/components/layout'

export default function ProfilePage() {
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
        <h1 className="text-[28px] font-semibold text-[#0a0a0a]">我的</h1>
      </header>

      <ScrollArea className="px-6">
        {/* 用户卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 mb-6 bg-gradient-to-br from-[#FFF5F5] to-[#FFE5E5] rounded-2xl"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#FF5252] flex items-center justify-center text-xl font-bold text-white shadow-lg">
            {initials}
          </div>
          <div className="flex-1">
            <h2 className="text-[18px] font-semibold text-[#0a0a0a]">{user?.nickname || '未登录'}</h2>
            <p className="text-[13px] text-[#666]">{user?.email}</p>
          </div>
        </motion.div>

        {/* 菜单列表 */}
        <div className="space-y-3 mb-6">
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
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <span className="text-[15px] font-medium text-[#0a0a0a]">{item.label}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#a3a3a3]" />
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
          className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 active:scale-[0.98] transition-all font-medium"
        >
          <LogOut className="w-5 h-5" />
          退出登录
        </motion.button>
      </ScrollArea>
    </AppLayout>
  )
}
