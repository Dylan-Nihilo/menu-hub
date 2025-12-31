'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, User } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

export default function ProfileSettingsPage() {
  const router = useRouter()
  const { user, setUser } = useAuthStore()
  const [nickname, setNickname] = useState(user?.nickname || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!nickname.trim() || !user) return
    setSaving(true)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nickname.trim() })
      })
      if (res.ok) {
        setUser({ ...user, nickname: nickname.trim() })
        router.back()
      }
    } catch {
      // 静默失败
    } finally {
      setSaving(false)
    }
  }

  const initials = nickname?.slice(0, 2) || '?'

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center gap-4 px-4 py-3 border-b border-gray-100">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-[#0a0a0a]" />
        </button>
        <h1 className="text-[17px] font-semibold text-[#0a0a0a]">个人资料</h1>
      </header>

      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-20 h-20 rounded-full bg-[#0a0a0a] flex items-center justify-center text-2xl font-bold text-white mb-3">
            {initials}
          </div>
          <p className="text-[13px] text-[#a3a3a3]">点击修改头像（暂不支持）</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div>
            <label className="block text-[13px] text-[#666] mb-2">昵称</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="输入昵称"
              className="w-full h-12 px-4 bg-gray-100 rounded-xl text-[15px] outline-none focus:ring-2 focus:ring-[#0a0a0a]"
            />
          </div>

          <div>
            <label className="block text-[13px] text-[#666] mb-2">邮箱</label>
            <div className="w-full h-12 px-4 bg-gray-50 rounded-xl text-[15px] text-[#a3a3a3] flex items-center">
              {user?.email || '未设置'}
            </div>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={handleSave}
          disabled={saving || !nickname.trim()}
          className="w-full h-12 mt-8 bg-[#0a0a0a] text-white rounded-xl text-[15px] font-medium disabled:opacity-50 active:scale-[0.98] transition-transform"
        >
          {saving ? '保存中...' : '保存'}
        </motion.button>
      </div>
    </div>
  )
}
