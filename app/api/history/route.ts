// app/api/history/route.ts
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { NextResponse } from 'next/server'

const adapter = new PrismaBetterSqlite3({
  url: `file:${process.cwd()}/dev.db`,
})
const prisma = new PrismaClient({ adapter })

function localToUTC(date: Date): Date {
  // Adiciona 3 horas (Brasília é UTC-3, então para converter data local para UTC soma 3)
  const utcDate = new Date(date)
  utcDate.setHours(utcDate.getHours() + 3)
  return utcDate
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dataInicio = searchParams.get('dataInicio')
    const dataFim = searchParams.get('dataFim')
    const tipo = searchParams.get('tipo') || 'todos'
    const mesa = searchParams.get('mesa')
    const totalMin = searchParams.get('totalMin')
    const totalMax = searchParams.get('totalMax')
    const search = searchParams.get('search') || ''

    let results: any[] = []

    // 1. Buscar pedidos de SALÃO (Order)
    if (tipo === 'todos' || tipo === 'mesa') {
      const whereMesa: any = { status: 'CLOSED' }

      if (dataInicio) {
        const parts = dataInicio.split('-')
        const localStart = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 0, 0, 0, 0)
        whereMesa.createdAt = { ...whereMesa.createdAt, gte: localToUTC(localStart) }
      }
      if (dataFim) {
        const parts = dataFim.split('-')
        const localEnd = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 23, 59, 59, 999)
        whereMesa.createdAt = { ...whereMesa.createdAt, lte: localToUTC(localEnd) }
      }
      if (mesa && tipo === 'mesa') {
        const mesaNumber = parseInt(mesa)
        if (!isNaN(mesaNumber)) {
          whereMesa.table = { number: mesaNumber }
        }
      }
      if (totalMin) {
        const min = parseFloat(totalMin)
        if (!isNaN(min)) whereMesa.total = { ...whereMesa.total, gte: min }
      }
      if (totalMax) {
        const max = parseFloat(totalMax)
        if (!isNaN(max)) whereMesa.total = { ...whereMesa.total, lte: max }
      }
      if (search) {
        const searchNumber = parseInt(search)
        if (!isNaN(searchNumber)) {
          whereMesa.orderNumber = searchNumber
        }
      }

      const mesaOrders = await prisma.order.findMany({
        where: whereMesa,
        include: {
          table: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      mesaOrders.forEach((order: any) => {
        results.push({
          ...order,
          tipo: 'mesa',
          cliente: `Mesa ${order.table.number}`,
          endereco: null,
          telefone: null,
        })
      })
    }

    // 2. Buscar pedidos de DELIVERY
    if (tipo === 'todos' || tipo === 'delivery') {
      const whereDelivery: any = {
        status: { in: ['ENTREGUE', 'CANCELADO'] },
      }

      if (dataInicio) {
        const parts = dataInicio.split('-')
        const localStart = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 0, 0, 0, 0)
        whereDelivery.createdAt = { ...whereDelivery.createdAt, gte: localToUTC(localStart) }
      }
      if (dataFim) {
        const parts = dataFim.split('-')
        const localEnd = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 23, 59, 59, 999)
        whereDelivery.createdAt = { ...whereDelivery.createdAt, lte: localToUTC(localEnd) }
      }
      if (totalMin) {
        const min = parseFloat(totalMin)
        if (!isNaN(min)) whereDelivery.total = { ...whereDelivery.total, gte: min }
      }
      if (totalMax) {
        const max = parseFloat(totalMax)
        if (!isNaN(max)) whereDelivery.total = { ...whereDelivery.total, lte: max }
      }
      if (search) {
        const searchNumber = parseInt(search)
        if (!isNaN(searchNumber)) {
          whereDelivery.orderNumber = searchNumber
        } else {
          whereDelivery.cliente = { contains: search }
        }
      }

      const deliveryOrders = await prisma.deliveryOrder.findMany({
        where: whereDelivery,
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      deliveryOrders.forEach((order: any) => {
        results.push({
          ...order,
          tipo: 'delivery',
          cliente: order.cliente,
          endereco: order.endereco,
          telefone: order.telefone,
        })
      })
    }

    // Ordenar por data decrescente
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(results, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar histórico:', error)
    return NextResponse.json({ error: 'Erro ao buscar histórico' }, { status: 500 })
  }
}