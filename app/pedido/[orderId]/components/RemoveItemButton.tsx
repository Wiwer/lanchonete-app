'use client'

import { useRouter } from 'next/navigation'
import { useToast } from '@/app/context/ToastContext'

interface RemoveItemButtonProps {
  orderId: string
  itemId: string
  quantity: number
}

export default function RemoveItemButton({
  orderId,
  itemId,
  quantity,
}: RemoveItemButtonProps) {
  const router = useRouter()
  const { showToast } = useToast()

  const handleDecrease = async () => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'removeItem',
          orderId,
          itemId,
          subAction: 'decrease',
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        showToast(`❌ ${error.error}`, 'error')
        return
      }

      router.refresh()
    } catch (error) {
      showToast('❌ Erro ao diminuir quantidade.', 'error')
    }
  }

  const handleRemove = async () => {
    if (!confirm('Remover este item completamente?')) return

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'removeItem',
          orderId,
          itemId,
          subAction: 'remove',
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        showToast(`❌ ${error.error}`, 'error')
        return
      }

      router.refresh()
    } catch (error) {
      showToast('❌ Erro ao remover item.', 'error')
    }
  }

  return (
    <div className="flex gap-1 ml-2">
      {quantity > 1 && (
        <button
          onClick={handleDecrease}
          className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded hover:bg-yellow-600 transition-colors"
          title="Diminuir quantidade"
        >
          −
        </button>
      )}
      <button
        onClick={handleRemove}
        className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 transition-colors"
        title="Remover item"
      >
        ✕
      </button>
    </div>
  )
}