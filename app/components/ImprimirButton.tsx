'use client'

export default function ImprimirButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
    >
      🖨️ Imprimir Comanda
    </button>
  )
}