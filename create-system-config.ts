import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db',
})
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.systemConfig.upsert({
    where: { id: 'single' },
    update: {},
    create: {
      id: 'single',
      maintenance: false,
    },
  })
  console.log('✅ Configuração do sistema criada com sucesso!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())