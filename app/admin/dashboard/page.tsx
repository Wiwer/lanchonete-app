// app/admin/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useToast } from '@/app/context/ToastContext'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface DashboardData {
  day: { revenue: number; orders: number; avg: number; change: number }
  week: { revenue: number; orders: number; avg: number; change: number }
  month: { revenue: number; orders: number; avg: number; change: number }
  topItems: Array<{ name: string; total: number }>
  last7Days: Array<{ date: string; total: number }>
  categorySales: Array<{ name: string; value: number }>
  hourlyData: Array<{ hora: number; pedidos: number }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function DashboardPage() {
  const { showToast } = useToast()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tipo, setTipo] = useState<'todos' | 'mesa' | 'delivery'>('todos')

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`/api/dashboard?tipo=${tipo}`)
      if (!res.ok) {
        const error = await res.json()
        showToast(`❌ ${error.error}`, 'error')
        return
      }
      const data = await res.json()
      setData(data)
    } catch (error) {
      showToast('❌ Erro ao carregar dashboard', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchDashboard()
  }, [tipo])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <span className="text-gray-500">Carregando dados do dashboard...</span>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <p className="text-xl text-red-600">Erro ao carregar dados do dashboard.</p>
      </div>
    )
  }

  const formatChange = (change: number) => {
    if (change === 0) return '↔️ 0%'
    const sign = change > 0 ? '📈' : '📉'
    return `${sign} ${Math.abs(change).toFixed(1)}%`
  }

  const changeColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-500'
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">📊</span>
              <h1 className="text-3xl font-bold text-gray-800">Dashboard de Vendas</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Filtrar por:</span>
              <button
                onClick={() => setTipo('todos')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  tipo === 'todos'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setTipo('mesa')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  tipo === 'mesa'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Salão
              </button>
              <button
                onClick={() => setTipo('delivery')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  tipo === 'delivery'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Delivery
              </button>
              <Link
                href="/admin"
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-700 font-medium flex items-center gap-2"
              >
                ← Voltar ao Admin
              </Link>
            </div>
          </div>
        </div>

        {/* Cards métricos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Faturamento do Dia</p>
                <p className="text-3xl font-bold text-gray-800">R$ {data.day.revenue.toFixed(2)}</p>
                <p className="text-sm text-gray-500 mt-1">{data.day.orders} pedidos</p>
                <p className="text-sm text-gray-500 mt-1">Ticket médio: R$ {data.day.avg.toFixed(2)}</p>
                <p className={`text-sm font-medium ${changeColor(data.day.change)}`}>
                  {formatChange(data.day.change)} em relação a ontem
                </p>
              </div>
              <span className="text-4xl">📅</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Faturamento da Semana</p>
                <p className="text-3xl font-bold text-gray-800">R$ {data.week.revenue.toFixed(2)}</p>
                <p className="text-sm text-gray-500 mt-1">{data.week.orders} pedidos</p>
                <p className="text-sm text-gray-500 mt-1">Ticket médio: R$ {data.week.avg.toFixed(2)}</p>
                <p className={`text-sm font-medium ${changeColor(data.week.change)}`}>
                  {formatChange(data.week.change)} em relação à semana passada
                </p>
              </div>
              <span className="text-4xl">📆</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Faturamento do Mês</p>
                <p className="text-3xl font-bold text-gray-800">R$ {data.month.revenue.toFixed(2)}</p>
                <p className="text-sm text-gray-500 mt-1">{data.month.orders} pedidos</p>
                <p className="text-sm text-gray-500 mt-1">Ticket médio: R$ {data.month.avg.toFixed(2)}</p>
                <p className={`text-sm font-medium ${changeColor(data.month.change)}`}>
                  {formatChange(data.month.change)} em relação ao mês passado
                </p>
              </div>
              <span className="text-4xl">📈</span>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">📊 Vendas dos Últimos 7 Dias</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.last7Days}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Faturamento']}
                  />
                  <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">🍽️ Vendas por Categoria</h2>
            {data.categorySales.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum dado disponível.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.categorySales}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.categorySales.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} itens`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">🕐 Distribuição de Pedidos por Hora (últimos 7 dias)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="hora"
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(hora) => `${hora}h`}
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  formatter={(value) => [`${value} pedidos`, '']}
                  labelFormatter={(hora) => `${hora}h`}
                />
                <Bar dataKey="pedidos" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Itens mais vendidos */}
        <div className="mt-6 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">🏆 Itens Mais Vendidos (últimos 7 dias)</h2>
          {data.topItems.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum item vendido nos últimos 7 dias.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.topItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full font-bold text-lg">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.total} unidades vendidas</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}