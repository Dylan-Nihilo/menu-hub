'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Camera, Plus, X, Loader2, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { AppLayout, ScrollArea } from '@/components/layout'
import { useToast } from '@/components/ui/Toast'

interface Ingredient {
  name: string
  amount: string
}

interface Step {
  content: string
}

const categories = ['家常菜', '川菜', '粤菜', '西餐', '日料', '甜点', '汤羹', '其他']
const difficulties = ['简单', '中等', '困难']

export default function NewRecipePage() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [prepTime, setPrepTime] = useState('')
  const [cookTime, setCookTime] = useState('')
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [steps, setSteps] = useState<Step[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const router = useRouter()
  const { user } = useAuthStore()
  const { addToast } = useToast()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0])
    }
  }

  // AI 生成菜谱
  const handleAIGenerate = async () => {
    if (!name.trim()) {
      addToast({ message: '请先输入菜名', type: 'error' })
      return
    }

    setGenerating(true)
    try {
      const res = await fetch('/api/ai/recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dishName: name.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '生成失败')
      }

      const data = await res.json()

      // 填充表单
      if (data.category) setCategory(data.category)
      if (data.difficulty) setDifficulty(data.difficulty)
      if (data.prepTime) setPrepTime(String(data.prepTime))
      if (data.cookTime) setCookTime(String(data.cookTime))
      if (data.ingredients) setIngredients(data.ingredients)
      if (data.steps) setSteps(data.steps)

      addToast({ message: 'AI 生成成功，请检查并调整', type: 'success' })
    } catch (err) {
      addToast({ message: err instanceof Error ? err.message : '生成失败', type: 'error' })
    } finally {
      setGenerating(false)
    }
  }

  // 食材操作
  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '' }])
  }

  const updateIngredient = (index: number, field: 'name' | 'amount', value: string) => {
    const updated = [...ingredients]
    updated[index][field] = value
    setIngredients(updated)
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  // 步骤操作
  const addStep = () => {
    setSteps([...steps, { content: '' }])
  }

  const updateStep = (index: number, content: string) => {
    const updated = [...steps]
    updated[index].content = content
    setSteps(updated)
  }

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      addToast({ message: '请输入菜名', type: 'error' })
      return
    }
    if (!user?.coupleId) {
      addToast({ message: '请先完成配对', type: 'error' })
      return
    }

    setLoading(true)

    try {
      // 上传图片
      let imageUrl: string | null = null
      if (coverImage) {
        setUploading(true)
        const formData = new FormData()
        formData.append('file', coverImage)
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        setUploading(false)
        if (uploadRes.ok) {
          const { url } = await uploadRes.json()
          imageUrl = url
        } else {
          addToast({ message: '图片上传失败', type: 'error' })
        }
      }

      // 过滤空的食材和步骤
      const validIngredients = ingredients.filter(i => i.name.trim())
      const validSteps = steps.filter(s => s.content.trim())

      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coupleId: user.coupleId,
          createdById: user.id,
          name: name.trim(),
          coverImage: imageUrl,
          category: category || null,
          difficulty: difficulty || null,
          prepTime: prepTime ? parseInt(prepTime) : null,
          cookTime: cookTime ? parseInt(cookTime) : null,
          ingredients: validIngredients.length > 0 ? JSON.stringify(validIngredients) : null,
          steps: validSteps.length > 0 ? JSON.stringify(validSteps) : null,
        }),
      })

      if (!res.ok) {
        throw new Error('保存失败')
      }

      addToast({ message: '菜谱创建成功', type: 'success' })
      router.push('/recipes')
    } catch (err) {
      addToast({ message: '保存失败，请重试', type: 'error' })
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
          className="w-16 flex items-center justify-end text-[15px] font-medium text-[#0a0a0a] disabled:text-[#a3a3a3]"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '完成'}
        </button>
      </header>

      <ScrollArea className="px-6 pt-4">
        {/* 封面图片 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="aspect-video bg-gray-50 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden"
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          {coverImage ? (
            <img
              src={URL.createObjectURL(coverImage)}
              alt="预览"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center text-[#a3a3a3]">
              <Camera className="w-10 h-10 mx-auto mb-2" />
              <span className="text-[13px]">点击上传封面图片</span>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
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
              <button
                onClick={handleAIGenerate}
                disabled={generating || !name.trim()}
                className="ml-2 p-2 rounded-lg bg-[#0a0a0a] text-white disabled:bg-gray-300 active:scale-95 transition-all"
                title="AI 生成"
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </button>
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
                      : 'bg-gray-50 text-[#0a0a0a]'
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

          {/* 食材 */}
          <div>
            <div className="flex items-center justify-between px-1 mb-2">
              <p className="text-[13px] text-[#a3a3a3] uppercase tracking-wide">食材</p>
              <button
                onClick={addIngredient}
                className="flex items-center gap-1 text-[13px] text-[#0a0a0a] font-medium"
              >
                <Plus className="w-4 h-4" />
                添加
              </button>
            </div>
            {ingredients.length === 0 ? (
              <button
                onClick={addIngredient}
                className="w-full h-[50px] bg-gray-50 rounded-xl text-[14px] text-[#a3a3a3] flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加食材
              </button>
            ) : (
              <div className="bg-gray-50 rounded-2xl overflow-hidden">
                {ingredients.map((ing, index) => (
                  <div key={index} className={`flex items-center px-4 h-[50px] ${index < ingredients.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <input
                      type="text"
                      value={ing.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      placeholder="食材名称"
                      className="flex-1 text-[15px] bg-transparent outline-none placeholder:text-[#a3a3a3]"
                    />
                    <input
                      type="text"
                      value={ing.amount}
                      onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                      placeholder="用量"
                      className="w-20 text-[15px] bg-transparent outline-none text-right placeholder:text-[#a3a3a3]"
                    />
                    <button onClick={() => removeIngredient(index)} className="ml-2 p-1">
                      <X className="w-4 h-4 text-[#a3a3a3]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 步骤 */}
          <div className="pb-8">
            <div className="flex items-center justify-between px-1 mb-2">
              <p className="text-[13px] text-[#a3a3a3] uppercase tracking-wide">步骤</p>
              <button
                onClick={addStep}
                className="flex items-center gap-1 text-[13px] text-[#0a0a0a] font-medium"
              >
                <Plus className="w-4 h-4" />
                添加
              </button>
            </div>
            {steps.length === 0 ? (
              <button
                onClick={addStep}
                className="w-full h-[50px] bg-gray-50 rounded-xl text-[14px] text-[#a3a3a3] flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加步骤
              </button>
            ) : (
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#0a0a0a] text-white text-[13px] font-medium flex items-center justify-center shrink-0 mt-2">
                      {index + 1}
                    </div>
                    <div className="flex-1 relative">
                      <textarea
                        value={step.content}
                        onChange={(e) => updateStep(index, e.target.value)}
                        placeholder="描述这一步..."
                        rows={2}
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl text-[15px] outline-none resize-none placeholder:text-[#a3a3a3]"
                      />
                      <button
                        onClick={() => removeStep(index)}
                        className="absolute top-2 right-2 p-1"
                      >
                        <X className="w-4 h-4 text-[#a3a3a3]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </AppLayout>
  )
}
