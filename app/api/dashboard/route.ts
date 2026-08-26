// app/api/dashboard/route.ts
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { NextResponse } from 'next/server'

const adapter = new PrismaBetterSqlite3({
  url: `file:${process.cwd()}/dev.db`,
})
const prisma = new PrismaClient({ adapter })

export async function GET() {
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // domingo
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // Período anterior (para comparação)
    const startOfLastWeek = new Date(startOfWeek)
    startOfLastWeek.setDate(startOfWeek.getDate() - 7)
    const startOfLastMonth = new Date(startOfMonth)
    startOfLastMonth.setMonth(startOfMonth.getMonth() - 1)

    function localToUTC(date: Date): Date {
      const utcDate = new Date(date)
      utcDate.setHours(utcDate.getHours() - 3)
      return utcDate
    }

    const todayUTC = localToUTC(today)
    const startOfWeekUTC = localToUTC(startOfWeek)
    const startOfMonthUTC = localToUTC(startOfMonth)
    const startOfLastWeekUTC = localToUTC(startOfLastWeek)
    const startOfLastMonthUTC = localToUTC(startOfLastMonth)

    // --- FUNÇÃO AUXILIAR para buscar métricas ---
    const getMetrics = async (startDate: Date, endDate: Date = new Date()) => {
      const orders = await prisma.order.findMany({
        where: {
          status: 'CLOSED',
          createdAt: { gte: startDate, lt: endDate },
        },
      })
      const total = orders.reduce((sum, o) => sum + o.total, 0)
      const count = orders.length
      const avg = count > 0 ? total / count : 0
      return { total, count, avg }
    }

    // 1. Métricas do dia
    const dayMetrics = await getMetrics(todayUTC)
    const yesterdayStart = new Date(todayUTC)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    const yesterdayMetrics = await getMetrics(yesterdayStart, todayUTC)

    // 2. Métricas da semana
    const weekMetrics = await getMetrics(startOfWeekUTC)
    const lastWeekMetrics = await getMetrics(startOfLastWeekUTC, startOfWeekUTC)

    // 3. Métricas do mês
    const monthMetrics = await getMetrics(startOfMonthUTC)
    const lastMonthMetrics = await getMetrics(startOfLastMonthUTC, startOfMonthUTC)

    // 4. Pedidos por hora (últimos 7 dias)
    const last7Days = new Date(today)
    last7Days.setDate(today.getDate() - 7)
    const last7DaysUTC = localToUTC(last7Days)

    const ordersByHour = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        status: 'CLOSED',
        createdAt: { gte: last7DaysUTC },
      },
      _count: { id: true },
    })

    // Agrupar por hora (0-23)
    const hourMap = new Map<number, number>()
    for (const item of ordersByHour) {
      const hour = new Date(item.createdAt).getUTCHours()
      const adjustedHour = (hour - 3 + 24) % 24 // ajustar para UTC-3
      const current = hourMap.get(adjustedHour) || 0
      hourMap.set(adjustedHour, current + item._count.id)
    }

    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hora: i,
      pedidos: hourMap.get(i) || 0,
    }))

    // 5. Itens mais vendidos (últimos 7 dias)
    const topItems = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          status: 'CLOSED',
          createdAt: { gte: last7DaysUTC },
        },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    })

    const topItemsWithNames = await Promise.all(
      topItems.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true },
        })
        return {
          name: product?.name || 'Desconhecido',
          total: item._sum.quantity || 0,
        }
      })
    )

    // 6. Vendas dos últimos 7 dias (para gráfico de barras)
    const last7DaysData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateUTC = localToUTC(date)
      const nextDateUTC = new Date(dateUTC)
      nextDateUTC.setDate(dateUTC.getDate() + 1)

      const orders = await prisma.order.findMany({
        where: {
          status: 'CLOSED',
          createdAt: {
            gte: dateUTC,
            lt: nextDateUTC,
          },
        },
      })
      const total = orders.reduce((sum, o) => sum + o.total, 0)
      last7DaysData.push({
        date: date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
        total,
      })
    }

    // 7. Vendas por categoria (últimos 7 dias)
    const categorySales = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          status: 'CLOSED',
          createdAt: { gte: last7DaysUTC },
        },
      },
      _sum: { quantity: true },
    })

    const categoryMap = new Map<string, number>()
    for (const item of categorySales) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { category: true },
      })
      const categoryName = product?.category?.name || 'Outros'
      const current = categoryMap.get(categoryName) || 0
      categoryMap.set(categoryName, current + (item._sum.quantity || 0))
    }

    const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
    }))

    return NextResponse.json({
      day: {
        revenue: dayMetrics.total,
        orders: dayMetrics.count,
        avg: dayMetrics.avg,
        change: dayMetrics.count > 0 && yesterdayMetrics.count > 0
          ? ((dayMetrics.total - yesterdayMetrics.total) / yesterdayMetrics.total) * 100
          : 0,
      },
      week: {
        revenue: weekMetrics.total,
        orders: weekMetrics.count,
        avg: weekMetrics.avg,
        change: weekMetrics.total > 0 && lastWeekMetrics.total > 0
          ? ((weekMetrics.total - lastWeekMetrics.total) / lastWeekMetrics.total) * 100
          : 0,
      },
      month: {
        revenue: monthMetrics.total,
        orders: monthMetrics.count,
        avg: monthMetrics.avg,
        change: monthMetrics.total > 0 && lastMonthMetrics.total > 0
          ? ((monthMetrics.total - lastMonthMetrics.total) / lastMonthMetrics.total) * 100
          : 0,
      },
      topItems: topItemsWithNames,
      last7Days: last7DaysData,
      categorySales: categoryData,
      hourlyData,
    })
  } catch (error) {
    console.error('Erro no dashboard:', error)
    return NextResponse.json({ error: 'Erro ao carregar dados do dashboard' }, { status: 500 })
  }
}