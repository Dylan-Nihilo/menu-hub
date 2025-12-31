```tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft, Clock, ChefHat, MoreVertical, Edit, Trash2, Share2, Heart } from 'lucide-react'
import { Button } from '@/components/ui/Button.improved'

interface Recipe {
  id: string
  name: string
  category: string | null
  difficulty: string | null
  coverImage: string | null
  prepTime: number | null
  cookTime: number | null
  description: string | null
  ingredients: { name: string, quantity: string }[]
  steps: string[]
  createdBy: { nickname: string }
}

export default function RecipeDetailPageImproved() {
  const { id } = useParams()
  const router = useRouter()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // ... (fetch logic)
  }, [id])

  if (loading || !recipe) {
    // ... (loading state)
    return <div>Loading...</div>
  }

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0)

  return (
    <main className="flex flex-col bg-background" style={{ height: '100dvh' }}>
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between h-14 px-4 bg-gradient-to-b from-black/30 to-transparent text-white">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white hover:bg-white/10">
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10"><Heart className="w-5 h-5" /></Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10"><Share2 className="w-5 h-5" /></Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10"><MoreVertical className="w-5 h-5" /></Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="aspect-video bg-surface relative flex items-center justify-center">
            {recipe.coverImage ? (
              <img src={recipe.coverImage} alt={recipe.name} className="w-full h-full object-cover" />
            ) : (
              <ChefHat className="w-12 h-12 text-foreground/30" />
            )}
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">{recipe.name}</h1>
              <p className="text-sm text-foreground/60">由 {recipe.createdBy.nickname} 创建</p>
            </div>

            <div className="flex items-center gap-4 text-sm text-foreground/80">
              {totalTime > 0 && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{totalTime}分钟</span>
                </div>
              )}
              {recipe.difficulty && (
                <div className="flex items-center gap-1.5">
                  <ChefHat className="w-4 h-4" />
                  <span>{recipe.difficulty}</span>
                </div>
              )}
              {recipe.category && (
                <span className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded-md text-xs font-medium">
                  {recipe.category}
                </span>
              )}
            </div>

            {recipe.description && (
              <div className="space-y-2">
                <h2 className="text-base font-semibold text-foreground">菜谱简介</h2>
                <p className="text-sm text-foreground/70 whitespace-pre-wrap">{recipe.description}</p>
              </div>
            )}

            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-base font-semibold text-foreground">食材清单</h2>
                <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex justify-between">
                      <span className="text-foreground/80">{ing.name}</span>
                      <span className="text-foreground/50">{ing.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {recipe.steps && recipe.steps.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-base font-semibold text-foreground">烹饪步骤</h2>
                <div className="space-y-6">
                  {recipe.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <span className="flex items-center justify-center w-6 h-6 bg-primary-500 text-white rounded-full text-sm font-bold">{i + 1}</span>
                      <p className="text-sm text-foreground/80 flex-1 pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
        <div className="h-24" />
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border" style={{ paddingBottom: 'calc(1rem + var(--safe-bottom))' }}>
        <Button size="lg" className="w-full">
          添加到今日菜单
        </Button>
      </div>
    </main>
  )
}
```
