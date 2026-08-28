// app/api/delivery/[id]/items/route.ts
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { NextResponse } from 'next/server'

const adapter = new PrismaBetterSqlite3({
  url: `file:${process.cwd()}/dev.db`,
})
const prisma = new PrismaClient({ adapter })

// PUT - Substituir todos os itens de um pedido (apenas se PENDENTE)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { items } = body // Array de { productId, quantity, observacao? }

    // Buscar pedido
    const order = await prisma.deliveryOrder.findUnique({
      where: { id },
    })

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    // Verificar se está pendente
    if (order.status !== 'PENDENTE') {
      return NextResponse.json(
        { error: 'Apenas pedidos pendentes podem ser editados' },
        { status: 403 }
      )
    }

    // Validar itens
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'É necessário pelo menos um item' },
        { status: 400 }
      )
    }

    // Calcular total e validar produtos
    let total = 0
    const validatedItems = []
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      })
      if (!product) {
        return NextResponse.json(
          { error: `Produto ${item.productId} não encontrado` },
          { status: 404 }
        )
      }
      if (item.quantity <= 0) {
        return NextResponse.json(
          { error: `Quantidade inválida para ${product.name}` },
          { status: 400 }
        )
      }
      total += product.price * item.quantity
      validatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        observacao: item.observacao || null,
      })
    }

    // Atualizar em transação
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Remover itens antigos
      await tx.deliveryOrderItem.deleteMany({
        where: { orderId: id },
      })

      // Criar novos itens
      for (const item of validatedItems) {
        await tx.deliveryOrderItem.create({
          data: {
            orderId: id,
            ...item,
          },
        })
      }

      // Atualizar total
      return await tx.deliveryOrder.update({
        where: { id },
        data: { total },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })
    })

    return NextResponse.json(updatedOrder, { status: 200 })
  } catch (error) {
    console.error('Erro ao atualizar itens do pedido:', error)
    return NextResponse.json({ error: 'Erro ao atualizar pedido' }, { status: 500 })
  }
}