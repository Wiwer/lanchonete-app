'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useToast } from '@/app/context/ToastContext'
import { formatOrderNumber } from '@/app/lib/formatOrderNumber'

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
  orderNumber: number
  total: number
  createdAt: string
  table: {
    number: number
  }
  items: OrderItem[]
}

interface Table {
  number: number
}

export default function HistoricoPage() {
  const { showToast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: '',
    mesas: [] as number[],
    totalMin: '',
    totalMax: '',
  })
  const [totalGeral, setTotalGeral] = useState(0)

  // Estado para o modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showModal, setShowModal] = useState(false)

  // Buscar lista de mesas
  const fetchTables = async () => {
    try {
      const res = await fetch('/api/tables')
      if (!res.ok) throw new Error('Erro ao buscar mesas')
      const data = await res.json()
      setTables(data)
    } catch (error) {
      showToast('❌ Erro ao carregar mesas', 'error')
    }
  }

  const buscarHistorico = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio)
      if (filtros.dataFim) params.append('dataFim', filtros.dataFim)
      if (filtros.mesas.length > 0) {
        params.append('mesas', filtros.mesas.join(','))
      }
      if (filtros.totalMin) params.append('totalMin', filtros.totalMin)
      if (filtros.totalMax) params.append('totalMax', filtros.totalMax)

      const res = await fetch(`/api/orders/history?${params.toString()}`)
      if (!res.ok) {
        const error = await res.json()
        showToast(`❌ ${error.error}`, 'error')
        return
      }
      const data = await res.json()
      setOrders(data)
      const total = data.reduce((acc: number, order: Order) => acc + order.total, 0)
      setTotalGeral(total)
    } catch (error) {
      showToast('❌ Erro ao carregar histórico', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    Promise.all([fetchTables(), buscarHistorico()])
  }, [])

  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFiltros({ ...filtros, [name]: value })
  }

  // Alternar seleção de mesa (badge clicável)
  const toggleMesa = (mesaNumber: number) => {
    setFiltros((prev) => {
      const alreadySelected = prev.mesas.includes(mesaNumber)
      if (alreadySelected) {
        return { ...prev, mesas: prev.mesas.filter((m) => m !== mesaNumber) }
      } else {
        return { ...prev, mesas: [...prev.mesas, mesaNumber] }
      }
    })
  }

  const limparFiltros = () => {
    setFiltros({
      dataInicio: '',
      dataFim: '',
      mesas: [],
      totalMin: '',
      totalMax: '',
    })
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const openModal = (order: Order) => {
    setSelectedOrder(order)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedOrder(null)
  }

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <span className="text-gray-500">Carregando histórico...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">📜</span>
              <h1 className="text-3xl font-bold text-gray-800">Histórico de Pedidos</h1>
              <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                {orders.length} pedidos
              </span>
              {totalGeral > 0 && (
                <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                  Total: R$ {totalGeral.toFixed(2)}
                </span>
              )}
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-700 font-medium flex items-center gap-2"
            >
              ← Voltar ao Admin
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">🔍 Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
              <input
                type="date"
                name="dataInicio"
                value={filtros.dataInicio}
                onChange={handleFiltroChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
              <input
                type="date"
                name="dataFim"
                value={filtros.dataFim}
                onChange={handleFiltroChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total (R$)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="totalMin"
                  placeholder="Mín"
                  value={filtros.totalMin}
                  onChange={handleFiltroChange}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <input
                  type="number"
                  name="totalMax"
                  placeholder="Máx"
                  value={filtros.totalMax}
                  onChange={handleFiltroChange}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Badges de mesas */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Mesas selecionadas</label>
            <div className="flex flex-wrap gap-2">
              {tables.map((table) => {
                const isSelected = filtros.mesas.includes(table.number)
                return (
                  <button
                    key={table.number}
                    onClick={() => toggleMesa(table.number)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      isSelected
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {table.number}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Clique para selecionar ou desmarcar uma mesa.
              {filtros.mesas.length > 0 && (
                <span className="ml-2 text-blue-600 font-medium">
                  ({filtros.mesas.length} selecionada(s))
                </span>
              )}
            </p>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={buscarHistorico}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              🔍 Filtrar
            </button>
            <button
              onClick={() => {
                limparFiltros()
                setTimeout(buscarHistorico, 100)
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Lista de pedidos */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-500">
            <span className="text-6xl block mb-4">📭</span>
            <p className="text-lg">Nenhum pedido encontrado com os filtros aplicados.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => openModal(order)}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer hover:bg-gray-50"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-700">
                        Mesa {order.table.number}
                      </span>
                      <span className="bg-gray-100 text-gray-700 text-sm font-semibold px-3 py-1 rounded-full">
                        Pedido #{formatOrderNumber(order.orderNumber, new Date(order.createdAt))}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      {formatarData(order.createdAt)}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      {order.items.length} item(ns)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-700">
                      R$ {order.total.toFixed(2)}
                    </div>
                    <span className="text-xs text-blue-600 hover:underline">🔍 Ver detalhes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalhes */}
      {showModal && selectedOrder && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Pedido #{formatOrderNumber(selectedOrder.orderNumber, new Date(selectedOrder.createdAt))} - Mesa {selectedOrder.table.number}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="mb-4 text-sm text-gray-500">
              {formatarData(selectedOrder.createdAt)}
            </div>

            {selectedOrder.items.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum item neste pedido.</p>
            ) : (
              <>
                <ul className="divide-y divide-gray-200">
                  {selectedOrder.items.map((item) => (
                    <li key={item.id} className="py-3 flex justify-between items-center">
                      <div>
                        <span className="font-medium">{item.quantity}x</span>
                        <span className="ml-2">{item.product.name}</span>
                      </div>
                      <span className="font-medium text-gray-700">
                        R$ {(item.quantity * item.unitPrice).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t-2 border-gray-300 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-green-700">R$ {selectedOrder.total.toFixed(2)}</span>
                </div>
              </>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}