'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft, Clock, ChefHat, Trash2, Edit } from 'lucide-react'

interface Recipe {
  id: string
  name: string
  category: string | null
  difficulty: string | null
  coverImage: string | null
  prepTime: number | null
  cookTime: number | null
  ingredients: string | null
  steps: string | null
}

interface Ingredient {
  name: string
  amount: string
}

interface Step {
  content: string
}

export default function RecipeDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadRecipe()
  }, [id])

  const loadRecipe = async () => {
    const res = await fetch(`/api/recipes/${id}`)
    if (res.ok) {
      setRecipe(await res.json())
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这道菜谱吗？')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/recipes/${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/recipes')
      }
    } catch {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <main className="flex flex-col bg-white" style={{ height: '100dvh' }}>
        <header className="h-14 flex items-center px-4 shrink-0">
          <button onClick={() => router.back()} className="p-2 -ml-2 active:opacity-50">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </header>
        <div className="flex-1 overflow-auto">
          <div className="aspect-video bg-gray-100 animate-pulse" />
          <div className="p-4 space-y-4">
            <div className="h-8 bg-gray-100 rounded w-1/2 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse" />
          </div>
        </div>
      </main>
    )
  }

  if (!recipe) return null

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0)

  return (
    <main
      className="flex flex-col bg-white"
      style={{
        height: '100dvh',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      <header className="h-14 flex items-center justify-between px-4 shrink-0">
        <button onClick={() => router.back()} className="p-2 -ml-2 active:opacity-50">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 active:opacity-50 disabled:opacity-50"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="aspect-video bg-gray-100 relative flex items-center justify-center">
            {recipe.coverImage ? (
              <img src={recipe.coverImage} alt={recipe.name} className="w-full h-full object-cover" />
            ) : (
              <ChefHat className="w-12 h-12 text-gray-300" />
            )}
          </div>

          <div className="p-4">
            <h1 className="text-2xl font-bold text-black">{recipe.name}</h1>

            <div className="flex items-center gap-3 mt-3 flex-wrap">
              {recipe.difficulty && (
                <span className="px-3 py-1 bg-[#0a0a0a] text-white rounded-full text-xs">
                  {recipe.difficulty}
                </span>
              )}
              {totalTime > 0 && (
                <div className="flex items-center gap-1 text-[#666]">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{totalTime}分钟</span>
                </div>
              )}
              {recipe.category && (
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-[#666]">
                  {recipe.category}
                </span>
              )}
            </div>

            {/* 食材列表 */}
            {recipe.ingredients && (() => {
              const ingredients: Ingredient[] = JSON.parse(recipe.ingredients)
              if (ingredients.length === 0) return null
              return (
                <div className="mt-6">
                  <h2 className="text-[15px] font-semibold text-[#0a0a0a] mb-3">食材</h2>
                  <div className="bg-gray-50 rounded-2xl overflow-hidden">
                    {ingredients.map((ing, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between px-4 py-3 ${
                          index < ingredients.length - 1 ? 'border-b border-gray-100' : ''
                        }`}
                      >
                        <span className="text-[15px] text-[#0a0a0a]">{ing.name}</span>
                        <span className="text-[14px] text-[#666]">{ing.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* 步骤列表 */}
            {recipe.steps && (() => {
              const steps: Step[] = JSON.parse(recipe.steps)
              if (steps.length === 0) return null
              return (
                <div className="mt-6 pb-4">
                  <h2 className="text-[15px] font-semibold text-[#0a0a0a] mb-3">步骤</h2>
                  <div className="space-y-3">
                    {steps.map((step, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#0a0a0a] text-white text-[13px] font-medium flex items-center justify-center shrink-0">
                          {index + 1}
                        </div>
                        <p className="flex-1 text-[15px] text-[#0a0a0a] leading-relaxed pt-0.5">
                          {step.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        </motion.div>
      </div>

      <div className="px-4 py-4 shrink-0">
        <button className="w-full h-14 bg-[#0a0a0a] text-white rounded-2xl font-medium active:scale-[0.98] transition-transform">
          开始做菜
        </button>
      </div>
    </main>
  )
}
