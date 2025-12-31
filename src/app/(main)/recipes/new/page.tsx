'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Camera } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { AppLayout, ScrollArea } from '@/components/layout'

const categories = ['家常菜', '川菜', '粤菜', '西餐', '日料', '甜点', '汤羹', '其他']
const difficulties = ['简单', '中等', '困难']

export default function NewRecipePage() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [prepTime, setPrepTime] = useState('')
  const [cookTime, setCookTime] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user } = useAuthStore()

  const handleSubmit = async () => {
    if (!user?.coupleId || !name) return
    setLoading(true)
    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coupleId: user.coupleId,
          createdById: user.id,
          name,
          category: category || null,
          difficulty: difficulty || null,
          prepTime: prepTime ? parseInt(prepTime) : null,
          cookTime: cookTime ? parseInt(cookTime) : null,
        }),
      })
      const data = await res.json()
      router.push(`/recipes/${data.id}`)
    } catch {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      {/* 导航栏 */}
      <header className="h-12 flex items-center justify-between px-6 shrink-0 border-b border-gray-100">
        <button onClick={() => router.back()} className="w-16 text-left text-[15px] text-[#0a0a0a] active:opacity-70">
          取消
        </button>
        <h1 className="text-[15px] font-semibold text-[#0a0a0a]">添加菜谱</h1>
        <button
          onClick={handleSubmit}
          disabled={loading || !name}
          className="w-16 text-right text-[15px] font-medium text-[#0a0a0a] disabled:text-[#a3a3a3]"
        >
          {loading ? '...' : '完成'}
        </button>
      </header>

      <ScrollArea className="px-6 pt-4">
        {/* 封面图片 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="aspect-video bg-gray-50 rounded-2xl flex items-center justify-center mb-6"
        >
          <div className="text-center text-[#a3a3a3]">
            <Camera className="w-10 h-10 mx-auto mb-2" />
            <span className="text-[13px]">添加封面图片</span>
          </div>
        </motion.div>

        {/* 表单 */}
        <div className="space-y-6">
          {/* 基本信息 */}
          <div className="bg-gray-50 rounded-2xl overflow-hidden">
            <div className="flex items-center px-4 h-[50px] border-b border-gray-100">
              <span className="w-20 text-[15px] text-[#0a0a0a]">菜名</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="输入菜名"
                className="flex-1 text-[15px] bg-transparent outline-none placeholder:text-[#a3a3a3]"
              />
            </div>
            <div className="flex items-center px-4 h-[50px]">
              <span className="w-20 text-[15px] text-[#0a0a0a]">分类</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex-1 text-[15px] bg-transparent outline-none appearance-none"
              >
                <option value="">选择分类</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* 难度 */}
          <div>
            <p className="text-[13px] text-[#a3a3a3] uppercase tracking-wide px-1 mb-2">难度</p>
            <div className="flex gap-2">
              {difficulties.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(difficulty === d ? '' : d)}
                  className={`flex-1 h-[44px] rounded-xl text-[15px] font-medium transition-all active:scale-[0.98] ${
                    difficulty === d
                      ? 'bg-[#0a0a0a] text-white'
                      : 'bg-gray-50'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* 时间 */}
          <div className="bg-gray-50 rounded-2xl overflow-hidden">
            <div className="flex items-center px-4 h-[50px] border-b border-gray-100">
              <span className="w-24 text-[15px] text-[#0a0a0a]">准备时间</span>
              <input
                type="number"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="分钟"
                className="flex-1 text-[15px] bg-transparent outline-none text-right placeholder:text-[#a3a3a3]"
              />
            </div>
            <div className="flex items-center px-4 h-[50px]">
              <span className="w-24 text-[15px] text-[#0a0a0a]">烹饪时间</span>
              <input
                type="number"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                placeholder="分钟"
                className="flex-1 text-[15px] bg-transparent outline-none text-right placeholder:text-[#a3a3a3]"
              />
            </div>
          </div>
        </div>
      </ScrollArea>
    </AppLayout>
  )
}
