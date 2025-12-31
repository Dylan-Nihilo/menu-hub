'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'

export default function PasswordSettingsPage() {
  const router = useRouter()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    setError('')
    if (newPassword !== confirmPassword) {
      setError('两次密码不一致')
      return
    }
    if (newPassword.length < 6) {
      setError('密码至少6位')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword })
      })
      if (res.ok) {
        router.back()
      } else {
        const data = await res.json()
        setError(data.error || '修改失败')
      }
    } catch {
      setError('网络错误')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center gap-4 px-4 py-3 border-b border-gray-100">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-[#0a0a0a]" />
        </button>
        <h1 className="text-[17px] font-semibold text-[#0a0a0a]">修改密码</h1>
      </header>

      <div className="p-6 space-y-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <label className="block text-[13px] text-[#666] mb-2">当前密码</label>
          <div className="relative">
            <input
              type={showOld ? 'text' : 'password'}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full h-12 px-4 pr-12 bg-gray-100 rounded-xl text-[15px] outline-none focus:ring-2 focus:ring-[#0a0a0a]"
            />
            <button
              type="button"
              onClick={() => setShowOld(!showOld)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showOld ? <EyeOff className="w-5 h-5 text-[#a3a3a3]" /> : <Eye className="w-5 h-5 text-[#a3a3a3]" />}
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <label className="block text-[13px] text-[#666] mb-2">新密码</label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full h-12 px-4 pr-12 bg-gray-100 rounded-xl text-[15px] outline-none focus:ring-2 focus:ring-[#0a0a0a]"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showNew ? <EyeOff className="w-5 h-5 text-[#a3a3a3]" /> : <Eye className="w-5 h-5 text-[#a3a3a3]" />}
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <label className="block text-[13px] text-[#666] mb-2">确认新密码</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full h-12 px-4 bg-gray-100 rounded-xl text-[15px] outline-none focus:ring-2 focus:ring-[#0a0a0a]"
          />
        </motion.div>

        {error && (
          <p className="text-[13px] text-red-500">{error}</p>
        )}

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          onClick={handleSave}
          disabled={saving || !oldPassword || !newPassword || !confirmPassword}
          className="w-full h-12 mt-4 bg-[#0a0a0a] text-white rounded-xl text-[15px] font-medium disabled:opacity-50 active:scale-[0.98] transition-transform"
        >
          {saving ? '保存中...' : '确认修改'}
        </motion.button>
      </div>
    </div>
  )
}
