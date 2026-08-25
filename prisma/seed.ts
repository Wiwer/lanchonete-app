import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db',
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Iniciando seed...')

  // 1. Criar Categorias
  console.log('📁 Criando categorias...')
  const categorias = {
    lanches: await prisma.category.upsert({
      where: { name: 'Lanches' },
      update: {},
      create: { name: 'Lanches', description: 'Hambúrgueres e sanduíches' },
    }),
    bebidas: await prisma.category.upsert({
      where: { name: 'Bebidas' },
      update: {},
      create: { name: 'Bebidas', description: 'Refrigerantes, sucos e bebidas' },
    }),
    sobremesas: await prisma.category.upsert({
      where: { name: 'Sobremesas' },
      update: {},
      create: { name: 'Sobremesas', description: 'Doces e milkshakes' },
    }),
  }
  console.log('✅ Categorias criadas!')

  // 2. Criar Produtos
  console.log('📦 Criando produtos...')
  const products = [
    // Lanches
    { name: 'X-Burguer', price: 25.0, categoryId: categorias.lanches.id },
    { name: 'X-Salada', price: 22.0, categoryId: categorias.lanches.id },
    { name: 'X-Bacon', price: 28.0, categoryId: categorias.lanches.id },
    { name: 'Vegetariano', price: 24.0, categoryId: categorias.lanches.id },
    // Bebidas
    { name: 'Coca-Cola (Lata)', price: 8.0, categoryId: categorias.bebidas.id },
    { name: 'Guaraná (Lata)', price: 7.0, categoryId: categorias.bebidas.id },
    { name: 'Suco de Laranja', price: 10.0, categoryId: categorias.bebidas.id },
    { name: 'Água Mineral', price: 5.0, categoryId: categorias.bebidas.id },
    // Sobremesas
    { name: 'Milkshake', price: 15.0, categoryId: categorias.sobremesas.id },
    { name: 'Petit Gateau', price: 18.0, categoryId: categorias.sobremesas.id },
    { name: 'Pudim', price: 12.0, categoryId: categorias.sobremesas.id },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: {
        price: product.price,
        categoryId: product.categoryId,
        active: true,
      },
      create: {
        name: product.name,
        price: product.price,
        categoryId: product.categoryId,
        active: true,
      },
    })
  }
  console.log('✅ Produtos criados!')

  // 3. Criar mesas (mantido)
  console.log('🪑 Criando mesas...')
  for (let i = 1; i <= 10; i++) {
    await prisma.table.upsert({
      where: { number: i },
      update: {},
      create: { number: i },
    })
  }
  console.log('✅ Mesas 1 a 10 criadas!')

  // 4. Criar configuração do gerente (mantido)
  console.log('🔐 Criando configuração do gerente...')
  await prisma.gerenteConfig.upsert({
    where: { id: 'single' },
    update: {},
    create: {
      id: 'single',
      senha: '1234',
    },
  })
  console.log('✅ Configuração do gerente criada com senha 1234')

  console.log('🌱 Seed concluído!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })