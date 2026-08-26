// app/fechamentos/page.tsx
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Link from 'next/link'
import ConfirmarPagamentoButton from './components/ConfirmarPagamentoButton'
import ReabrirMesaButton from './components/ReabrirMesaButton'
import AutoRefresh from '@/app/components/AutoRefresh'
import { formatOrderNumber } from '@/app/lib/formatOrderNumber'

const adapter = new PrismaBetterSqlite3({
  url: `file:${process.cwd()}/dev.db`,
})
const prisma = new PrismaClient({ adapter })

export default async function FechamentosPage() {
  const orders = await prisma.order.findMany({
    where: { status: 'WAITING_PAYMENT' },
    include: {
      table: true,
      items: { include: { product: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <AutoRefresh interval={10000} />
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-center items-center gap-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl">💳</span>
              <h1 className="text-3xl font-bold text-gray-800">Fechamentos</h1>
              <span className="bg-yellow-100 text-yellow-800 text-sm font-semibold px-3 py-1 rounded-full">
                {orders.length} aguardando
              </span>
            </div>
            {/* <Link
              href="/mesas"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-700 font-medium flex items-center gap-2"
            >
              ← Voltar às mesas
            </Link> */}
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-500">
            <span className="text-6xl block mb-4">🎉</span>
            <p className="text-lg">Nenhuma mesa aguardando pagamento no momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-lg transition-shadow"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-700">
                      Mesa {order.table.number}
                    </span>
                    <span className="bg-yellow-100 text-yellow-700 text-sm font-semibold px-3 py-1 rounded-full">
                      🟡 Aguardando
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    {order.items.length} item(ns) • Total:{' '}
                    <span className="font-bold text-green-600">R$ {order.total.toFixed(2)}</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    Pedido: {formatOrderNumber(order.orderNumber, order.createdAt)} • {new Date(order.createdAt).toLocaleTimeString()}
                  </div>
                </div>
                <div className="flex gap-3">
                  <ReabrirMesaButton
                    orderId={order.id}
                    tableNumber={order.table.number}
                  />
                  <ConfirmarPagamentoButton
                    orderId={order.id}
                    tableNumber={order.table.number}
                    total={order.total}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}