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

    // Função para converter data local para UTC
    function localToUTC(date: Date): Date {
      const utcDate = new Date(date)
      utcDate.setHours(utcDate.getHours() - 3)
      return utcDate
    }

    const todayUTC = localToUTC(today)
    const startOfWeekUTC = localToUTC(startOfWeek)
    const startOfMonthUTC = localToUTC(startOfMonth)

    // 1. Faturamento do dia
    const dayOrders = await prisma.order.findMany({
      where: {
        status: 'CLOSED',
        createdAt: { gte: todayUTC },
      },
    })
    const dayRevenue = dayOrders.reduce((sum, order) => sum + order.total, 0)
    const dayOrdersCount = dayOrders.length

    // 2. Faturamento da semana
    const weekOrders = await prisma.order.findMany({
      where: {
        status: 'CLOSED',
        createdAt: { gte: startOfWeekUTC },
      },
    })
    const weekRevenue = weekOrders.reduce((sum, order) => sum + order.total, 0)
    const weekOrdersCount = weekOrders.length

    // 3. Faturamento do mês
    const monthOrders = await prisma.order.findMany({
      where: {
        status: 'CLOSED',
        createdAt: { gte: startOfMonthUTC },
      },
    })
    const monthRevenue = monthOrders.reduce((sum, order) => sum + order.total, 0)
    const monthOrdersCount = monthOrders.length

    // 4. Itens mais vendidos (últimos 7 dias)
    const last7Days = new Date(today)
    last7Days.setDate(today.getDate() - 7)
    const last7DaysUTC = localToUTC(last7Days)

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

    // Buscar nomes dos produtos
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

    // 5. Vendas dos últimos 7 dias (para gráfico de barras)
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
      const total = orders.reduce((sum, order) => sum + order.total, 0)
      last7DaysData.push({
        date: date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
        total,
      })
    }

    // 6. Vendas por categoria (últimos 7 dias)
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

    // Agrupar por categoria
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
      day: { revenue: dayRevenue, orders: dayOrdersCount },
      week: { revenue: weekRevenue, orders: weekOrdersCount },
      month: { revenue: monthRevenue, orders: monthOrdersCount },
      topItems: topItemsWithNames,
      last7Days: last7DaysData,
      categorySales: categoryData,
    })
  } catch (error) {
    console.error('Erro no dashboard:', error)
    return NextResponse.json({ error: 'Erro ao carregar dados do dashboard' }, { status: 500 })
  }
}