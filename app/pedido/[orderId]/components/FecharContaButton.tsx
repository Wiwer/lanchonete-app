'use client'

import { useRouter } from 'next/navigation'
import { useToast } from '@/app/context/ToastContext'
import { apiClient } from '@/app/lib/apiClient' // <-- NOVA IMPORTAÇÃO

interface FecharContaButtonProps {
  orderId: string
  total: number
}

export default function FecharContaButton({ orderId, total }: FecharContaButtonProps) {
  const router = useRouter()
  const { showToast } = useToast()

  const handleFecharConta = async () => {
    let mensagem = `Deseja fechar a conta no valor de R$ ${total.toFixed(2)}?`
    if (total === 0) {
      mensagem = 'Esta mesa não tem consumo. Deseja fechar a conta mesmo assim?'
    }
    if (!confirm(mensagem)) return

    try {
      await apiClient('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          action: 'close',
          orderId,
        }),
      }, false)

      showToast('✅ Conta enviada para fechamento!', 'success')
      router.refresh()
    } catch (error: any) {
      showToast(`❌ ${error.message || 'Erro ao fechar conta.'}`, 'error')
    }
  }

  return (
    <button
      onClick={handleFecharConta}
      className="mt-6 w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
    >
      Fechar Conta
    </button>
  )
}