// app/delivery/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
  orderNumber: number
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

const statusFlow: Record<string, string[]> = {
  PENDENTE: ['EM_PREPARO', 'CANCELADO'],
  EM_PREPARO: ['SAIU_PARA_ENTREGA', 'CANCELADO'],
  SAIU_PARA_ENTREGA: ['ENTREGUE', 'CANCELADO'],
  ENTREGUE: [],
  CANCELADO: [],
}

export default function DeliveryDetalhesPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { showToast } = useToast()
  const [order, setOrder] = useState<DeliveryOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const fetchOrder = async () => {
    try {
      const data = await apiClient(`/api/delivery/${id}`, { method: 'GET' }, false)
      setOrder(data)
    } catch (error: any) {
      showToast(`❌ ${error.message || 'Erro ao carregar pedido'}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
  }, [id])

  const updateStatus = async (newStatus: string) => {
    if (!confirm(`Alterar status para "${statusLabels[newStatus as keyof typeof statusLabels]}"?`)) return

    setUpdating(true)
    try {
      await apiClient(`/api/delivery/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      }, false)
      showToast(`✅ Status atualizado para "${statusLabels[newStatus as keyof typeof statusLabels]}"`, 'success')
      fetchOrder()
    } catch (error: any) {
      showToast(`❌ ${error.message || 'Erro ao atualizar status'}`, 'error')
    } finally {
      setUpdating(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

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
        <p className="text-xl text-red-600">Pedido não encontrado</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 no-print">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🛵</span>
              <h1 className="text-2xl font-bold text-gray-800">
                Pedido #{formatOrderNumber(order.orderNumber, new Date(order.createdAt))}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[order.status]}`}
              >
                {statusLabels[order.status]}
              </span>
            </div>
            <div className="flex gap-3">
              {order.status === 'PENDENTE' && (
                <Link
                  href={`/delivery/${order.id}/editar`}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  ✏️ Editar Pedido
                </Link>
              )}
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                🖨️ Imprimir
              </button>
              <Link
                href="/delivery"
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-700 font-medium"
              >
                ← Voltar
              </Link>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Dados do cliente */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">👤 Cliente</h2>
            <div className="space-y-2 text-gray-700">
              <p><span className="font-medium">Nome:</span> {order.cliente}</p>
              <p><span className="font-medium">Telefone:</span> {order.telefone}</p>
              <p><span className="font-medium">Endereço:</span> {order.endereco}</p>
              {order.complemento && <p><span className="font-medium">Complemento:</span> {order.complemento}</p>}
              {order.referencia && <p><span className="font-medium">Referência:</span> {order.referencia}</p>}
              {order.pagamento && <p><span className="font-medium">Pagamento:</span> {order.pagamento}</p>}
              {order.observacao && <p><span className="font-medium">Observações:</span> {order.observacao}</p>}
              <p className="text-sm text-gray-400">{formatDate(order.createdAt)}</p>
            </div>
          </div>

          {/* Resumo e status */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 Resumo</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Itens</span>
                <span className="font-medium text-gray-700">{order.items.length}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2 text-green-700">
                <span className="text-2xl font-bold">Total</span>
                <span className="text-2xl font-bold text-green-700">R$ {order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Ações de status */}
            {order.status !== 'ENTREGUE' && order.status !== 'CANCELADO' && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Alterar status</h3>
                <div className="flex flex-wrap gap-2">
                  {statusFlow[order.status]?.map((newStatus) => (
                    <button
                      key={newStatus}
                      onClick={() => updateStatus(newStatus)}
                      disabled={updating}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors text-white ${
                        newStatus === 'CANCELADO'
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                    >
                      {statusLabels[newStatus as keyof typeof statusLabels]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Itens */}
        <div className="mt-6 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🛒 Itens</h2>
          {order.items.length === 0 ? (
            <p className="text-gray-500">Nenhum item.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <li key={item.id} className="py-3 flex justify-between items-center text-gray-700">
                  <div>
                    <span className="font-medium">{item.quantity}x</span>
                    <span className="ml-2">{item.product.name}</span>
                    {item.observacao && (
                      <span className="ml-2 text-sm text-gray-400">({item.observacao})</span>
                    )}
                  </div>
                  <span className="font-medium text-gray-700">
                    R$ {(item.quantity * item.unitPrice).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Botão de imprimir (somente na impressão) */}
        <div className="hidden print:block mt-8 text-center text-gray-400 text-sm">
          Comanda gerada em {new Date().toLocaleString('pt-BR')}
        </div>
      </div>
    </div>
  )
}