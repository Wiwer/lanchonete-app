// app/maintenance/page.tsx
import Link from 'next/link'

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
        <div className="text-7xl mb-4">🔧</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Em manutenção</h1>
        <p className="text-gray-600 mb-6">
          Estamos realizando melhorias no sistema. Volte em breve!
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}