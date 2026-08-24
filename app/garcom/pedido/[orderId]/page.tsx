// app/garcom/pedido/[orderId]/page.tsx
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const adapter = new PrismaBetterSqlite3({
  url: `file:${process.cwd()}/dev.db`,
})
const prisma = new PrismaClient({ adapter })

export default async function GarcomPedidoPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params

  // Busca o pedido com seus itens
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      table: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  })

  if (!order) {
    notFound()
  }

  // Verifica se o pedido está aberto (para mostrar mensagem adequada)
  const isOpen = order.status === 'OPEN'

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                🍽️ Mesa {order.table.number}
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  isOpen ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {isOpen ? '🟢 Aberto' : '🟡 Aguardando pagamento'}
                </span>
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Pedido #{order.id.slice(0, 6)} • {new Date(order.createdAt).toLocaleString('pt-BR')}
              </p>
            </div>
            <Link
              href="/garcom"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-700 font-medium flex items-center gap-2"
            >
              ← Voltar às mesas
            </Link>
          </div>
        </div>

        {/* Itens já enviados (somente leitura) */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
            🛒 Itens da comanda
          </h2>
          {order.items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum item adicionado ainda.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <li key={item.id} className="py-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full min-w-[32px] text-center">
                      {item.quantity}
                    </span>
                    <span className="font-medium text-gray-800">{item.product.name}</span>
                    <span className="text-sm text-gray-400">R$ {item.unitPrice.toFixed(2)} cada</span>
                  </div>
                  <span className="font-bold text-green-600">
                    R$ {(item.quantity * item.unitPrice).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 border-t pt-4 flex justify-between items-center">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-2xl font-bold text-green-700">
              R$ {order.total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Aviso para o garçom */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center text-blue-700">
          {isOpen ? (
            <span>📌 Itens mostrados aqui já foram enviados e não podem mais ser alterados.</span>
          ) : (
            <span>📌 Este pedido está aguardando pagamento. Não é possível adicionar itens.</span>
          )}
        </div>
      </div>
    </div>
  )
}