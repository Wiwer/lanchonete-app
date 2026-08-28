'use client'

import { useRouter } from 'next/navigation'
import { useToast } from '@/app/context/ToastContext'
import { apiClient } from '@/app/lib/apiClient' // <-- NOVA IMPORTAÇÃO

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
      await apiClient('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          action: 'addItem',
          orderId,
          productId,
          quantity: 1,
        }),
      }, false)

      router.refresh()
    } catch (error: any) {
      showToast(`❌ ${error.message || 'Erro ao adicionar item.'}`, 'error')
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