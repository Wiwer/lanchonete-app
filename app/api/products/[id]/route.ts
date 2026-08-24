// app/api/products/[id]/route.ts
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { NextResponse } from 'next/server'

const adapter = new PrismaBetterSqlite3({
  url: `file:${process.cwd()}/dev.db`,
})
const prisma = new PrismaClient({ adapter })

// PUT - Atualizar produto (nome, preço, active)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, price, active } = body

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        price: price !== undefined ? parseFloat(price) : undefined,
        active: active !== undefined ? active : undefined,
      },
    })
    return NextResponse.json(product, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 })
  }
}

// DELETE - Remover produto (fisicamente) - ou podemos usar active = false
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.product.delete({
      where: { id },
    })
    return NextResponse.json({ message: 'Produto removido' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao remover produto' }, { status: 500 })
  }
}