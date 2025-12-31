'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft, Clock, ChefHat } from 'lucide-react'

interface Recipe {
  id: string
  name: string
  category: string | null
  coverImage: string | null
  prepTime: number | null
  cookTime: number | null
}

export default function RecipeDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)

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
      <header className="h-14 flex items-center px-4 shrink-0">
        <button onClick={() => router.back()} className="p-2 -ml-2 active:opacity-50">
          <ChevronLeft className="w-6 h-6" />
        </button>
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

            <div className="flex items-center gap-3 mt-3">
              {totalTime > 0 && (
                <div className="flex items-center gap-1 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{totalTime}分钟</span>
                </div>
              )}
              {recipe.category && (
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                  {recipe.category}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-4 py-4 shrink-0">
        <button className="w-full h-14 bg-black text-white rounded-2xl font-medium active:scale-[0.98] transition-transform">
          开始做菜
        </button>
      </div>
    </main>
  )
}
