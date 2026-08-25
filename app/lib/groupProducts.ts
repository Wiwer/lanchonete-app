// app/lib/groupProducts.ts

interface Product {
  id: string
  name: string
  price: number
  active: boolean
  categoryId: string | null
  category?: {
    id: string
    name: string
    description?: string | null
  } | null
}

interface CategoryGroup {
  categoryId: string | null
  categoryName: string
  products: Product[]
}

export function groupProductsByCategory(products: Product[]): CategoryGroup[] {
  const groups: CategoryGroup[] = []

  // Primeiro, produtos sem categoria
  const withoutCategory = products.filter((p) => !p.categoryId)
  if (withoutCategory.length > 0) {
    groups.push({
      categoryId: null,
      categoryName: 'Outros',
      products: withoutCategory,
    })
  }

  // Agrupar por categoriaId
  const categoryMap = new Map<string, Product[]>()
  products
    .filter((p) => p.categoryId)
    .forEach((p) => {
      const key = p.categoryId!
      if (!categoryMap.has(key)) {
        categoryMap.set(key, [])
      }
      categoryMap.get(key)!.push(p)
    })

  // Para cada categoria, buscar o nome e montar o grupo
  const categoryIds = Array.from(categoryMap.keys())
  for (const catId of categoryIds) {
    const productList = categoryMap.get(catId)!
    const category = productList[0].category // todos têm a mesma categoria, pega do primeiro
    groups.push({
      categoryId: catId,
      categoryName: category?.name || 'Categoria',
      products: productList,
    })
  }

  // Ordenar grupos por nome da categoria
  groups.sort((a, b) => a.categoryName.localeCompare(b.categoryName))

  return groups
}