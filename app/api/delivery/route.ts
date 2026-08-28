// app/api/delivery/route.ts
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { NextResponse } from 'next/server'

const adapter = new PrismaBetterSqlite3({
  url: `file:${process.cwd()}/dev.db`,
})
const prisma = new PrismaClient({ adapter })

// GET - Listar todos os pedidos de delivery
export async function GET() {
  try {
    const orders = await prisma.deliveryOrder.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(orders, { status: 200 })
  } catch (error) {
    console.error('Erro ao listar pedidos delivery:', error)
    return NextResponse.json({ error: 'Erro ao listar pedidos' }, { status: 500 })
  }
}

// POST - Criar novo pedido de delivery
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { cliente, telefone, endereco, complemento, referencia, pagamento, observacao, items } = body

    // Validações básicas
    if (!cliente || !telefone || !endereco || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cliente, telefone, endereço e itens são obrigatórios' },
        { status: 400 }
      )
    }

    // Calcular total
    let total = 0
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
      total += product.price * item.quantity
    }

    // Criar pedido com transação
    const order = await prisma.$transaction(async (tx) => {
      // Criar o pedido
      const newOrder = await tx.deliveryOrder.create({
        data: {
          cliente,
          telefone,
          endereco,
          complemento: complemento || null,
          referencia: referencia || null,
          pagamento: pagamento || null,
          observacao: observacao || null,
          total,
          status: 'PENDENTE',
        },
      })

      // Criar os itens
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        })
        if (!product) {
          throw new Error(`Produto ${item.productId} não encontrado`)
        }
        await tx.deliveryOrderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: product.price,
            observacao: item.observacao || null,
          },
        })
      }

      return newOrder
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar pedido delivery:', error)
    return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 })
  }
}