// app/api/tables/free/route.ts
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { NextResponse } from 'next/server'

const adapter = new PrismaBetterSqlite3({
  url: `file:${process.cwd()}/dev.db`,
})
const prisma = new PrismaClient({ adapter })

export async function GET() {
  try {
    const tables = await prisma.table.findMany({
      include: {
        orders: {
          where: { status: 'OPEN' },
          select: { id: true },
        },
      },
      orderBy: { number: 'asc' }, // <-- ordena numericamente
    })

    const freeTables = tables
      .filter((table) => table.orders.length === 0)
      .map((table) => table.number)

    return NextResponse.json(freeTables, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar mesas livres:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}