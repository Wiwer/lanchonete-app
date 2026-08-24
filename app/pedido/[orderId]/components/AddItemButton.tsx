'use client'

import { useRouter } from 'next/navigation'
import { useToast } from '@/app/context/ToastContext'

interface AddItemButtonProps {
  orderId: string
  productId: string
  productName: string
}

export default function AddItemButton({
  orderId,
  productId,
  productName,
}: AddItemButtonProps) {
  const router = useRouter()
  const { showToast } = useToast()

  const handleAdd = async () => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addItem',
          orderId,
          productId,
          quantity: 1,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        showToast(`❌ ${error.error}`, 'error')
        return
      }

      router.refresh()
    } catch (error) {
      showToast('❌ Erro ao adicionar item.', 'error')
    }
  }

  return (
    <button
      onClick={handleAdd}
      className="ml-2 px-3 py-1 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
    >
      + Adicionar
    </button>
  )
}