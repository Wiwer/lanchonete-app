// app/pedido/[orderId]/page.tsx
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Link from 'next/link'
import AddItemButton from './components/AddItemButton'
import FecharContaButton from './components/FecharContaButton'
import RemoveItemButton from './components/RemoveItemButton'
import TransferirMesaButton from './components/TransferirMesaButton'
import CancelarAberturaButton from './components/CancelarAberturaButton'

const adapter = new PrismaBetterSqlite3({
  url: `file:${process.cwd()}/dev.db`,
})
const prisma = new PrismaClient({ adapter })

export default async function PedidoPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params

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

  const products = await prisma.product.findMany({
    where: { active: true }, // <-- adicionar este filtro
    orderBy: { name: 'asc' },
  })

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-600">Pedido não encontrado!</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho do pedido */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              🍽️ Mesa {order.table.number} - Pedido #{order.id.slice(0, 6)}
            </h1>
            <Link href="/mesas" className="text-blue-600 hover:text-blue-800">
              ← Voltar às mesas
            </Link>
          </div>
          <div className="mt-2">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cardápio */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              📋 Cardápio
            </h2>
            <ul className="divide-y divide-gray-200">
              {products.map((product) => (
                <li
                  key={product.id}
                  className="py-3 flex justify-between items-center"
                >
                  <div>
                    <span className="font-medium text-gray-800">
                      {product.name}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      R$ {product.price.toFixed(2)}
                    </span>
                  </div>
                  <AddItemButton
                    orderId={order.id}
                    productId={product.id}
                    productName={product.name}
                  />
                </li>
              ))}
            </ul>
          </div>

          {/* Itens consumidos (VERSÃO MELHORADA) */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              🛒 Itens consumidos
            </h2>
            {order.items.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhum item consumido ainda.
              </p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="py-4 hover:bg-gray-50 transition-colors rounded-lg px-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Badge com quantidade */}
                        <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full min-w-[32px] text-center">
                          {item.quantity}
                        </span>
                        <span className="font-medium text-gray-800">
                          {item.product.name}
                        </span>
                        <span className="text-sm text-gray-400">
                          R$ {item.unitPrice.toFixed(2)} cada
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-green-700">
                          R$ {(item.quantity * item.unitPrice).toFixed(2)}
                        </span>
                        <RemoveItemButton
                          orderId={order.id}
                          itemId={item.id}
                          quantity={item.quantity}
                        />
                      </div>
                    </div>
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

            <FecharContaButton orderId={order.id} total={order.total} />
          <TransferirMesaButton
  orderId={order.id}
  currentTableNumber={order.table.number}
/>
          <CancelarAberturaButton
            orderId={order.id}
            tableNumber={order.table.number}
            disabled={order.items.length > 0} // <-- isso faz o botão sumir quando há itens
          />
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-400">
          ✅ Check-point 4: Adição de itens ao pedido
        </div>
      </div>
    </div>
  )
}