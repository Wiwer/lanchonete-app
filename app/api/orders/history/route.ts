// app/api/orders/history/route.ts
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { NextResponse } from 'next/server'

const adapter = new PrismaBetterSqlite3({
  url: `file:${process.cwd()}/dev.db`,
})
const prisma = new PrismaClient({ adapter })

// Função para converter data local (Brasília) para UTC
function localToUTC(date: Date): Date {
  // Subtrai 3 horas (fuso de Brasília é UTC-3)
  const utcDate = new Date(date)
  utcDate.setHours(utcDate.getHours() - 3)
  return utcDate
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dataInicio = searchParams.get('dataInicio')
    const dataFim = searchParams.get('dataFim')
    const mesa = searchParams.get('mesa')
    const totalMin = searchParams.get('totalMin')
    const totalMax = searchParams.get('totalMax')

    const where: any = {
      status: 'CLOSED',
    }

    if (dataInicio) {
      const parts = dataInicio.split('-')
      const year = parseInt(parts[0])
      const month = parseInt(parts[1]) - 1 // mês base 0
      const day = parseInt(parts[2])
      // Data local (Brasília) às 00:00:00
      const localStart = new Date(year, month, day, 0, 0, 0, 0)
      // Converte para UTC
      const utcStart = localToUTC(localStart)
      where.createdAt = { ...where.createdAt, gte: utcStart }
    }

    if (dataFim) {
      const parts = dataFim.split('-')
      const year = parseInt(parts[0])
      const month = parseInt(parts[1]) - 1
      const day = parseInt(parts[2])
      // Data local (Brasília) às 23:59:59
      const localEnd = new Date(year, month, day, 23, 59, 59, 999)
      const utcEnd = localToUTC(localEnd)
      where.createdAt = { ...where.createdAt, lte: utcEnd }
    }

    if (mesa) {
      const mesaNumber = parseInt(mesa)
      if (!isNaN(mesaNumber)) {
        where.table = {
          number: mesaNumber,
        }
      }
    }

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