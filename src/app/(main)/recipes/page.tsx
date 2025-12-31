'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Search, X } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { AppLayout, ScrollArea } from '@/components/layout'

interface Recipe {
  id: string
  name: string
  category?: string
  difficulty?: string
  prepTime?: number
  cookTime?: number
  coverImage?: string
}

const categories = ['全部', '家常菜', '川菜', '粤菜', '西餐', '日料', '甜点', '汤羹', '其他']

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('全部')
  const { user } = useAuthStore()

  const filteredRecipes = useMemo(() => {
    return recipes
      .filter(r => activeCategory === '全部' || r.category === activeCategory)
      .filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [recipes, activeCategory, searchTerm])

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
      <header className="px-6 pt-4 pb-2 flex items-center justify-between shrink-0">
        <h1 className="text-[28px] font-semibold text-[#0a0a0a]">菜谱</h1>
        <Link href="/recipes/new" className="w-9 h-9 flex items-center justify-center rounded-full bg-[#0a0a0a] text-white active:scale-95 transition-transform">
          <Plus className="w-5 h-5" />
        </Link>
      </header>

      {/* 搜索框 */}
      <div className="px-6 py-3 shrink-0">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
          <input
            type="text"
            placeholder="搜索菜谱"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-10 bg-gray-50 rounded-xl text-[15px] outline-none focus:ring-2 focus:ring-[#0a0a0a]"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-[#a3a3a3]" />
            </button>
          )}
        </div>
      </div>

      {/* 分类标签 */}
      <div className="px-6 pb-3 shrink-0 overflow-x-auto">
        <div className="flex gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 h-8 rounded-full text-[13px] font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-[#0a0a0a] text-white'
                  : 'bg-gray-100 text-[#666]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

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
            {filteredRecipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/recipes/${recipe.id}`}>
                  <div className="bg-gray-50 rounded-2xl overflow-hidden active:scale-[0.98] transition-transform">
                    <div className="aspect-square bg-gray-100 relative">
                      {recipe.coverImage ? (
                        <img
                          src={recipe.coverImage}
                          alt={recipe.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#a3a3a3]">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 6.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" />
                            <path d="M16.5 22h-9a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5h9a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5Z" />
                          </svg>
                        </div>
                      )}
                    </div>
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
