// app/garcom/page.tsx
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Link from 'next/link'
import AutoRefresh from '@/app/components/AutoRefresh'

const adapter = new PrismaBetterSqlite3({
  url: `file:${process.cwd()}/dev.db`,
})
const prisma = new PrismaClient({ adapter })

export default async function GarcomPage() {
  const tables = await prisma.table.findMany({
    include: {
      orders: {
        where: {
          status: { in: ['OPEN', 'WAITING_PAYMENT'] }
        },
        select: { id: true, total: true, status: true },
      },
    },
    orderBy: { number: 'asc' },
  })

  const totalOcupadas = tables.filter(t => t.orders.length > 0).length

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <AutoRefresh interval={10000} />
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">👨‍🍳</span>
              <h1 className="text-3xl font-bold text-gray-800">Garçom - Mesas</h1>
              <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                {totalOcupadas} ocupadas
              </span>
            </div>
          </div>
        </div>

        {/* Grid de mesas */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tables.map((table) => {
            const order = table.orders[0]
            const occupied = !!order
            const orderId = order?.id

            return (
              <div
                key={table.id}
                className="bg-white rounded-xl shadow-md p-4 border-t-4 cursor-pointer hover:shadow-lg transition-shadow"
                style={{ borderTopColor: occupied ? '#ef4444' : '#22c55e' }}
              >
                <div className="flex flex-col items-center">
                  <div className="text-4xl font-bold text-gray-700">{table.number}</div>
                  <div className="mt-2 text-sm font-medium">
                    {occupied ? (
                      <span className="text-red-600">🔴 Ocupada</span>
                    ) : (
                      <span className="text-green-600">🟢 Livre</span>
                    )}
                  </div>
                  {occupied && order && (
                    <div className="mt-1 text-xs text-gray-900">
                      Total: R$ {order.total.toFixed(2)}
                    </div>
                  )}
                  {occupied ? (
                    <div className="mt-3 w-full flex flex-col gap-2">
                      <Link
                        href={`/garcom/pedido/${orderId}`}
                        className="w-full py-2 px-3 rounded-lg text-sm font-semibold text-center bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                      >
                        Ver Pedido
                      </Link>
                      <Link
                        href={`/garcom/pedido/${orderId}/adicionar`}
                        className="w-full py-2 px-3 rounded-lg text-sm font-semibold text-center bg-green-600 hover:bg-green-700 text-white transition-colors"
                      >
                        + Adicionar Itens
                      </Link>
                    </div>
                  ) : (
                    <Link
                      href={`/garcom/pedido/novo?mesa=${table.number}`}
                      className="mt-3 w-full py-2 px-3 rounded-lg text-sm font-semibold text-center bg-green-600 hover:bg-green-700 text-white transition-colors"
                    >
                      Abrir Mesa
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 text-center text-sm text-gray-400">
          👨‍🍳 Área exclusiva para garçom
        </div>
      </div>
    </div>
  )
}