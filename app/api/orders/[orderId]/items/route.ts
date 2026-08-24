import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { NextResponse } from 'next/server'

const adapter = new PrismaBetterSqlite3({
  url: `file:${process.cwd()}/dev.db`,
})
const prisma = new PrismaClient({ adapter })

// POST - Adicionar item
export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const { productId, quantity = 1 } = await request.json()

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    if (order.status !== 'OPEN') {
      return NextResponse.json({ error: 'Pedido já está fechado' }, { status: 409 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    const existingItem = await prisma.orderItem.findFirst({
      where: {
        orderId: order.id,
        productId: product.id,
      },
    })

    if (existingItem) {
      await prisma.orderItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          unitPrice: product.price,
        },
      })
    } else {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          quantity,
          unitPrice: product.price,
        },
      })
    }

    // Recalcula total
    const items = await prisma.orderItem.findMany({
      where: { orderId: order.id },
    })
    const newTotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    )

    await prisma.order.update({
      where: { id: order.id },
      data: { total: newTotal },
    })

    return NextResponse.json({ message: 'Item adicionado', total: newTotal }, { status: 200 })
  } catch (error) {
    console.error('Erro ao adicionar item:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// DELETE - Remover item ou diminuir quantidade
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const { itemId, action = 'remove' } = await request.json()

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    if (order.status !== 'OPEN') {
      return NextResponse.json({ error: 'Pedido já está fechado' }, { status: 409 })
    }

    const item = await prisma.orderItem.findUnique({
      where: { id: itemId },
    })

    if (!item) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }

    if (action === 'decrease' && item.quantity > 1) {
      await prisma.orderItem.update({
        where: { id: itemId },
        data: { quantity: item.quantity - 1 },
      })
    } else {
      await prisma.orderItem.delete({
        where: { id: itemId },
      })
    }

    const items = await prisma.orderItem.findMany({
      where: { orderId: order.id },
    })
    const newTotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    )

    await prisma.order.update({
      where: { id: order.id },
      data: { total: newTotal },
    })

    return NextResponse.json({ message: 'Item removido', total: newTotal }, { status: 200 })
  } catch (error) {
    console.error('Erro ao remover item:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}