'use client'

import { useState } from 'react'

interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  product: {
    name: string
  }
}

interface ModalComandaProps {
  orderId: string
  tableNumber: number
  items: OrderItem[]
  total: number
  createdAt: string
  status: string
}

export default function ModalComanda({
  orderId,
  tableNumber,
  items,
  total,
  createdAt,
  status,
}: ModalComandaProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handlePrint = () => {
    // Força a impressão do conteúdo do modal
    const printContent = document.getElementById('comanda-modal')
    if (!printContent) return
    const originalContents = document.body.innerHTML
    document.body.innerHTML = printContent.outerHTML
    window.print()
    document.body.innerHTML = originalContents
    window.location.reload()
  }

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
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">📄 Resumo do Pedido</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            {/* Comanda para impressão */}
            <div id="comanda-modal" className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="text-center border-b pb-3 mb-3">
                <h3 className="text-xl font-bold">🍽️ COMANDA</h3>
                <p className="text-sm text-gray-600">Mesa {tableNumber}</p>
                <p className="text-sm text-gray-600">Pedido #{orderId.slice(0, 8)}</p>
                <p className="text-sm text-gray-500">{new Date(createdAt).toLocaleString('pt-BR')}</p>
                <p className="text-sm text-gray-500">Status: {status === 'OPEN' ? 'Aberto' : status === 'WAITING_PAYMENT' ? 'Aguardando Pagamento' : 'Fechado'}</p>
              </div>
              {items.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Nenhum item</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <li key={item.id} className="flex justify-between py-2 text-sm">
                      <span>{item.quantity}x {item.product.name}</span>
                      <span className="font-medium">R$ {(item.quantity * item.unitPrice).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-3 mt-3">
                <span>Total</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
              <div className="text-center text-xs text-gray-400 mt-4 border-t pt-2">
                Obrigado pela preferência!
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-700 font-medium"
              >
                Fechar
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
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