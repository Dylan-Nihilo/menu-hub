'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'

export default function SplashPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [showText, setShowText] = useState(false)
  const [showButtons, setShowButtons] = useState(false)

  useEffect(() => {
    // 已登录用户直接跳转首页
    if (user) {
      const timer = setTimeout(() => router.push('/home'), 1500)
      return () => clearTimeout(timer)
    }

    // 未登录用户显示动画后出现按钮
    const textTimer = setTimeout(() => setShowText(true), 1000)
    const buttonsTimer = setTimeout(() => setShowButtons(true), 2000)

    return () => {
      clearTimeout(textTimer)
      clearTimeout(buttonsTimer)
    }
  }, [router, user])

  return (
    <main
      className="fixed inset-0 flex flex-col items-center justify-center bg-white"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      {/* 内容容器 - 垂直居中，宽度更大 */}
      <div className="flex flex-col items-center w-full max-w-sm px-6">
        {/* Logo */}
        <BrandLogo />

        {/* 品牌文字 */}
        <div className="mt-8">
          {showText && (
            <>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-center text-[22px] font-light tracking-[0.15em] text-[#0a0a0a]"
              >
                壹餐
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-center text-[13px] tracking-[0.08em] text-[#a3a3a3] mt-2"
              >
                两人 · 菜单 · 日常
              </motion.p>
            </>
          )}
        </div>

        {/* 按钮区域 */}
        <div className="w-full mt-10">
          {showButtons ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3"
            >
              <button
                onClick={() => router.push('/login')}
                className="w-full h-[48px] bg-[#0a0a0a] text-white rounded-xl text-[15px] font-medium active:scale-[0.98] transition-transform"
              >
                登录
              </button>
              <button
                onClick={() => router.push('/register')}
                style={{ border: '1px solid #0a0a0a' }}
                className="w-full h-[48px] bg-white text-[#0a0a0a] rounded-xl text-[15px] font-medium active:scale-[0.98] transition-transform"
              >
                注册
              </button>
            </motion.div>
          ) : (
            <div className="flex justify-center h-[96px] items-center">
              <BreathingDots />
            </div>
          )}
        </div>
      </div>

      {/* 底部版本号 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: showText ? 0.4 : 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute bottom-8 text-[11px] text-[#a3a3a3] tracking-wide"
      >
        Version 1.0.0
      </motion.p>
    </main>
  )
}

// 品牌Logo组件 - 画圆动画
function BrandLogo() {
  const circleRadius = 48
  const circumference = 2 * Math.PI * circleRadius

  return (
    <div className="relative w-[100px] h-[100px]">
      {/* SVG 画圆动画 */}
      <svg className="absolute inset-0 w-full h-full -rotate-90">
        <motion.circle
          cx="50"
          cy="50"
          r={circleRadius}
          fill="none"
          stroke="#0a0a0a"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>

      {/* 字母 M */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <span className="text-[36px] font-light text-[#0a0a0a]">M</span>
      </motion.div>
    </div>
  )
}

// 呼吸圆点组件
function BreathingDots() {
  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut'
          }}
          className="w-1.5 h-1.5 rounded-full bg-[#0a0a0a]"
        />
      ))}
    </div>
  )
}
