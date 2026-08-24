'use client'

import { useRef } from 'react'

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
  const printRef = useRef<HTMLDivElement>(null)

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

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML
    if (!printContent) return

    const win = window.open('', '_blank')
    if (!win) return

    win.document.write(`
      <html>
        <head>
          <title>Comanda</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
            .comanda-header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 15px; }
            .comanda-header h2 { margin: 0; font-size: 24px; }
            .comanda-header p { margin: 4px 0; color: #555; }
            .comanda-item { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #ccc; }
            .comanda-total { display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; margin-top: 15px; padding-top: 10px; border-top: 3px double #333; }
            .comanda-rodape { text-align: center; font-size: 12px; color: #888; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px; }
            .text-gray-500 { color: #6b7280; }
            .text-center { text-align: center; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `)
    win.document.close()
    win.print()
    win.close()
  }

  return (
    <>
      <button
        onClick={() => {
          const modal = document.getElementById('comanda-modal')
          if (modal) {
            modal.classList.remove('hidden')
          }
        }}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
      >
        🖨️ Imprimir Comanda
      </button>

      <div
        id="comanda-modal"
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            document.getElementById('comanda-modal')?.classList.add('hidden')
          }
        }}
      >
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
          <div ref={printRef} className="comanda-content">
            <div className="comanda-header">
              <h2 className="text-2xl font-bold text-center text-gray-900">🍽️ COMANDA</h2>
              <p className="text-center text-gray-700">Mesa {order.table.number}</p>
              <p className="text-center text-gray-700">Pedido #{order.id.slice(0, 8)}</p>
              <p className="text-center text-gray-600">{formatDate(order.createdAt)}</p>
              <p className="text-center text-sm text-gray-500">Status: {statusLabel}</p>
            </div>

            {order.items.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum item consumido ainda.</p>
            ) : (
              <>
                <ul className="divide-y divide-gray-200 mt-4">
                  {order.items.map((item) => (
                    <li key={item.id} className="py-2 flex justify-between text-gray-800">
                      <span>{item.quantity}x {item.product.name}</span>
                      <span className="font-medium">R$ {(item.quantity * item.unitPrice).toFixed(2)}</span>
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
              onClick={() => {
                document.getElementById('comanda-modal')?.classList.add('hidden')
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-800"
            >
              Fechar
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              🖨️ Imprimir
            </button>
          </div>
        </div>
      </div>
    </>
  )
}