'use client'

import { ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' }

export function Dialog({ open, onOpenChange, title, description, children, footer, size = 'md' }: DialogProps) {
  const handleClose = () => onOpenChange(false)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
              'bg-white rounded-2xl shadow-xl z-50 w-[calc(100%-32px)]',
              sizes[size]
            )}
          >
            {title && (
              <div className="flex items-start justify-between p-6 border-b border-neutral-200">
                <div>
                  <h2 className="text-lg font-semibold">{title}</h2>
                  {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
                </div>
                <button onClick={handleClose} className="p-2 hover:bg-neutral-100 rounded-lg">
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>
            )}
            <div className="p-6">{children}</div>
            {footer && <div className="p-6 border-t border-neutral-200">{footer}</div>}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function useDialog(initialOpen = false) {
  const [open, setOpen] = useState(initialOpen)
  return { open, onOpenChange: setOpen, openDialog: () => setOpen(true), closeDialog: () => setOpen(false) }
}
