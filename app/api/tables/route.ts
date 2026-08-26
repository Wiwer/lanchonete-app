// app/api/tables/route.ts
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
      orderBy: { number: 'asc' },
      select: { number: true },
    })
    return NextResponse.json(tables, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar mesas:', error)
    return NextResponse.json({ error: 'Erro ao buscar mesas' }, { status: 500 })
  }
}