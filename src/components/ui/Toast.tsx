'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = { ...toast, id, duration: toast.duration ?? 3000 }
    setToasts(prev => [...prev, newToast])
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), newToast.duration)
    }
    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-20 left-0 right-0 pointer-events-none z-50 flex flex-col gap-3 p-4 max-w-sm mx-auto">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={() => onRemove(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const styles = {
    success: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', icon: <CheckCircle className="w-5 h-5" /> },
    error: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: <AlertCircle className="w-5 h-5" /> },
    warning: { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', icon: <AlertCircle className="w-5 h-5" /> },
    info: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: <Info className="w-5 h-5" /> },
  }
  const s = styles[toast.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      className={cn('pointer-events-auto flex items-center gap-3 p-4 rounded-xl border shadow-lg', s.bg)}
    >
      <div className={s.text}>{s.icon}</div>
      <p className={cn('flex-1 text-sm font-medium', s.text)}>{toast.message}</p>
      <button onClick={onRemove} className={cn('p-1 rounded hover:bg-black/5', s.text)}>
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}
