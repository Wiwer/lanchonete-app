'use client'

import { useRouter } from 'next/navigation'
import { useToast } from '@/app/context/ToastContext'
import { apiClient } from '@/app/lib/apiClient' // <-- NOVA IMPORTAÇÃO

interface ConfirmarPagamentoButtonProps {
  orderId: string
  tableNumber: number
  total: number
}

export default function ConfirmarPagamentoButton({
  orderId,
  tableNumber,
  total,
}: ConfirmarPagamentoButtonProps) {
  const router = useRouter()
  const { showToast } = useToast()

  const handleConfirmar = async () => {
    if (!confirm(`Confirmar pagamento da mesa ${tableNumber} - R$ ${total.toFixed(2)}?`)) {
      return
    }

    try {
      await apiClient('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          action: 'confirmPayment',
          orderId,
        }),
      }, false)

      showToast(`✅ Pagamento da mesa ${tableNumber} confirmado!`, 'success')
      router.refresh()
    } catch (error: any) {
      showToast(`❌ ${error.message || 'Erro ao confirmar pagamento.'}`, 'error')
    }
  }

  return (
    <button
      onClick={handleConfirmar}
      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
    >
      <span>✅</span> Confirmar Pagamento
    </button>
  )
}