'use client'

import { motion } from 'framer-motion'
import { LogOut, ChevronRight, Heart } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'
import { AppLayout, ScrollArea } from '@/components/layout'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const { signOut } = useAuth()

  const initials = user?.nickname?.slice(0, 2) || '?'

  return (
    <AppLayout>
      <header className="px-6 pt-4 pb-4 shrink-0">
        <h1 className="text-[28px] font-semibold text-[#0a0a0a]">我的</h1>
      </header>

      <ScrollArea className="px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-xl font-semibold text-[#737373]">
            {initials}
          </div>
          <div>
            <h2 className="text-[20px] font-semibold text-[#0a0a0a]">{user?.nickname || '未登录'}</h2>
            <p className="text-[13px] text-[#a3a3a3]">{user?.email}</p>
          </div>
        </motion.div>

        {/* 分组列表 */}
        <div className="bg-gray-50 rounded-2xl overflow-hidden">
          <button className="w-full flex items-center justify-between p-4 border-b border-gray-100 active:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-[#a3a3a3]" />
              <span className="text-[15px] text-[#0a0a0a]">情侣空间</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#a3a3a3]" />
          </button>

          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 p-4 active:bg-gray-100 transition-colors"
          >
            <LogOut className="w-5 h-5 text-[#dc2626]" />
            <span className="text-[15px] text-[#dc2626]">退出登录</span>
          </button>
        </div>
      </ScrollArea>
    </AppLayout>
  )
}
