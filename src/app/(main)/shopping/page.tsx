'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, X } from 'lucide-react'
import { AppLayout, ScrollArea } from '@/components/layout'

const defaultCategories = ['蔬菜', '肉类', '蛋奶', '调味料', '其他']

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
  const [showAddModal, setShowAddModal] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', qty: '', category: '蔬菜' })

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

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const addItem = () => {
    if (!newItem.name.trim()) return
    setItems([...items, {
      id: Date.now().toString(),
      ...newItem,
      checked: false
    }])
    setNewItem({ name: '', qty: '', category: '蔬菜' })
    setShowAddModal(false)
  }

  const clearCompleted = () => {
    setItems(items.filter(item => !item.checked))
  }

  const checkedCount = items.filter(i => i.checked).length

  return (
    <AppLayout>
      <header className="px-6 pt-4 pb-4 shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-[28px] font-semibold text-[#0a0a0a]">买菜清单</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FF6B6B] text-white active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-[13px] text-[#a3a3a3]">
            {checkedCount}/{items.length} 已完成
          </p>
          {checkedCount > 0 && (
            <button
              onClick={clearCompleted}
              className="text-[12px] text-[#FF6B6B] font-medium"
            >
              清空已完成
            </button>
          )}
        </div>
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
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="w-1 h-4 bg-[#FF6B6B] rounded-full" />
              <h3 className="text-[13px] text-[#666] font-medium">{category}</h3>
              <span className="text-[12px] text-[#a3a3a3]">({list.length})</span>
            </div>
            <div className="bg-gray-50 rounded-2xl overflow-hidden">
              {list.map((item, index) => (
                <motion.label
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: categoryIndex * 0.08 + index * 0.05 }}
                  onClick={() => toggleItem(item.id)}
                  className={`flex items-center justify-between p-4 cursor-pointer active:bg-gray-100 transition-colors group
                    ${index < list.length - 1 ? 'border-b border-gray-100' : ''}
                    ${item.checked ? 'opacity-50' : ''}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0
                      ${item.checked
                        ? 'bg-[#FF6B6B] border-[#FF6B6B]'
                        : 'border-[#d4d4d4]'}
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
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-[#737373]">{item.qty}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteItem(item.id)
                      }}
                      className="p-1 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </motion.label>
              ))}
            </div>
          </motion.div>
        ))}

        <div className="h-8" />
      </ScrollArea>

      {/* 添加项目 Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 z-50"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#0a0a0a]">添加购物项</h2>
                <button onClick={() => setShowAddModal(false)} className="p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="物品名称"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full h-12 px-4 bg-gray-100 rounded-xl text-[15px] placeholder:text-[#a3a3a3] outline-none focus:ring-2 focus:ring-[#FF6B6B]"
                />

                <input
                  type="text"
                  placeholder="数量，如：2个"
                  value={newItem.qty}
                  onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })}
                  className="w-full h-12 px-4 bg-gray-100 rounded-xl text-[15px] placeholder:text-[#a3a3a3] outline-none focus:ring-2 focus:ring-[#FF6B6B]"
                />

                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full h-12 px-4 bg-gray-100 rounded-xl text-[15px] outline-none focus:ring-2 focus:ring-[#FF6B6B]"
                >
                  {defaultCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <button
                  onClick={addItem}
                  className="w-full h-12 bg-[#FF6B6B] text-white rounded-xl text-[15px] font-medium active:scale-[0.98] transition-transform"
                >
                  添加
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  )
}
