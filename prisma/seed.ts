import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db',
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Iniciando seed...')

  // 1. Criar 10 mesas
  for (let i = 1; i <= 10; i++) {
    await prisma.table.upsert({
      where: { number: i },
      update: {},
      create: { number: i },
    })
  }
  console.log('✅ Mesas 1 a 10 criadas!')

  // 2. Criar produtos
  const products = [
    { name: 'X-Burguer', price: 25.0 },
    { name: 'X-Salada', price: 22.0 },
    { name: 'Batata Frita', price: 12.0 },
    { name: 'Coca-Cola (Lata)', price: 8.0 },
    { name: 'Milkshake', price: 15.0 },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: {},
      create: product,
    })
  }
  console.log('✅ Produtos do cardápio criados!')

  // 3. Criar alguns pedidos de exemplo
  const mesa1 = await prisma.table.findUnique({ where: { number: 1 } })
  const mesa2 = await prisma.table.findUnique({ where: { number: 2 } })
  const xBurguer = await prisma.product.findUnique({ where: { name: 'X-Burguer' } })
  const batata = await prisma.product.findUnique({ where: { name: 'Batata Frita' } })
  const coca = await prisma.product.findUnique({ where: { name: 'Coca-Cola (Lata)' } })

  if (mesa1 && xBurguer && batata) {
    const order1 = await prisma.order.create({
      data: {
        tableId: mesa1.id,
        status: 'OPEN',
        total: 25.0 + 12.0,
        items: {
          create: [
            { productId: xBurguer.id, quantity: 1, unitPrice: 25.0 },
            { productId: batata.id, quantity: 1, unitPrice: 12.0 },
          ],
        },
      },
    })
    console.log(`✅ Mesa 1 aberta com pedido ${order1.id}`)
  }

  if (mesa2 && coca) {
    const order2 = await prisma.order.create({
      data: {
        tableId: mesa2.id,
        status: 'OPEN',
        total: 8.0,
        items: {
          create: [{ productId: coca.id, quantity: 1, unitPrice: 8.0 }],
        },
      },
    })
    console.log(`✅ Mesa 2 aberta com pedido ${order2.id}`)
  }

  // 4. Criar configuração do gerente (senha padrão)
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