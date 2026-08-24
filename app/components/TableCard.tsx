'use client'
import { useRouter } from 'next/navigation'

interface TableCardProps {
  number: number
  occupied: boolean
  orderId?: string
  total?: number
  orderStatus?: string
}

export default function TableCard({
  number,
  occupied,
  orderId,
  total,
  orderStatus,
}: TableCardProps) {
  const router = useRouter()

  const handleClick = async () => {
    if (occupied && orderId) {
      router.push(`/pedido/${orderId}`)
      return
    }

    if (!occupied) {
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'open', tableNumber: number }),
        })
        if (!res.ok) {
          const error = await res.json()
          alert(`Erro: ${error.error}`)
          return
        }
        const order = await res.json()
        router.push(`/pedido/${order.id}`)
      } catch (error) {
        alert('Erro ao abrir mesa. Tente novamente.')
      }
    }
  }

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl shadow-md p-4 border-t-4 transition-transform hover:scale-105 cursor-pointer"
      style={{ borderTopColor: occupied ? (orderStatus === 'WAITING_PAYMENT' ? '#eab308' : '#ef4444') : '#22c55e' }}
    >
      <div className="flex flex-col items-center">
        <div className="text-4xl font-bold text-gray-700">{number}</div>
        <div className="mt-2 text-sm font-medium">
          {occupied ? (
            <span className={orderStatus === 'WAITING_PAYMENT' ? 'text-yellow-600' : 'text-red-600'}>
              {orderStatus === 'WAITING_PAYMENT' ? '🟡 Aguardando' : '🔴 Ocupada'}
            </span>
          ) : (
            <span className="text-green-600">🟢 Livre</span>
          )}
        </div>
        {occupied && total !== undefined && (
          <div className="mt-1 text-xs text-gray-500">
            Total: R$ {total.toFixed(2)}
          </div>
        )}
        <div className="mt-3 w-full py-2 px-3 rounded-lg text-sm font-semibold text-center bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
          {occupied ? 'Ver pedido →' : 'Abrir Mesa'}
        </div>
      </div>
    </div>
  )
}