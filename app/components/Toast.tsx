'use client'

import { useToast } from '@/app/context/ToastContext'
import { useEffect, useState } from 'react'

export default function Toast() {
  const { toasts, removeToast } = useToast()
  const [visible, setVisible] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    // Controla animação de entrada
    const newVisible: { [key: string]: boolean } = {}
    toasts.forEach((toast) => {
      if (!visible[toast.id]) {
        newVisible[toast.id] = true
      }
    })
    setVisible((prev) => ({ ...prev, ...newVisible }))
  }, [toasts])

  const handleRemove = (id: string) => {
    setVisible((prev) => ({ ...prev, [id]: false }))
    setTimeout(() => {
      removeToast(id)
    }, 200)
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => {
        const isVisible = visible[toast.id] !== false

        const bgColor =
          toast.type === 'success'
            ? 'bg-green-600'
            : toast.type === 'error'
            ? 'bg-red-600'
            : toast.type === 'warning'
            ? 'bg-yellow-600'
            : 'bg-blue-600'

        const icon =
          toast.type === 'success'
            ? '✅'
            : toast.type === 'error'
            ? '❌'
            : toast.type === 'warning'
            ? '⚠️'
            : 'ℹ️'

        return (
          <div
            key={toast.id}
            className={`
              ${bgColor} text-white rounded-xl shadow-2xl p-4 flex items-start gap-3
              transition-all duration-300 ease-out
              ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
            `}
          >
            <span className="text-xl leading-none mt-0.5">{icon}</span>
            <p className="flex-1 text-sm font-medium leading-relaxed">
              {toast.message}
            </p>
            <button
              onClick={() => handleRemove(toast.id)}
              className="text-white/70 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}