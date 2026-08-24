'use client'

import { useState } from 'react'

interface ComandaModalProps {
  order: {
    id: string
    total: number
    createdAt: string
    table: { number: number }
    items: Array<{
      id: string
      quantity: number
      unitPrice: number
      product: { name: string }
    }>
    status: string
  }
}

export default function ComandaModal({ order }: ComandaModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!order) return null

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const statusLabel =
    order.status === 'OPEN'
      ? 'Aberto'
      : order.status === 'WAITING_PAYMENT'
      ? 'Aguardando Pagamento'
      : 'Fechado'

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
      >
        🖨️ Imprimir Comanda
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div id="comanda-modal">
              <div className="text-center border-b pb-4 mb-4">
                <h2 className="text-2xl font-bold">🍽️ COMANDA</h2>
                <p className="text-gray-600">Mesa {order.table.number}</p>
                <p className="text-gray-600">Pedido #{order.id.slice(0, 8)}</p>
                <p className="text-gray-500 text-sm">{formatDate(order.createdAt)}</p>
                <p className="text-sm text-gray-500">Status: {statusLabel}</p>
              </div>

              {order.items.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum item consumido ainda.</p>
              ) : (
                <>
                  <ul className="divide-y divide-gray-200">
                    {order.items.map((item) => (
                      <li key={item.id} className="py-2 flex justify-between">
                        <span>
                          {item.quantity}x {item.product.name}
                        </span>
                        <span className="font-medium">
                          R$ {(item.quantity * item.unitPrice).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t-2 border-gray-300 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>R$ {order.total.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="text-center text-sm text-gray-400 mt-6 border-t pt-4">
                Obrigado pela preferência!
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                🖨️ Imprimir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}