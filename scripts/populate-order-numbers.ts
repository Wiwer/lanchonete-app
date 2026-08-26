// scripts/populate-order-numbers.ts
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db',
})
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🔄 Populando números de pedido para pedidos existentes...')

  // Buscar todos os pedidos ordenados por data
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, createdAt: true },
  })

  // Agrupar por data
  const grouped: { [date: string]: string[] } = {}
  for (const order of orders) {
    const dateStr = order.createdAt.toISOString().split('T')[0]
    if (!grouped[dateStr]) grouped[dateStr] = []
    grouped[dateStr].push(order.id)
  }

  // Para cada data, atualizar os pedidos com números sequenciais
  for (const [date, ids] of Object.entries(grouped)) {
    console.log(`📅 Atualizando pedidos de ${date}...`)
    let count = 1
    for (const id of ids) {
      await prisma.order.update({
        where: { id },
        data: { orderNumber: count },
      })
      count++
    }

    // Criar ou atualizar a sequência para essa data
    const lastNumber = ids.length
    await prisma.orderSequence.upsert({
      where: { date },
      update: { lastNumber },
      create: { date, lastNumber },
    })
    console.log(`   ✅ ${ids.length} pedidos atualizados, último número: ${lastNumber}`)
  }

  console.log('✅ População concluída!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())