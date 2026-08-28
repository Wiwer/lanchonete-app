// app/api/dashboard/route.ts
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { NextResponse } from 'next/server'

const adapter = new PrismaBetterSqlite3({
  url: `file:${process.cwd()}/dev.db`,
})
const prisma = new PrismaClient({ adapter })

// Função auxiliar para converter data local (Brasília) para UTC
function localToUTC(date: Date): Date {
  const utcDate = new Date(date)
  utcDate.setHours(utcDate.getHours() - 3)
  return utcDate
}

// Busca métricas para um modelo específico (Order ou DeliveryOrder)
async function getMetrics(model: 'order' | 'delivery', startDate: Date, endDate: Date) {
  const where: any = {
    createdAt: { gte: startDate, lt: endDate },
  }
  if (model === 'order') {
    where.status = 'CLOSED'
    const orders = await prisma.order.findMany({
      where,
      select: { total: true },
    })
    const total = orders.reduce((sum, o) => sum + o.total, 0)
    const count = orders.length
    const avg = count > 0 ? total / count : 0
    return { total, count, avg }
  } else {
    // Para delivery, consideramos apenas status ENTREGUE (faturamento)
    where.status = 'ENTREGUE'
    const orders = await prisma.deliveryOrder.findMany({
      where,
      select: { total: true },
    })
    const total = orders.reduce((sum, o) => sum + o.total, 0)
    const count = orders.length
    const avg = count > 0 ? total / count : 0
    return { total, count, avg }
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo') || 'todos' // 'mesa', 'delivery', 'todos'

    // Determinar quais modelos consultar
    const models: ('order' | 'delivery')[] = []
    if (tipo === 'mesa') models.push('order')
    else if (tipo === 'delivery') models.push('delivery')
    else models.push('order', 'delivery')

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const startOfLastWeek = new Date(startOfWeek)
    startOfLastWeek.setDate(startOfWeek.getDate() - 7)
    const startOfLastMonth = new Date(startOfMonth)
    startOfLastMonth.setMonth(startOfMonth.getMonth() - 1)

    const todayUTC = localToUTC(today)
    const startOfWeekUTC = localToUTC(startOfWeek)
    const startOfMonthUTC = localToUTC(startOfMonth)
    const startOfLastWeekUTC = localToUTC(startOfLastWeek)
    const startOfLastMonthUTC = localToUTC(startOfLastMonth)

    // Função para buscar métricas combinadas para múltiplos modelos
    async function getCombinedMetrics(start: Date, end: Date) {
      let total = 0, count = 0
      for (const model of models) {
        const res = await getMetrics(model, start, end)
        total += res.total
        count += res.count
      }
      return { total, count, avg: count > 0 ? total / count : 0 }
    }

    // Dados do dia, semana, mês
    const dayData = await getCombinedMetrics(todayUTC, new Date(todayUTC.getTime() + 24*60*60*1000))
    const weekData = await getCombinedMetrics(startOfWeekUTC, new Date(startOfWeekUTC.getTime() + 7*24*60*60*1000))
    const monthData = await getCombinedMetrics(startOfMonthUTC, new Date(startOfMonthUTC.getTime() + 30*24*60*60*1000))

    // Períodos anteriores para variação
    const lastWeekData = await getCombinedMetrics(startOfLastWeekUTC, startOfWeekUTC)
    const lastMonthData = await getCombinedMetrics(startOfLastMonthUTC, startOfMonthUTC)

    const dayChange = dayData.total > 0 && lastWeekData.total > 0 ? ((dayData.total - lastWeekData.total) / lastWeekData.total) * 100 : 0
    const weekChange = weekData.total > 0 && lastWeekData.total > 0 ? ((weekData.total - lastWeekData.total) / lastWeekData.total) * 100 : 0
    const monthChange = monthData.total > 0 && lastMonthData.total > 0 ? ((monthData.total - lastMonthData.total) / lastMonthData.total) * 100 : 0

    // --- ITENS MAIS VENDIDOS (últimos 7 dias) ---
    const last7Days = new Date(today)
    last7Days.setDate(today.getDate() - 7)
    const last7DaysUTC = localToUTC(last7Days)

    let allOrderItems: any[] = []
    if (models.includes('order')) {
      const items = await prisma.orderItem.findMany({
        where: {
          order: {
            status: 'CLOSED',
            createdAt: { gte: last7DaysUTC },
          },
        },
        select: { productId: true, quantity: true },
      })
      allOrderItems = allOrderItems.concat(items)
    }
    if (models.includes('delivery')) {
      const items = await prisma.deliveryOrderItem.findMany({
        where: {
          order: {
            status: 'ENTREGUE',
            createdAt: { gte: last7DaysUTC },
          },
        },
        select: { productId: true, quantity: true },
      })
      allOrderItems = allOrderItems.concat(items)
    }

    // Agrupar por productId e somar quantidades
    const productQuantityMap = new Map<string, number>()
    for (const item of allOrderItems) {
      const current = productQuantityMap.get(item.productId) || 0
      productQuantityMap.set(item.productId, current + item.quantity)
    }

    const sortedItems = Array.from(productQuantityMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    const topItemsWithNames = await Promise.all(
      sortedItems.map(async ([productId, total]) => {
        const product = await prisma.product.findUnique({
          where: { id: productId },
          select: { name: true },
        })
        return { name: product?.name || 'Desconhecido', total }
      })
    )

    // --- VENDAS DOS ÚLTIMOS 7 DIAS (gráfico de barras) ---
    const last7DaysData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateUTC = localToUTC(date)
      const nextDateUTC = new Date(dateUTC)
      nextDateUTC.setDate(dateUTC.getDate() + 1)

      let totalDay = 0
      if (models.includes('order')) {
        const orders = await prisma.order.findMany({
          where: {
            status: 'CLOSED',
            createdAt: { gte: dateUTC, lt: nextDateUTC },
          },
          select: { total: true },
        })
        totalDay += orders.reduce((sum, o) => sum + o.total, 0)
      }
      if (models.includes('delivery')) {
        const orders = await prisma.deliveryOrder.findMany({
          where: {
            status: 'ENTREGUE',
            createdAt: { gte: dateUTC, lt: nextDateUTC },
          },
          select: { total: true },
        })
        totalDay += orders.reduce((sum, o) => sum + o.total, 0)
      }
      last7DaysData.push({
        date: date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
        total: totalDay,
      })
    }

    // --- VENDAS POR CATEGORIA (últimos 7 dias) ---
    const categoryMap = new Map<string, number>()
    for (const [productId, quantity] of productQuantityMap.entries()) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { category: true },
      })
      const categoryName = product?.category?.name || 'Outros'
      const current = categoryMap.get(categoryName) || 0
      categoryMap.set(categoryName, current + quantity)
    }
    const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }))

    // --- PEDIDOS POR HORA (últimos 7 dias) ---
    const hourMap = new Map<number, number>()
    if (models.includes('order')) {
      const hourOrders = await prisma.order.groupBy({
        by: ['createdAt'],
        where: {
          status: 'CLOSED',
          createdAt: { gte: last7DaysUTC },
        },
        _count: { id: true },
      })
      for (const item of hourOrders) {
        const hour = new Date(item.createdAt).getUTCHours()
        const adjustedHour = (hour - 3 + 24) % 24
        const current = hourMap.get(adjustedHour) || 0
        hourMap.set(adjustedHour, current + item._count.id)
      }
    }
    if (models.includes('delivery')) {
      const hourOrders = await prisma.deliveryOrder.groupBy({
        by: ['createdAt'],
        where: {
          status: 'ENTREGUE',
          createdAt: { gte: last7DaysUTC },
        },
        _count: { id: true },
      })
      for (const item of hourOrders) {
        const hour = new Date(item.createdAt).getUTCHours()
        const adjustedHour = (hour - 3 + 24) % 24
        const current = hourMap.get(adjustedHour) || 0
        hourMap.set(adjustedHour, current + item._count.id)
      }
    }
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hora: i,
      pedidos: hourMap.get(i) || 0,
    }))

    return NextResponse.json({
      day: {
        revenue: dayData.total,
        orders: dayData.count,
        avg: dayData.avg,
        change: dayChange,
      },
      week: {
        revenue: weekData.total,
        orders: weekData.count,
        avg: weekData.avg,
        change: weekChange,
      },
      month: {
        revenue: monthData.total,
        orders: monthData.count,
        avg: monthData.avg,
        change: monthChange,
      },
      topItems: topItemsWithNames,
      last7Days: last7DaysData,
      categorySales: categoryData,
      hourlyData,
    }, { status: 200 })
  } catch (error) {
    console.error('Erro no dashboard:', error)
    return NextResponse.json({ error: 'Erro ao carregar dados do dashboard' }, { status: 500 })
  }
}