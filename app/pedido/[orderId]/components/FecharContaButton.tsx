'use client'

import { useRouter } from 'next/navigation'
import { useToast } from '@/app/context/ToastContext'

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
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'close',
          orderId,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        showToast(`❌ Erro: ${error.error}`, 'error')
        return
      }

      showToast('✅ Conta enviada para fechamento!', 'success')
      router.refresh()
    } catch (error) {
      showToast('❌ Erro ao fechar conta. Tente novamente.', 'error')
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