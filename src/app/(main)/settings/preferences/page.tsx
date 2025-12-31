'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, X, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

const commonAllergens = ['花生', '海鲜', '牛奶', '鸡蛋', '小麦', '大豆', '坚果', '芝麻']
const commonDislikes = ['香菜', '葱', '蒜', '姜', '辣椒', '胡萝卜', '芹菜', '茄子', '苦瓜', '内脏']

export default function PreferencesPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [allergens, setAllergens] = useState<string[]>([])
  const [dislikes, setDislikes] = useState<string[]>([])
  const [newAllergen, setNewAllergen] = useState('')
  const [newDislike, setNewDislike] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // 从本地存储加载
    const saved = localStorage.getItem(`preferences_${user?.id}`)
    if (saved) {
      const data = JSON.parse(saved)
      setAllergens(data.allergens || [])
      setDislikes(data.dislikes || [])
    }
  }, [user?.id])

  const handleSave = async () => {
    setSaving(true)
    localStorage.setItem(`preferences_${user?.id}`, JSON.stringify({ allergens, dislikes }))
    setTimeout(() => {
      setSaving(false)
      router.back()
    }, 500)
  }

  const addAllergen = (item: string) => {
    if (item && !allergens.includes(item)) {
      setAllergens([...allergens, item])
    }
    setNewAllergen('')
  }

  const addDislike = (item: string) => {
    if (item && !dislikes.includes(item)) {
      setDislikes([...dislikes, item])
    }
    setNewDislike('')
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center gap-4 px-4 py-3 border-b border-gray-100">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-[#0a0a0a]" />
        </button>
        <h1 className="text-[17px] font-semibold text-[#0a0a0a]">口味偏好</h1>
      </header>

      <div className="p-6 space-y-6">
        {/* 过敏食材 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-[#666]" />
            <h3 className="text-[15px] font-medium text-[#0a0a0a]">过敏食材</h3>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {allergens.map(item => (
              <span key={item} className="flex items-center gap-1 px-3 py-1.5 bg-[#0a0a0a] text-white rounded-full text-[13px]">
                {item}
                <button onClick={() => setAllergens(allergens.filter(a => a !== item))}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {commonAllergens.filter(a => !allergens.includes(a)).map(item => (
              <button
                key={item}
                onClick={() => addAllergen(item)}
                className="px-3 py-1.5 bg-gray-100 text-[#666] rounded-full text-[13px] active:scale-95"
              >
                + {item}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newAllergen}
              onChange={(e) => setNewAllergen(e.target.value)}
              placeholder="添加其他过敏食材"
              className="flex-1 h-10 px-3 bg-gray-100 rounded-lg text-[14px] outline-none"
            />
            <button
              onClick={() => addAllergen(newAllergen)}
              disabled={!newAllergen.trim()}
              className="px-4 h-10 bg-[#0a0a0a] text-white rounded-lg text-[14px] disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* 忌口食材 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className="text-[15px] font-medium text-[#0a0a0a] mb-3">忌口食材</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {dislikes.map(item => (
              <span key={item} className="flex items-center gap-1 px-3 py-1.5 bg-[#0a0a0a] text-white rounded-full text-[13px]">
                {item}
                <button onClick={() => setDislikes(dislikes.filter(d => d !== item))}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {commonDislikes.filter(d => !dislikes.includes(d)).map(item => (
              <button
                key={item}
                onClick={() => addDislike(item)}
                className="px-3 py-1.5 bg-gray-100 text-[#666] rounded-full text-[13px] active:scale-95"
              >
                + {item}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newDislike}
              onChange={(e) => setNewDislike(e.target.value)}
              placeholder="添加其他忌口食材"
              className="flex-1 h-10 px-3 bg-gray-100 rounded-lg text-[14px] outline-none"
            />
            <button
              onClick={() => addDislike(newDislike)}
              disabled={!newDislike.trim()}
              className="px-4 h-10 bg-[#0a0a0a] text-white rounded-lg text-[14px] disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 bg-[#0a0a0a] text-white rounded-xl text-[15px] font-medium disabled:opacity-50 active:scale-[0.98]"
        >
          {saving ? '保存中...' : '保存'}
        </motion.button>
      </div>
    </div>
  )
}
