'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { AppLayout, ScrollArea } from '@/components/layout'

interface ShoppingItem {
  id: string
  name: string
  qty: string
  checked: boolean
  category: string
}

export default function ShoppingListPage() {
  const [items, setItems] = useState<ShoppingItem[]>([
    { id: '1', name: '西兰花', qty: '1颗', checked: false, category: '蔬菜' },
    { id: '2', name: '胡萝卜', qty: '2根', checked: true, category: '蔬菜' },
    { id: '3', name: '猪排', qty: '300g', checked: false, category: '肉类' },
    { id: '4', name: '鸡蛋', qty: '6个', checked: false, category: '蛋奶' },
  ])

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, ShoppingItem[]>)

  const toggleItem = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
  }

  const checkedCount = items.filter(i => i.checked).length

  return (
    <AppLayout>
      <header className="px-6 pt-4 pb-4 shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-[28px] font-semibold text-[#0a0a0a]">买菜清单</h1>
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-[#0a0a0a] text-white active:scale-95 transition-transform">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[13px] text-[#a3a3a3] mt-1">
          {checkedCount}/{items.length} 已完成
        </p>
      </header>

      <ScrollArea className="px-6">
        {Object.entries(groupedItems).map(([category, list], categoryIndex) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.08 }}
            className="mb-6"
          >
            <h3 className="text-[13px] text-[#a3a3a3] uppercase tracking-wide mb-2 px-1">
              {category}
            </h3>
            <div className="bg-gray-50 rounded-2xl overflow-hidden">
              {list.map((item, index) => (
                <motion.label
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: categoryIndex * 0.08 + index * 0.05 }}
                  onClick={() => toggleItem(item.id)}
                  className={`flex items-center justify-between p-4 cursor-pointer active:bg-gray-100 transition-colors
                    ${index < list.length - 1 ? 'border-b border-gray-100' : ''}
                    ${item.checked ? 'opacity-50' : ''}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0
                      ${item.checked
                        ? 'bg-[#0a0a0a] border-[#0a0a0a]'
                        : 'border-[#a3a3a3]'}
                    `}>
                      {item.checked && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-[15px] ${item.checked ? 'line-through text-[#a3a3a3]' : 'text-[#0a0a0a]'}`}>
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[13px] text-[#737373]">{item.qty}</span>
                </motion.label>
              ))}
            </div>
          </motion.div>
        ))}

        <div className="h-8" />
      </ScrollArea>
    </AppLayout>
  )
}
