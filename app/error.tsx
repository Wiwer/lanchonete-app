// app/error.tsx
'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Opcional: enviar erro para um serviço de monitoramento
    console.error('Erro capturado:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
        <div className="text-7xl mb-4">⚠️</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">500</h1>
        <h2 className="text-xl font-semibold text-gray-600 mb-4">Erro interno do servidor</h2>
        <p className="text-gray-500 mb-6">
          Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}