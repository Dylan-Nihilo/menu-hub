'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { AppLayout, ScrollArea } from '@/components/layout'

interface Recipe {
  id: string
  name: string
  category?: string
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
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

  return (
    <AppLayout>
      {/* 页面标题 */}
      <header className="px-6 pt-4 pb-4 flex items-center justify-between shrink-0">
        <h1 className="text-[28px] font-semibold text-[#0a0a0a]">菜谱</h1>
        <Link href="/recipes/new" className="w-9 h-9 flex items-center justify-center rounded-full bg-[#0a0a0a] text-white active:scale-95 transition-transform">
          <Plus className="w-5 h-5" />
        </Link>
      </header>

      <ScrollArea className="px-6">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/5] border border-gray-200 rounded-2xl animate-pulse bg-gray-50" />
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center pt-16"
          >
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="1.5">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <p className="mt-5 text-[17px] font-medium text-[#0a0a0a]">还没有菜谱</p>
            <p className="mt-1 text-[14px] text-[#a3a3a3]">添加你们喜欢的菜品吧</p>
            <Link
              href="/recipes/new"
              className="mt-6 h-[48px] px-8 flex items-center bg-[#0a0a0a] text-white rounded-xl text-[15px] font-medium active:scale-[0.98] transition-transform"
            >
              添加第一道菜
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-4">
            {recipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/recipes/${recipe.id}`}>
                  <div className="bg-gray-50 rounded-2xl overflow-hidden active:scale-[0.98] transition-transform">
                    <div className="aspect-square bg-gray-100" />
                    <div className="p-3">
                      <p className="font-medium text-[15px] text-[#0a0a0a] truncate">{recipe.name}</p>
                      {recipe.category && (
                        <p className="text-[13px] text-[#a3a3a3] mt-0.5">{recipe.category}</p>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </ScrollArea>
    </AppLayout>
  )
}
