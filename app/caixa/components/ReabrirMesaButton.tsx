'use client'

import { useRouter } from 'next/navigation'

interface ReabrirMesaButtonProps {
  orderId: string
  tableNumber: number
}

export default function ReabrirMesaButton({
  orderId,
  tableNumber,
}: ReabrirMesaButtonProps) {
  const router = useRouter()

  const handleReabrir = async () => {
    if (!confirm(`Deseja reabrir a mesa ${tableNumber} para fazer alterações?`)) {
      return
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reopen',
          orderId,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(`Erro: ${error.error}`)
        return
      }

      const order = await res.json()
      router.push(`/pedido/${order.id}`)
    } catch (error) {
      alert('Erro ao reabrir mesa.')
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