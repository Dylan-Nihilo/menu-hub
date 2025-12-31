'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { AppLayout, ScrollArea } from '@/components/layout'

interface Recipe {
  id: string
  name: string
}

export default function SelectPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const { user } = useAuthStore()

  const loadRecipes = useCallback(async () => {
    if (!user?.coupleId) return
    try {
      const res = await fetch(`/api/recipes?coupleId=${user.coupleId}`)
      if (!res.ok) throw new Error('加载失败')
      setRecipes(await res.json())
    } catch {
      setRecipes([])
    } finally {
      setLoading(false)
    }
  }, [user?.coupleId])

  useEffect(() => {
    if (user?.coupleId) loadRecipes()
    else setLoading(false)
  }, [user?.coupleId, loadRecipes])

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleSubmit = async () => {
    if (!selected.length || !user?.coupleId) return
    setSubmitting(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupleId: user.coupleId, date: today, recipeIds: selected, userId: user.id }),
      })
      if (!res.ok) throw new Error('提交失败')
      router.push('/home')
    } catch {
      setSubmitting(false)
    }
  }

  return (
    <AppLayout>
      {/* 顶部导航 */}
      <header className="h-12 flex items-center justify-between px-6 shrink-0 border-b border-gray-100">
        <button onClick={() => router.back()} className="w-16 text-left text-[15px] text-[#0a0a0a] active:opacity-70">
          取消
        </button>
        <h1 className="text-[15px] font-semibold text-[#0a0a0a]">点菜</h1>
        <div className="w-16" />
      </header>

      {/* 内容区域 */}
      <ScrollArea className="px-6 pt-4 pb-20">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[4/5] bg-gray-50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {recipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => toggleSelect(recipe.id)}
                className="relative"
              >
                <div className={`
                  rounded-2xl overflow-visible transition-all
                  ${selected.includes(recipe.id)
                    ? 'ring-2 ring-[#0a0a0a] ring-offset-2'
                    : 'bg-gray-50'}
                `}>
                  <div className="aspect-square bg-gray-100 rounded-t-2xl" />
                  <div className="p-3">
                    <p className="font-medium text-[15px] text-[#0a0a0a] truncate">{recipe.name}</p>
                  </div>
                </div>
                {selected.includes(recipe.id) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-[#0a0a0a] rounded-full flex items-center justify-center"
                  >
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* 底部提交按钮 */}
      {selected.length > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed left-0 right-0 p-5 bg-white/80 backdrop-blur-xl border-t border-gray-100"
          style={{ bottom: 'calc(var(--nav-height) + var(--safe-bottom))' }}
        >
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-[48px] bg-[#0a0a0a] text-white rounded-xl text-[15px] font-medium disabled:opacity-50 active:scale-[0.98] transition-transform"
          >
            {submitting ? '提交中...' : `确认选择 (${selected.length})`}
          </button>
        </motion.div>
      )}
    </AppLayout>
  )
}
