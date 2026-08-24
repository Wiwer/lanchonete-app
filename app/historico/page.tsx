// app/historico/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useToast } from '@/app/context/ToastContext'

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
}

export default function HistoricoPage() {
  const { showToast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: '',
    mesa: '',
    totalMin: '',
    totalMax: '',
  })
  const [totalGeral, setTotalGeral] = useState(0)

  const buscarHistorico = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio)
      if (filtros.dataFim) params.append('dataFim', filtros.dataFim)
      if (filtros.mesa) params.append('mesa', filtros.mesa)
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
    buscarHistorico()
  }, [])

  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value })
  }

  const limparFiltros = () => {
    setFiltros({
      dataInicio: '',
      dataFim: '',
      mesa: '',
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
              <input
                type="date"
                name="dataInicio"
                value={filtros.dataInicio}
                onChange={handleFiltroChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
              <input
                type="date"
                name="dataFim"
                value={filtros.dataFim}
                onChange={handleFiltroChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mesa</label>
              <input
                type="number"
                name="mesa"
                placeholder="Número da mesa"
                value={filtros.mesa}
                onChange={handleFiltroChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
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
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
                <input
                  type="number"
                  name="totalMax"
                  placeholder="Máx"
                  value={filtros.totalMax}
                  onChange={handleFiltroChange}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
              </div>
            </div>
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
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-500">
            <span className="text-4xl block mb-4">⏳</span>
            <p className="text-lg">Carregando histórico...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-500">
            <span className="text-6xl block mb-4">📭</span>
            <p className="text-lg">Nenhum pedido encontrado com os filtros aplicados.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-700">
                        Mesa {order.table.number}
                      </span>
                      <span className="bg-gray-100 text-gray-700 text-sm font-semibold px-3 py-1 rounded-full">
                        Pedido #{order.id.slice(0, 6)}
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}