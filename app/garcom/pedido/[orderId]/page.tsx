// app/garcom/pedido/[orderId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/app/context/ToastContext'
import ComandaModal from '@/app/components/ComandaModal'

interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  product: {
    name: string
  }
}

interface Order {
  id: string
  total: number
  createdAt: string
  table: {
    number: number
  }
  items: OrderItem[]
  status: string
}

export default function GarcomPedidoPage() {
  const router = useRouter()
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
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 no-print">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">
                🍽️ Mesa {order.table.number} - Pedido #{order.id.slice(0, 6)}
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

        <div className="bg-white rounded-xl shadow-md p-6">
          <div id="comanda">
            <div className="text-center border-b pb-2 mb-4">
              <h2 className="text-xl font-bold">🍽️ COMANDA</h2>
              <p>Mesa {order.table.number}</p>
              <p className="text-sm text-gray-500">Pedido #{order.id.slice(0, 8)}</p>
              <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString('pt-BR')}</p>
              <p className="text-sm text-gray-500">Status: {order.status === 'OPEN' ? 'Aberto' : order.status === 'WAITING_PAYMENT' ? 'Aguardando Pagamento' : 'Fechado'}</p>
            </div>

            {order.items.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum item consumido ainda.</p>
            ) : (
              <>
                <ul className="divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <li key={item.id} className="py-2 flex justify-between">
                      <span>{item.quantity}x {item.product.name}</span>
                      <span>R$ {(item.quantity * item.unitPrice).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t-2 border-gray-300 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>R$ {order.total.toFixed(2)}</span>
                </div>
              </>
            )}
            <div className="text-center text-sm text-gray-400 mt-6 border-t pt-4">
              Obrigado pela preferência!
            </div>
          </div>

          <div className="mt-6 pt-4 border-t no-print">
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