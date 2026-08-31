// app/delivery/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useToast } from '@/app/context/ToastContext'
import { apiClient } from '@/app/lib/apiClient'
import { formatOrderNumber } from '@/app/lib/formatOrderNumber'

interface DeliveryItem {
  id: string
  quantity: number
  unitPrice: number
  product: { name: string }
  observacao: string | null
}

interface DeliveryOrder {
  id: string
  cliente: string
  telefone: string
  endereco: string
  complemento: string | null
  referencia: string | null
  status: 'PENDENTE' | 'EM_PREPARO' | 'SAIU_PARA_ENTREGA' | 'ENTREGUE' | 'CANCELADO'
  pagamento: string | null
  observacao: string | null
  total: number
  createdAt: string
  items: DeliveryItem[]
}

const statusColors = {
  PENDENTE: 'bg-yellow-100 text-yellow-800',
  EM_PREPARO: 'bg-blue-100 text-blue-800',
  SAIU_PARA_ENTREGA: 'bg-purple-100 text-purple-800',
  ENTREGUE: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-red-100 text-red-800',
}

const statusLabels = {
  PENDENTE: 'Pendente',
  EM_PREPARO: 'Em preparo',
  SAIU_PARA_ENTREGA: 'Saiu para entrega',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
}

export default function DeliveryPage() {
  const { showToast } = useToast()
  const [orders, setOrders] = useState<DeliveryOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('todos')

  const fetchOrders = async () => {
    try {
      const data = await apiClient('/api/delivery', { method: 'GET' }, false)
      setOrders(data)
    } catch (error: any) {
      showToast(`❌ ${error.message || 'Erro ao carregar pedidos'}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const filteredOrders = filter === 'todos'
    ? orders
    : orders.filter((order) => order.status === filter)

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🛵</span>
              <h1 className="text-3xl font-bold text-gray-800">Pedidos Delivery</h1>
              <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                {orders.length} pedidos
              </span>
            </div>
            <div className="flex gap-3">
              <Link
                href="/delivery/novo"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <span>+</span> Novo Pedido
              </Link>
              <Link
                href="/admin"
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-700 font-medium"
              >
                ← Voltar ao Admin
              </Link>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('todos')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'todos'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todos
            </button>
            {Object.entries(statusLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-500">
            <span className="text-4xl block mb-4">⏳</span>
            <p className="text-lg">Carregando pedidos...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-500">
            <span className="text-6xl block mb-4">📭</span>
            <p className="text-lg">Nenhum pedido encontrado.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Link
                key={order.id}
                href={`/delivery/${order.id}`}
                className="block bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow hover:bg-gray-50"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-800">
                        {formatOrderNumber(order.orderNumber, new Date(order.createdAt))}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}
                      >
                        {statusLabels[order.status]}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      {order.telefone} • {order.endereco}
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      {formatDate(order.createdAt)} • {order.items.length} item(ns)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-700">
                      R$ {order.total.toFixed(2)}
                    </div>
                    <span className="text-xs text-blue-600 hover:underline">🔍 Ver detalhes</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}