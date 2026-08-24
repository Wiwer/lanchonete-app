'use client'

import { useRouter } from 'next/navigation'
import { useToast } from '@/app/context/ToastContext'

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
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirmPayment',
          orderId,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        showToast(`❌ Erro: ${error.error}`, 'error')
        return
      }

      showToast(`✅ Pagamento da mesa ${tableNumber} confirmado!`, 'success')
      router.refresh()
    } catch (error) {
      showToast('❌ Erro ao confirmar pagamento.', 'error')
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