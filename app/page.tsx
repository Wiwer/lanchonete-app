import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Link from 'next/link'

const adapter = new PrismaBetterSqlite3({
  url: `file:${process.cwd()}/dev.db`,
})
const prisma = new PrismaClient({ adapter })

export default async function Home() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: {
      category: true,
    },
    orderBy: [
      { category: { name: 'asc' } },
      { name: 'asc' },
    ],
  })

  // Agrupar produtos por categoria
  const groupedProducts = products.reduce((acc, product) => {
    const categoryName = product.category?.name || 'Outros'
    if (!acc[categoryName]) {
      acc[categoryName] = []
    }
    acc[categoryName].push(product)
    return acc
  }, {} as Record<string, typeof products>)

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🍔 Cardápio da Lanchonete</h1>
        </div>

        {Object.keys(groupedProducts).length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum produto disponível no momento.</p>
        ) : (
          Object.entries(groupedProducts).map(([categoryName, prods]) => (
            <div key={categoryName} className="mb-8 last:mb-0">
              <h2 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2">
                {categoryName}
              </h2>
              <ul className="divide-y divide-gray-200">
                {prods.map((product) => (
                  <li key={product.id} className="py-3 flex justify-between items-center">
                    <div>
                      <span className="text-lg font-medium text-gray-700">{product.name}</span>
                      {product.description && (
                        <p className="text-sm text-gray-500">{product.description}</p>
                      )}
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      R$ {product.price.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}

        <div className="mt-6 text-center text-sm text-gray-400">
          ✅ Cardápio atualizado com categorias!
        </div>
      </div>
    </div>
  )
}