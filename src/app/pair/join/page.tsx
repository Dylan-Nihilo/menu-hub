'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'

export default function JoinPairPage() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user, setUser } = useAuthStore()

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError('')
    setLoading(true)

    const res = await fetch('/api/couple/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, code }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    setUser({ ...user, coupleId: data.coupleId })
    router.push('/home')
  }

  return (
    <main className="min-h-[100dvh] flex flex-col bg-white">
      <header className="h-12 flex items-center px-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center -ml-2 active:opacity-50"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="1.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </header>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto bg-[#0a0a0a] rounded-full flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="none">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h1 className="text-[28px] font-semibold text-[#0a0a0a]">加入配对</h1>
          <p className="mt-2 text-[14px] text-[#a3a3a3]">输入对方的邀请码</p>
        </motion.div>

        <form onSubmit={handleJoin} className="mt-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
          >
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="请输入邀请码"
              className="w-full h-[56px] px-4 border border-gray-200 rounded-xl text-center font-mono tracking-widest text-xl bg-transparent outline-none focus:border-[#0a0a0a] transition-colors placeholder:text-[#a3a3a3]"
            />
          </motion.div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-[#dc2626] text-[13px] text-center"
            >
              {error}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full h-[48px] bg-[#0a0a0a] text-white rounded-xl text-[15px] font-medium active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {loading ? '加入中...' : '加入'}
            </button>
          </motion.div>
        </form>
      </div>
    </main>
  )
}
