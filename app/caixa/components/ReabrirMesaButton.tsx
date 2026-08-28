'use client'

import { useRouter } from 'next/navigation'
import { useToast } from '@/app/context/ToastContext'
import { apiClient } from '@/app/lib/apiClient' // <-- NOVA IMPORTAÇÃO

interface ReabrirMesaButtonProps {
  orderId: string
  tableNumber: number
}

export default function ReabrirMesaButton({
  orderId,
  tableNumber,
}: ReabrirMesaButtonProps) {
  const router = useRouter()
  const { showToast } = useToast()

  const handleReabrir = async () => {
    if (!confirm(`Deseja reabrir a mesa ${tableNumber} para fazer alterações?`)) {
      return
    }

    try {
      const order = await apiClient('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          action: 'reopen',
          orderId,
        }),
      }, false)

      showToast(`✅ Mesa ${tableNumber} reaberta com sucesso!`, 'success')
      router.push(`/pedido/${order.id}`)
    } catch (error: any) {
      showToast(`❌ ${error.message || 'Erro ao reabrir mesa.'}`, 'error')
    }
  }

  return (
    <button
      onClick={handleReabrir}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
    >
      <span>🔁</span> Reabrir Mesa
    </button>
  )
}