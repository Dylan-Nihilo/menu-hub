```tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, Search, X } from 'lucide-react'
import { AppLayout, ScrollArea } from '@/components/layout'
import { Button } from '@/components/ui/Button.improved'
import { Input } from '@/components/ui/Input.improved'

interface Recipe {
  id: string
  name: string
  category: string | null
  coverImage: string | null
}

const categories = ['全部', '家常菜', '川菜', '粤菜', '西餐', '日料', '甜点', '汤羹']

export default function SelectPageImproved() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('全部')
  const router = useRouter()

  useEffect(() => {
    // ... (fetch logic)
  }, [])

  const filteredRecipes = useMemo(() => {
    return recipes
      .filter(r => activeCategory === '全部' || r.category === activeCategory)
      .filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [recipes, activeCategory, searchTerm])

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleSubmit = async () => {
    // ... (submission logic)
  }

  return (
    <AppLayout>
      <header className="h-14 flex items-center justify-between px-4 shrink-0 border-b border-border">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          取消
        </Button>
        <h1 className="text-base font-semibold text-foreground">选择菜品</h1>
        <div className="w-16" />
      </header>

      <div className="p-4 shrink-0">
        <Input
          placeholder="搜索菜谱名称"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          prefix={<Search className="w-4 h-4 text-foreground/40" />}
          suffix={searchTerm ? <X className="w-4 h-4 cursor-pointer" onClick={() => setSearchTerm('')} /> : null}
        />
      </div>

      <div className="px-4 pb-3 shrink-0 overflow-x-auto">
        <div className="flex items-center gap-2">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(cat)}
              className="shrink-0"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="px-4 pb-32">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[4/5] bg-surface rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredRecipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => toggleSelect(recipe.id)}
                className="relative cursor-pointer group"
              >
                <div className={`rounded-2xl overflow-hidden transition-all duration-300 ${selected.includes(recipe.id) ? 'ring-2 ring-primary-500 ring-offset-2' : 'ring-1 ring-border'}`}>
                  <div className="aspect-square bg-surface flex items-center justify-center">
                    {recipe.coverImage ? (
                      <img src={recipe.coverImage} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <span className="text-foreground/20">无图</span>
                    )}
                  </div>
                  <div className="p-3 bg-background">
                    <p className="font-medium text-sm text-foreground truncate">{recipe.name}</p>
                    <p className="text-xs text-foreground/50 mt-1">{recipe.category || '未分类'}</p>
                  </div>
                </div>
                {selected.includes(recipe.id) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center border-2 border-background"
                  >
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </ScrollArea>

      {selected.length > 0 && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border"
          style={{ bottom: 'calc(var(--nav-height) + var(--safe-bottom))' }}
        >
          <Button size="lg" onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : `确认选择 (${selected.length})`}
          </Button>
        </motion.div>
      )}
    </AppLayout>
  )
}
```
