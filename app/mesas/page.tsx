// app/mesas/page.tsx
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Link from 'next/link'
import TableCard from '@/app/components/TableCard'
import AutoRefresh from '@/app/components/AutoRefresh'

const adapter = new PrismaBetterSqlite3({
  url: `file:${process.cwd()}/dev.db`,
})
const prisma = new PrismaClient({ adapter })

export default async function MesasPage() {
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
  const totalAguardando = tables.filter(t =>
    t.orders.some(o => o.status === 'WAITING_PAYMENT')
  ).length

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <AutoRefresh interval={10000} />
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:justify-center">
            <div className="flex items-center gap-3">
              <span className="text-4xl">📋</span>
              <h1 className="text-3xl font-bold text-gray-800">Mesas</h1>
              <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                {totalOcupadas} ocupadas
              </span>
              {totalAguardando > 0 && (
                <span className="bg-yellow-100 text-yellow-800 text-sm font-semibold px-3 py-1 rounded-full">
                  {totalAguardando} aguardando
                </span>
              )}
            </div>
            {/* <div className="flex gap-3">
              <Link
                href="/"
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-700 font-medium flex items-center gap-2"
              >
                <span>←</span> Cardápio
              </Link> 
              <Link
                href="/admin/cardapio"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                📋 Gerenciar Cardápio
              </Link>
              <Link
                href="/caixa"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                💳 Pagamentos
                {totalAguardando > 0 && (
                  <span className="bg-white text-purple-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    {totalAguardando}
                  </span>
                )}
              </Link>
            </div> */}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tables.map((table) => {
            const order = table.orders[0]
            const occupied = !!order
            const orderStatus = order?.status

            return (
              <TableCard
                key={table.id}
                number={table.number}
                occupied={occupied}
                orderId={order?.id}
                total={order?.total}
                orderStatus={orderStatus}
              />
            )
          })}
        </div>

        <div className="mt-8 text-center text-sm text-gray-400">
          ✅ Check-point 2: Listagem de mesas com status (agora interativas)
        </div>
      </div>
    </div>
  )
}