// app/api/delivery/[id]/route.ts
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { NextResponse } from 'next/server'

const adapter = new PrismaBetterSqlite3({
  url: `file:${process.cwd()}/dev.db`,
})
const prisma = new PrismaClient({ adapter })

// GET - Buscar pedido por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const order = await prisma.deliveryOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    return NextResponse.json(order, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar pedido:', error)
    return NextResponse.json({ error: 'Erro ao buscar pedido' }, { status: 500 })
  }
}

// PUT - Atualizar status do pedido
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    const validStatuses = ['PENDENTE', 'EM_PREPARO', 'SAIU_PARA_ENTREGA', 'ENTREGUE', 'CANCELADO']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
    }

    const order = await prisma.deliveryOrder.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    return NextResponse.json(order, { status: 200 })
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error)
    return NextResponse.json({ error: 'Erro ao atualizar pedido' }, { status: 500 })
  }
}