'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui'

export default function RegisterPage() {
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signUp(email, password, nickname)
    } catch (err: any) {
      setError(err.message || '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[100dvh] flex flex-col bg-white">
      {/* 顶部返回 */}
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

      {/* 内容区 - 居中布局 */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-20">
        <div className="w-full max-w-sm mx-auto">
          {/* 标题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-[28px] font-semibold text-[#0a0a0a]">注册</h1>
            <p className="mt-1 text-[14px] text-[#a3a3a3]">创建你的账号</p>
          </motion.div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="space-y-4"
            >
              <Input
                type="text"
                label="昵称"
                placeholder="请输入昵称"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              <Input
                type="email"
                label="邮箱"
                placeholder="请输入邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                label="密码"
                placeholder="请输入密码（至少6位）"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </motion.div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-[#dc2626] text-[13px]"
              >
                {error}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-6"
            >
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[48px] bg-[#0a0a0a] text-white rounded-xl text-[15px] font-medium active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                {loading ? '注册中...' : '注册'}
              </button>
            </motion.div>
          </form>

          {/* 底部链接 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-6 text-center text-[14px] text-[#a3a3a3]"
          >
            已有账号？{' '}
            <Link href="/login" className="text-[#0a0a0a] font-medium">登录</Link>
          </motion.p>
        </div>
      </div>
    </main>
  )
}
