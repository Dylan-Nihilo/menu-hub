'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, AlertTriangle, Link as LinkIcon } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

export default function CoupleSettingsPage() {
  const router = useRouter()
  const { user, setUser } = useAuthStore()
  const [partner, setPartner] = useState<{ nickname: string } | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [unlinking, setUnlinking] = useState(false)

  const loadPartner = useCallback(async () => {
    if (!user?.coupleId) return
    try {
      const res = await fetch(`/api/couple/${user.coupleId}`)
      if (res.ok) {
        const data = await res.json()
        const partnerUser = data.users?.find((u: { id: string }) => u.id !== user.id)
        if (partnerUser) setPartner({ nickname: partnerUser.nickname })
      }
    } catch {
      // 静默失败
    }
  }, [user?.coupleId, user?.id])

  useEffect(() => {
    loadPartner()
  }, [loadPartner])

  const handleUnlink = async () => {
    if (!user?.coupleId) return
    setUnlinking(true)
    try {
      const res = await fetch(`/api/couple/${user.coupleId}`, { method: 'DELETE' })
      if (res.ok) {
        setUser({ ...user, coupleId: null })
        router.push('/profile')
      }
    } catch {
      // 静默失败
    } finally {
      setUnlinking(false)
      setShowConfirm(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center gap-4 px-4 py-3 border-b border-gray-100">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-[#0a0a0a]" />
        </button>
        <h1 className="text-[17px] font-semibold text-[#0a0a0a]">情侣管理</h1>
      </header>

      <div className="p-6">
        {user?.coupleId ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 rounded-2xl p-4 mb-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-[#666]" />
                <span className="text-[15px] font-medium text-[#0a0a0a]">当前配对</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[14px] text-[#666]">我的伴侣</span>
                <span className="text-[15px] font-medium text-[#0a0a0a]">{partner?.nickname || '加载中...'}</span>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => setShowConfirm(true)}
              className="w-full h-12 bg-gray-100 text-[#666] rounded-xl text-[15px] font-medium active:scale-[0.98] transition-transform"
            >
              解除配对
            </motion.button>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <LinkIcon className="w-12 h-12 mx-auto mb-4 text-[#a3a3a3]" />
            <p className="text-[15px] text-[#666] mb-6">还没有配对</p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/pair/create')}
                className="flex-1 h-12 bg-[#0a0a0a] text-white rounded-xl text-[15px] font-medium active:scale-[0.98]"
              >
                创建配对
              </button>
              <button
                onClick={() => router.push('/pair/join')}
                className="flex-1 h-12 bg-gray-100 text-[#0a0a0a] rounded-xl text-[15px] font-medium active:scale-[0.98]"
              >
                加入配对
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* 确认弹窗 */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-[#0a0a0a]" />
              <h3 className="text-[17px] font-semibold text-[#0a0a0a]">确认解除配对？</h3>
            </div>
            <p className="text-[14px] text-[#666] mb-6">
              解除后，你们的共享菜谱和菜单记录将保留，但无法再共同管理。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 h-11 bg-gray-100 text-[#0a0a0a] rounded-xl text-[14px] font-medium"
              >
                取消
              </button>
              <button
                onClick={handleUnlink}
                disabled={unlinking}
                className="flex-1 h-11 bg-[#0a0a0a] text-white rounded-xl text-[14px] font-medium disabled:opacity-50"
              >
                {unlinking ? '解除中...' : '确认解除'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
