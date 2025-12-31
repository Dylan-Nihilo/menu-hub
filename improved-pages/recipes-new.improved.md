```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Camera, X, Loader2 } from 'lucide-react'
import { AppLayout, ScrollArea } from '@/components/layout'
import { Button } from '@/components/ui/Button.improved'
import { Input } from '@/components/ui/Input.improved'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'

const categories = ['家常菜', '川菜', '粤菜', '西餐', '日料', '甜点', '汤羹', '其他']
const difficulties = ['简单', '中等', '困难']

export default function NewRecipePageImproved() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [prepTime, setPrepTime] = useState('')
  const [cookTime, setCookTime] = useState('')
  const [description, setDescription] = useState('')
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '' }])
  const [steps, setSteps] = useState([''])
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    // ... (submission logic)
  }

  return (
    <AppLayout>
      <header className="flex items-center justify-between h-14 px-4 shrink-0 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <X className="w-5 h-5" />
        </Button>
        <h1 className="text-base font-semibold text-foreground">添加新菜谱</h1>
        <Button onClick={handleSubmit} disabled={loading || !name} className="w-20">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '发布'}
        </Button>
      </header>

      <ScrollArea className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Cover Image */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">封面图片</label>
            <div className="aspect-video bg-surface rounded-2xl flex items-center justify-center relative overflow-hidden">
              <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              {coverImage ? (
                <img src={URL.createObjectURL(coverImage)} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-foreground/50">
                  <Camera className="w-10 h-10 mx-auto mb-2" />
                  <span className="text-sm">点击或拖拽上传</span>
                </div>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <Input
              label="菜名"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：番茄炒蛋"
              required
            />
            <Textarea
              label="描述"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简单介绍一下这道菜的特色"
              rows={3}
            />
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <Select label="分类" value={category} onValueChange={setCategory} placeholder="选择分类">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Select label="难度" value={difficulty} onValueChange={setDifficulty} placeholder="选择难度">
              {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
            </Select>
            <Input
              label="准备时间 (分钟)"
              type="number"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              placeholder="例如：10"
            />
            <Input
              label="烹饪时间 (分钟)"
              type="number"
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value)}
              placeholder="例如：15"
            />
          </div>

          {/* Ingredients */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">食材清单</h3>
            {ingredients.map((ing, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input placeholder="食材名，如：鸡蛋" value={ing.name} onChange={(e) => { /* update logic */ }} className="flex-1" />
                <Input placeholder="用量，如：2个" value={ing.quantity} onChange={(e) => { /* update logic */ }} className="w-2/5" />
                <Button variant="ghost" size="icon" onClick={() => { /* remove logic */ }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={() => setIngredients([...ingredients, { name: '', quantity: '' }])}>添加食材</Button>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">烹饪步骤</h3>
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-lg font-semibold text-primary-500 pt-2">{index + 1}</span>
                <Textarea placeholder="步骤描述" value={step} onChange={(e) => { /* update logic */ }} rows={3} className="flex-1" />
                <Button variant="ghost" size="icon" onClick={() => { /* remove logic */ }} className="mt-2">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={() => setSteps([...steps, ''])}>添加步骤</Button>
          </div>

        </motion.div>
        <div className="h-24" />
      </ScrollArea>
    </AppLayout>
  )
}
```
