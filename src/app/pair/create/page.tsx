'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'

export default function CreatePairPage() {
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user, setUser } = useAuthStore()

  useEffect(() => {
    if (user) createCouple()
  }, [user])

  const createCouple = async () => {
    if (!user) return
    const res = await fetch('/api/couple/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    })
    const data = await res.json()

    // 更新用户的coupleId
    setUser({ ...user, coupleId: data.id })

    if (data.status === 'active') {
      router.push('/home')
    } else {
      setCode(data.inviteCode)
    }
    setLoading(false)
  }

  const copyCode = async () => {
    try {
      // 尝试使用 Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code)
      } else {
        // Fallback: 使用传统方法
        const textArea = document.createElement('textarea')
        textArea.value = code
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-[100dvh] flex flex-col bg-white">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full px-6">
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
          <h1 className="text-[28px] font-semibold text-[#0a0a0a]">邀请你的另一半</h1>
          <p className="mt-2 text-[14px] text-[#a3a3a3]">分享邀请码给 TA</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-10 py-6 border border-gray-200 rounded-2xl text-center"
        >
          <p className="text-3xl font-mono font-medium tracking-widest text-[#0a0a0a]">{code}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 space-y-3"
        >
          <button
            onClick={copyCode}
            className={`w-full h-[48px] rounded-xl text-[15px] font-medium active:scale-[0.98] transition-all ${
              copied
                ? 'bg-gray-100 text-[#0a0a0a]'
                : 'bg-[#0a0a0a] text-white'
            }`}
          >
            {copied ? '已复制' : '复制邀请码'}
          </button>

          <Link
            href="/pair/join"
            className="w-full h-[48px] rounded-xl text-[15px] font-medium bg-gray-100 text-[#0a0a0a] flex items-center justify-center active:scale-[0.98] transition-all"
          >
            我有邀请码
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => router.push('/home')}
            className="text-[14px] text-[#a3a3a3]"
          >
            跳过，稍后配对
          </button>
        </motion.div>
      </div>
    </main>
  )
}
