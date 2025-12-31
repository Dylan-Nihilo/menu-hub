'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  LogOut, ChevronRight, Settings, HelpCircle,
  ChefHat, BookOpen, Calendar, Users, Copy, Check,
  User, Lock, Heart, UtensilsCrossed, Unlink
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'
import { AppLayout, ScrollArea } from '@/components/layout'

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const { signOut } = useAuth()
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState({ menuCount: 0, recipeCount: 0, daysUsed: 0 })
  const [partner, setPartner] = useState<{ nickname: string } | null>(null)
  const [coupleInfo, setCoupleInfo] = useState<{ createdAt: string; pairCode: string } | null>(null)
  const [preferences, setPreferences] = useState<{ allergens: string[]; dislikes: string[] }>({ allergens: [], dislikes: [] })
  const [unlinking, setUnlinking] = useState(false)

  // 解除配对
  const handleUnlink = async () => {
    if (!user?.coupleId || !confirm('确定要解除配对吗？')) return
    setUnlinking(true)
    try {
      const res = await fetch(`/api/couple/${user.coupleId}`, { method: 'DELETE' })
      if (res.ok) {
        setUser({ ...user, coupleId: null })
        setPartner(null)
        setCoupleInfo(null)
      }
    } catch {
      // 静默失败
    } finally {
      setUnlinking(false)
    }
  }

  // 获取统计数据
  const loadStats = useCallback(async () => {
    if (!user?.coupleId) return
    try {
      const [menuRes, recipeRes] = await Promise.all([
        fetch(`/api/menu/stats?coupleId=${user.coupleId}`),
        fetch(`/api/recipes?coupleId=${user.coupleId}`)
      ])
      const recipes = await recipeRes.json()
      const menuStats = menuRes.ok ? await menuRes.json() : { count: 0 }

      // 计算使用天数
      const createdAt = user.createdAt ? new Date(user.createdAt) : new Date()
      const daysUsed = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)) + 1

      setStats({
        menuCount: menuStats.count || 0,
        recipeCount: Array.isArray(recipes) ? recipes.length : 0,
        daysUsed
      })
    } catch {
      // 静默失败
    }
  }, [user?.coupleId, user?.createdAt])

  // 获取情侣信息
  const loadCoupleInfo = useCallback(async () => {
    if (!user?.coupleId) return
    try {
      const res = await fetch(`/api/couple/${user.coupleId}`)
      if (res.ok) {
        const data = await res.json()
        setCoupleInfo({ createdAt: data.createdAt, pairCode: data.pairCode })
        // 找到伴侣
        const partnerUser = data.users?.find((u: { id: string }) => u.id !== user.id)
        if (partnerUser) setPartner({ nickname: partnerUser.nickname })
      }
    } catch {
      // 静默失败
    }
  }, [user?.coupleId, user?.id])

  useEffect(() => {
    loadStats()
    loadCoupleInfo()
    // 加载偏好设置
    if (user?.id) {
      const saved = localStorage.getItem(`preferences_${user.id}`)
      if (saved) {
        setPreferences(JSON.parse(saved))
      }
    }
  }, [loadStats, loadCoupleInfo, user?.id])

  // 复制配对码
  const copyPairCode = () => {
    if (coupleInfo?.pairCode) {
      navigator.clipboard.writeText(coupleInfo.pairCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // 计算在一起的天数
  const daysTogether = coupleInfo?.createdAt
    ? Math.floor((Date.now() - new Date(coupleInfo.createdAt).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0

  const initials = user?.nickname?.slice(0, 2) || '?'
  const partnerInitials = partner?.nickname?.slice(0, 2) || '?'

  const menuItems = [
    { icon: User, label: '个人资料', href: '/settings/profile' },
    { icon: Lock, label: '修改密码', href: '/settings/password' },
    { icon: UtensilsCrossed, label: '口味偏好', href: '/settings/preferences' },
    { icon: HelpCircle, label: '帮助与反馈', href: '/help' },
  ]

  return (
    <AppLayout>
      <header className="px-6 pt-4 pb-4 shrink-0">
        <h1 className="text-[28px] font-semibold text-[#0a0a0a]">我的</h1>
      </header>

      <ScrollArea className="px-6">
        {/* 配对状态卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 mb-6 bg-gray-50 rounded-2xl"
        >
          {user?.coupleId && partner ? (
            /* 已配对：重叠头像 + 天数 + 偏好标签 */
            <div>
              {/* 上半部分：头像 + 天数 */}
              <div className="flex items-center justify-between">
                {/* 左侧：重叠头像 */}
                <div className="flex items-center">
                  <div className="relative flex items-center">
                    <div className="w-12 h-12 rounded-full bg-[#0a0a0a] flex items-center justify-center text-[15px] font-bold text-white z-10">
                      {initials}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#666] flex items-center justify-center text-[15px] font-bold text-white -ml-4 border-2 border-gray-50">
                      {partnerInitials}
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-[15px] font-medium text-[#0a0a0a]">{user?.nickname} & {partner.nickname}</p>
                    <p className="text-[12px] text-[#a3a3a3]">已配对</p>
                  </div>
                </div>
                {/* 右侧：在一起天数 */}
                <div className="text-right">
                  <p className="text-[24px] font-bold text-[#0a0a0a]">{daysTogether}</p>
                  <p className="text-[12px] text-[#a3a3a3]">天</p>
                </div>
              </div>

              {/* 下半部分：偏好标签 */}
              {(preferences.allergens.length > 0 || preferences.dislikes.length > 0) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 flex-wrap">
                    {(() => {
                      const allTags = [
                        ...preferences.allergens.map(t => ({ label: t, type: 'allergen' })),
                        ...preferences.dislikes.map(t => ({ label: t, type: 'dislike' }))
                      ]
                      const maxShow = 4
                      const showTags = allTags.slice(0, maxShow)
                      const remaining = allTags.length - maxShow

                      return (
                        <>
                          {showTags.map((tag, i) => (
                            <span
                              key={i}
                              className={`px-2.5 py-1 rounded-full text-[12px] ${
                                tag.type === 'allergen'
                                  ? 'bg-[#0a0a0a] text-white'
                                  : 'bg-gray-200 text-[#666]'
                              }`}
                            >
                              {tag.type === 'allergen' ? '⚠️ ' : ''}{tag.label}
                            </span>
                          ))}
                          {remaining > 0 && (
                            <span className="px-2.5 py-1 rounded-full text-[12px] bg-gray-100 text-[#a3a3a3]">
                              +{remaining}
                            </span>
                          )}
                        </>
                      )
                    })()}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* 未配对：显示配对入口 */
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#0a0a0a] flex items-center justify-center text-xl font-bold text-white mx-auto">
                {initials}
              </div>
              <h2 className="text-[18px] font-semibold text-[#0a0a0a] mt-3">{user?.nickname || '未登录'}</h2>
              <p className="text-[13px] text-[#666]">{user?.email}</p>
              <div className="flex gap-3 mt-4">
                <Link href="/pair/create" className="flex-1 h-10 bg-[#0a0a0a] text-white rounded-xl text-[14px] font-medium flex items-center justify-center active:scale-[0.98]">
                  创建配对
                </Link>
                <Link href="/pair/join" className="flex-1 h-10 bg-white text-[#0a0a0a] rounded-xl text-[14px] font-medium flex items-center justify-center active:scale-[0.98]">
                  加入配对
                </Link>
              </div>
            </div>
          )}
        </motion.div>

        {/* 统计数据卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <ChefHat className="w-6 h-6 mx-auto mb-2 text-[#666]" />
            <p className="text-[20px] font-bold text-[#0a0a0a]">{stats.menuCount}</p>
            <p className="text-[12px] text-[#666]">做菜次数</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <BookOpen className="w-6 h-6 mx-auto mb-2 text-[#666]" />
            <p className="text-[20px] font-bold text-[#0a0a0a]">{stats.recipeCount}</p>
            <p className="text-[12px] text-[#666]">菜谱数量</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-[#666]" />
            <p className="text-[20px] font-bold text-[#0a0a0a]">{stats.daysUsed}</p>
            <p className="text-[12px] text-[#666]">使用天数</p>
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
                        <Icon className="w-5 h-5 text-[#666]" />
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

        {/* 底部操作按钮 */}
        <div className="flex gap-3 mb-6">
          {user?.coupleId && (
            <button
              onClick={handleUnlink}
              disabled={unlinking}
              className="flex-1 flex items-center justify-center gap-2 p-4 bg-gray-100 text-[#666] rounded-xl active:scale-[0.98] transition-all font-medium disabled:opacity-50"
            >
              <Unlink className="w-5 h-5" />
              {unlinking ? '解除中...' : '解除关系'}
            </button>
          )}
          <button
            onClick={signOut}
            className={`${user?.coupleId ? 'flex-1' : 'w-full'} flex items-center justify-center gap-2 p-4 bg-red-50 text-red-500 rounded-xl active:scale-[0.98] transition-all font-medium`}
          >
            <LogOut className="w-5 h-5" />
            退出登录
          </button>
        </div>

        {/* 版本信息 */}
        <div className="text-center pb-8">
          <p className="text-[12px] text-[#a3a3a3]">Menu Hub v1.0.0</p>
        </div>
      </ScrollArea>
    </AppLayout>
  )
}
