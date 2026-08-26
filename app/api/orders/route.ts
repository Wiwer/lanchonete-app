// app/api/orders/route.ts
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { NextResponse } from 'next/server'

const adapter = new PrismaBetterSqlite3({
  url: `file:${process.cwd()}/dev.db`,
})
const prisma = new PrismaClient({ adapter })

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      action,
      tableNumber,
      orderId,
      productId,
      quantity = 1,
      itemId,
      subAction,
      newTableNumber,
    } = body

// --- ABRIR MESA ---
if (action === 'open' && tableNumber) {
  const table = await prisma.table.findUnique({
    where: { number: tableNumber },
  })
  if (!table) return NextResponse.json({ error: 'Mesa não encontrada' }, { status: 404 })

  const existing = await prisma.order.findFirst({
    where: { tableId: table.id, status: 'OPEN' },
  })
  if (existing) return NextResponse.json({ error: 'Mesa já ocupada' }, { status: 409 })

  // --- GERAR NÚMERO SEQUENCIAL POR DIA ---
  const today = new Date()
  const dateStr = today.toISOString().split('T')[0] // "YYYY-MM-DD"

  // Usar transação para garantir consistência
  const order = await prisma.$transaction(async (tx) => {
    // Buscar ou criar a sequência do dia
    const sequence = await tx.orderSequence.upsert({
      where: { date: dateStr },
      update: {
        lastNumber: { increment: 1 },
      },
      create: {
        date: dateStr,
        lastNumber: 1,
      },
    })

    // Criar o pedido com o número gerado
    return await tx.order.create({
      data: {
        tableId: table.id,
        status: 'OPEN',
        total: 0,
        orderNumber: sequence.lastNumber,
      },
    })
  })

  return NextResponse.json(order, { status: 201 })
}

    // --- ADICIONAR ITEM ---
    if (action === 'addItem' && orderId && productId) {
      const order = await prisma.order.findUnique({ where: { id: orderId } })
      if (!order) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
      if (order.status !== 'OPEN') return NextResponse.json({ error: 'Pedido fechado' }, { status: 409 })

      const product = await prisma.product.findUnique({ where: { id: productId } })
      if (!product) return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })

      const existingItem = await prisma.orderItem.findFirst({
        where: { orderId: order.id, productId: product.id },
      })
      if (existingItem) {
        await prisma.orderItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity, unitPrice: product.price },
        })
      } else {
        await prisma.orderItem.create({
          data: { orderId: order.id, productId: product.id, quantity, unitPrice: product.price },
        })
      }

      const items = await prisma.orderItem.findMany({ where: { orderId: order.id } })
      const newTotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
      await prisma.order.update({ where: { id: order.id }, data: { total: newTotal } })
      return NextResponse.json({ message: 'Item adicionado', total: newTotal }, { status: 200 })
    }

    // --- REMOVER ITEM ---
    if (action === 'removeItem' && orderId && itemId) {
      const order = await prisma.order.findUnique({ where: { id: orderId } })
      if (!order) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
      if (order.status !== 'OPEN') return NextResponse.json({ error: 'Pedido fechado' }, { status: 409 })

      const item = await prisma.orderItem.findUnique({ where: { id: itemId } })
      if (!item) return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })

      const actionType = subAction || 'remove'
      if (actionType === 'decrease' && item.quantity > 1) {
        await prisma.orderItem.update({
          where: { id: itemId },
          data: { quantity: item.quantity - 1 },
        })
      } else {
        await prisma.orderItem.delete({ where: { id: itemId } })
      }

      const items = await prisma.orderItem.findMany({ where: { orderId: order.id } })
      const newTotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
      await prisma.order.update({ where: { id: order.id }, data: { total: newTotal } })
      return NextResponse.json({ message: 'Item removido', total: newTotal }, { status: 200 })
    }

    // --- FECHAR CONTA (vai para WAITING_PAYMENT) ---
    if (action === 'close' && orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      })
      if (!order) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
      if (order.status === 'CLOSED' || order.status === 'WAITING_PAYMENT') {
        return NextResponse.json({ error: 'Pedido já está fechado ou aguardando pagamento' }, { status: 409 })
      }
      const total = order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
      const updated = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'WAITING_PAYMENT', total },
      })
      return NextResponse.json(updated, { status: 200 })
    }

    // --- TRANSFERIR MESA ---
    if (action === 'transfer' && orderId && newTableNumber) {
      const order = await prisma.order.findUnique({ where: { id: orderId } })
      if (!order) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
      if (order.status !== 'OPEN') return NextResponse.json({ error: 'Pedido fechado' }, { status: 409 })

      const newTable = await prisma.table.findUnique({ where: { number: newTableNumber } })
      if (!newTable) return NextResponse.json({ error: 'Mesa destino não encontrada' }, { status: 404 })

      const existingOrder = await prisma.order.findFirst({
        where: { tableId: newTable.id, status: 'OPEN' },
      })
      if (existingOrder) return NextResponse.json({ error: 'Mesa destino ocupada' }, { status: 409 })

      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: { tableId: newTable.id },
      })
      return NextResponse.json(updatedOrder, { status: 200 })
    }

    // --- CONFIRMAR PAGAMENTO ---
    if (action === 'confirmPayment' && orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      })
      if (!order) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
      if (order.status !== 'WAITING_PAYMENT') {
        return NextResponse.json({ error: 'Pedido não está aguardando pagamento' }, { status: 409 })
      }
      const updated = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CLOSED' },
      })
      return NextResponse.json(updated, { status: 200 })
    }

    // --- REABRIR PEDIDO (de WAITING_PAYMENT ou CLOSED para OPEN) ---
    if (action === 'reopen' && orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      })
      if (!order) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
      if (order.status !== 'WAITING_PAYMENT' && order.status !== 'CLOSED') {
        return NextResponse.json({ error: 'Pedido não pode ser reaberto' }, { status: 409 })
      }
      const updated = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'OPEN' },
      })
      return NextResponse.json(updated, { status: 200 })
    }

    // --- CANCELAR PEDIDO (apenas se sem itens) ---
    if (action === 'cancel' && orderId) {
      const { password } = body

      // 🔥 Buscar a senha do gerente no banco 🔥
      const config = await prisma.gerenteConfig.findUnique({
        where: { id: 'single' },
      })

      if (!config) {
        return NextResponse.json(
          { error: 'Configuração do gerente não encontrada' },
          { status: 500 }
        )
      }

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      })
      if (!order) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
      if (order.status !== 'OPEN') {
        return NextResponse.json({ error: 'Pedido não está aberto' }, { status: 409 })
      }
      if (order.total !== 0 || order.items.length > 0) {
        return NextResponse.json({ error: 'Não é possível cancelar uma mesa com consumo' }, { status: 409 })
      }
      if (password !== config.senha) {
        return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })
      }

      await prisma.order.delete({
        where: { id: orderId },
      })

      return NextResponse.json({ message: 'Pedido cancelado com sucesso' }, { status: 200 })
    }

    // --- NENHUMA AÇÃO VÁLIDA ---
    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
  } catch (error) {
    console.error('Erro na API /api/orders:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}