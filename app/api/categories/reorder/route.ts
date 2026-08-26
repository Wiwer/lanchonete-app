// app/api/categories/reorder/route.ts
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { NextResponse } from 'next/server'

const adapter = new PrismaBetterSqlite3({
  url: `file:${process.cwd()}/dev.db`,
})
const prisma = new PrismaClient({ adapter })

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { categories }: { categories: { id: string; order: number }[] } = body

    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    // Atualizar cada categoria em uma transação
    await prisma.$transaction(
      categories.map((cat) =>
        prisma.category.update({
          where: { id: cat.id },
          data: { order: cat.order },
        })
      )
    )

    return NextResponse.json({ message: 'Ordem atualizada com sucesso' }, { status: 200 })
  } catch (error) {
    console.error('Erro ao reordenar categorias:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}