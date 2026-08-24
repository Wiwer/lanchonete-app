// app/api/orders/history/route.ts
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { NextResponse } from 'next/server'

const adapter = new PrismaBetterSqlite3({
  url: `file:${process.cwd()}/dev.db`,
})
const prisma = new PrismaClient({ adapter })

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dataInicio = searchParams.get('dataInicio')
    const dataFim = searchParams.get('dataFim')
    const mesa = searchParams.get('mesa')
    const totalMin = searchParams.get('totalMin')
    const totalMax = searchParams.get('totalMax')

    // Construir filtros
    const where: any = {
      status: 'CLOSED',
    }

    // Filtro por data
    if (dataInicio) {
      const start = new Date(dataInicio)
      start.setHours(0, 0, 0, 0)
      where.createdAt = { ...where.createdAt, gte: start }
    }
    if (dataFim) {
      const end = new Date(dataFim)
      end.setHours(23, 59, 59, 999)
      where.createdAt = { ...where.createdAt, lte: end }
    }

    // Filtro por mesa
    if (mesa) {
      const mesaNumber = parseInt(mesa)
      if (!isNaN(mesaNumber)) {
        where.table = {
          number: mesaNumber,
        }
      }
    }

    // Filtro por total
    if (totalMin) {
      const min = parseFloat(totalMin)
      if (!isNaN(min)) {
        where.total = { ...where.total, gte: min }
      }
    }
    if (totalMax) {
      const max = parseFloat(totalMax)
      if (!isNaN(max)) {
        where.total = { ...where.total, lte: max }
      }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        table: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(orders, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar histórico:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar histórico' },
      { status: 500 }
    )
  }
}