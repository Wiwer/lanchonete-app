// app/page.tsx
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Link from 'next/link'

const adapter = new PrismaBetterSqlite3({
  url: `file:${process.cwd()}/dev.db`,
})
const prisma = new PrismaClient({ adapter })

export default async function Home() {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: {
      products: {
        where: { active: true },
        orderBy: { name: 'asc' },
      },
    },
  })

    // Linha de depuração (vai aparecer no terminal do servidor)
  console.log('📍 Categorias na ordem:', categories.map(c => ({ name: c.name, order: c.order })))

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🍔 Cardápio da Lanchonete</h1>
          <Link
            href="/admin"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            ⚙️ Admin
          </Link>
        </div>

        {categories.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum produto disponível no momento.</p>
        ) : (
          categories.map((category) => {
            const products = category.products
            if (products.length === 0) return null
            return (
              <div key={category.id} className="mb-8 last:mb-0">
                <h2 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2">
                  {category.name}
                </h2>
                <ul className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <li key={product.id} className="py-3 flex justify-between items-center">
                      <div>
                        <span className="text-lg font-medium text-gray-700">{product.name}</span>
                        {product.description && (
                          <span className="ml-2 text-sm text-gray-400">- {product.description}</span>
                        )}
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        R$ {product.price.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}