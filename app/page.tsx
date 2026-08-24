import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db',
})

const prisma = new PrismaClient({ adapter })

export default async function Home() {
  const products = await prisma.product.findMany({
    where: { active: true }, // <-- adicione isso
    orderBy: { name: 'asc' },
  })

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          🍔 Cardápio da Lanchonete
        </h1>

        {products.length === 0 ? (
          <p className="text-gray-500 text-center">Nenhum produto cadastrado ainda.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {products.map((product) => (
              <li key={product.id} className="py-3 flex justify-between items-center">
                <span className="text-lg font-medium text-gray-700">{product.name}</span>
                <span className="text-lg font-bold text-green-600">
                  R$ {product.price.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 text-center text-sm text-gray-400">
          ✅ Check-point 1: Banco conectado e produtos listados!
        </div>
      </div>
    </div>
  )
}