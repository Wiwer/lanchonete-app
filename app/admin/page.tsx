// app/admin/page.tsx
import Link from 'next/link'

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-4xl">⚙️</span> Painel Administrativo
          </h1>
          <p className="text-gray-500 mt-1">Gerencie todas as áreas do sistema.</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card: Mesas */}
          <Link
            href="/mesas"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow flex items-center gap-4"
          >
            <span className="text-5xl">📋</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Mesas</h2>
              <p className="text-gray-500">Visualizar e gerenciar mesas</p>
            </div>
          </Link>

          {/* Card: Fechamentos */}
          <Link
            href="/fechamentos"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow flex items-center gap-4"
          >
            <span className="text-5xl">💳</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Fechamentos</h2>
              <p className="text-gray-500">Confirmar pagamentos pendentes</p>
            </div>
          </Link>

          {/* Card: Gerenciar Cardápio */}
          <Link
            href="/admin/cardapio"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow flex items-center gap-4"
          >
            <span className="text-5xl">📝</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Gerenciar Cardápio</h2>
              <p className="text-gray-500">Adicionar, editar ou desativar produtos</p>
            </div>
          </Link>

          {/* Card: Cardápio (página pública) */}
          <Link
            href="/"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow flex items-center gap-4"
          >
            <span className="text-5xl">🍔</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Cardápio</h2>
              <p className="text-gray-500">Visualizar cardápio público</p>
            </div>
          </Link>
          
          <Link
            href="/historico"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow flex items-center gap-4"
          > 
            <span className="text-5xl">📜</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Histórico</h2>
              <p className="text-gray-500">Ver pedidos finalizados</p>
            </div>
          </Link>

        <Link
          href="/admin/categorias"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow flex items-center gap-4"
        >
          <span className="text-5xl">📂</span>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Categorias</h2>
            <p className="text-gray-500">Gerenciar categorias de produtos</p>
          </div>
        </Link>

        <Link
          href="/admin/dashboard"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow flex items-center gap-4"
        >
          <span className="text-5xl">📊</span>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
            <p className="text-gray-500">Visualizar métricas de vendas</p>
          </div>
        </Link>


        </div>

        

        {/* Rodapé */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <span>🔐 Acesso restrito ao gerente</span>
        </div>
      </div>
    </div>
  )
}