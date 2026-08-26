'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

import { useToast } from '@/app/context/ToastContext'
import ComandaModal from '@/app/components/ComandaModal'
import { formatOrderNumber } from '@/app/lib/formatOrderNumber'

interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  product: { name: string }
}

interface Order {
  id: string
  total: number
  createdAt: string
  table: { number: number }
  items: OrderItem[]
  status: string
}

export default function GarcomPedidoPage() {
  const params = useParams()
  const orderId = params.orderId as string
  const { showToast } = useToast()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`)
        if (!res.ok) {
          const error = await res.json()
          showToast(`❌ ${error.error}`, 'error')
          return
        }
        const data = await res.json()
        setOrder(data)
      } catch (error) {
        showToast('❌ Erro ao carregar pedido', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [orderId, showToast])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <span className="text-gray-500">Carregando...</span>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <p className="text-xl text-red-600">Pedido não encontrado!</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Cabeçalho */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 no-print">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">
                🍽️ Mesa {order.table.number} - Pedido #{formatOrderNumber(order.orderNumber, order.createdAt)}
              </h1>
              <span
                className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${
                  order.status === 'OPEN'
                    ? 'bg-green-100 text-green-700'
                    : order.status === 'WAITING_PAYMENT'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {order.status === 'OPEN' && '🟢 Aberto'}
                {order.status === 'WAITING_PAYMENT' && '🟡 Aguardando pagamento'}
                {order.status === 'CLOSED' && '🔒 Fechado'}
              </span>
            </div>
            <div className="flex gap-3">
              <ComandaModal order={order} />
              <Link
                href="/garcom"
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-700 font-medium"
              >
                ← Voltar às mesas
              </Link>
            </div>
          </div>
        </div>

        {/* Corpo */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🛒 Itens consumidos</h2>
          {order.items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum item consumido ainda.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <li key={item.id} className="py-3 flex justify-between items-center text-gray-700">
                  <span>{item.quantity}x {item.product.name}</span>
                  <span className="font-bold text-green-600">R$ {(item.quantity * item.unitPrice).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 border-t pt-4 flex justify-between items-center">
            <span className="text-lg font-semibold text-green-700">Total:</span>
            <span className="text-2xl font-bold text-green-700">R$ {order.total.toFixed(2)}</span>
          </div>

          <div className="mt-6 no-print">
            <Link
              href={`/garcom/pedido/${order.id}/adicionar`}
              className="w-full block text-center py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              + Adicionar Itens
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}