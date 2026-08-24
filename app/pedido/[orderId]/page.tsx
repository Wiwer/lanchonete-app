// app/pedido/[orderId]/page.tsx
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Link from 'next/link'
import AddItemButton from './components/AddItemButton'
import FecharContaButton from './components/FecharContaButton'
import RemoveItemButton from './components/RemoveItemButton'
import TransferirMesaButton from './components/TransferirMesaButton'
import CancelarAberturaButton from './components/CancelarAberturaButton'
import ImprimirButton from '@/app/components/ImprimirButton'

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
    where: { active: true },
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
        {/* Cabeçalho com botão de impressão */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 no-print">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">
                🍽️ Mesa {order.table.number} - Pedido #{order.id.slice(0, 6)}
              </h1>
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
            <div className="flex gap-3">
              <ImprimirButton />  {/* substitui o botão antigo */}
              <Link href="/mesas" className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-700 font-medium">
                ← Voltar às mesas
              </Link>
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cardápio - Admin (no-print) */}
          <div className="bg-white rounded-xl shadow-md p-6 no-print">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">📋 Cardápio</h2>
            <ul className="divide-y divide-gray-200">
              {products.map((product) => (
                <li key={product.id} className="py-3 flex justify-between items-center">
                  <div>
                    <span className="font-medium text-gray-800">{product.name}</span>
                    <span className="ml-2 text-sm text-gray-500">R$ {product.price.toFixed(2)}</span>
                  </div>
                  <AddItemButton orderId={order.id} productId={product.id} productName={product.name} />
                </li>
              ))}
            </ul>
          </div>

          {/* COMANDA - Esta seção será impressa */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div id="comanda">
              <div className="comanda-header">
                <h2>🍽️ COMANDA</h2>
                <p>Mesa {order.table.number}</p>
                <p>Pedido #{order.id.slice(0, 8)}</p>
                <p>{new Date(order.createdAt).toLocaleString('pt-BR')}</p>
                <p className="text-sm text-gray-500">Status: {order.status === 'OPEN' ? 'Aberto' : order.status === 'WAITING_PAYMENT' ? 'Aguardando Pagamento' : 'Fechado'}</p>
              </div>

              {order.items.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum item consumido ainda.</p>
              ) : (
                <>
                  <ul>
                    {order.items.map((item) => (
                      <li key={item.id} className="comanda-item">
                        <span>{item.quantity}x {item.product.name}</span>
                        <span>R$ {(item.quantity * item.unitPrice).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="comanda-total">
                    <span>Total</span>
                    <span>R$ {order.total.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="comanda-rodape">
                Obrigado pela preferência!
              </div>
            </div>

            {/* Botões de ação (não imprimem) */}
            <div className="mt-6 border-t pt-4 no-print">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-green-700">R$ {order.total.toFixed(2)}</span>
              </div>

              <FecharContaButton orderId={order.id} total={order.total} />
              <TransferirMesaButton orderId={order.id} currentTableNumber={order.table.number} />
              <CancelarAberturaButton orderId={order.id} tableNumber={order.table.number} disabled={order.items.length > 0} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}