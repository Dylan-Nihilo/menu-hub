'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearAll: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = { ...toast, id, duration: toast.duration ?? 3000 }

    setToasts(prev => [...prev, newToast])

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => removeToast(id), newToast.duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

// Toast 容器组件
function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 pointer-events-none z-50 flex flex-col gap-3 p-4 max-w-sm mx-auto">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => onRemove(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// 单个 Toast 组件
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const bgColor = {
    success: 'bg-success-50 border-success-200',
    error: 'bg-error/10 border-error/20',
    warning: 'bg-warning/10 border-warning/20',
    info: 'bg-info/10 border-info/20',
  }

  const textColor = {
    success: 'text-success-700',
    error: 'text-error',
    warning: 'text-warning',
    info: 'text-info',
  }

  const iconColor = {
    success: 'text-success-500',
    error: 'text-error',
    warning: 'text-warning',
    info: 'text-info',
  }

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 100, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 100, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border',
        'shadow-lg backdrop-blur-sm',
        bgColor[toast.type]
      )}
    >
      <div className={cn('flex-shrink-0 mt-0.5', iconColor[toast.type])}>
        {icons[toast.type]}
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', textColor[toast.type])}>
          {toast.message}
        </p>
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick()
              onRemove()
            }}
            className={cn(
              'mt-2 text-xs font-medium',
              textColor[toast.type],
              'hover:opacity-80 transition-opacity'
            )}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={onRemove}
        className={cn(
          'flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors',
          textColor[toast.type]
        )}
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

// 导入 cn 函数
import { cn } from '@/lib/utils/cn'
