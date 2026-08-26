// app/api/categories/route.ts
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { NextResponse } from 'next/server'

const adapter = new PrismaBetterSqlite3({
  url: `file:${process.cwd()}/dev.db`,
})
const prisma = new PrismaClient({ adapter })

// GET - Listar todas as categorias
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ],
      include: {
        _count: {
          select: { products: true },
        },
      },
    })
    return NextResponse.json(categories, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    return NextResponse.json({ error: 'Erro ao buscar categorias' }, { status: 500 })
  }
}

// POST - Criar nova categoria
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    // Verificar se já existe categoria com esse nome
    const existing = await prisma.category.findUnique({
      where: { name: name.trim() },
    })
    if (existing) {
      return NextResponse.json({ error: 'Já existe uma categoria com este nome' }, { status: 409 })
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
    })
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    return NextResponse.json({ error: 'Erro ao criar categoria' }, { status: 500 })
  }
}

// PUT - Atualizar categoria
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, description } = body

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }
    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    // Verificar se a categoria existe
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    })
    if (!existingCategory) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 })
    }

    // Verificar se o novo nome já existe em outra categoria
    if (name.trim() !== existingCategory.name) {
      const duplicate = await prisma.category.findUnique({
        where: { name: name.trim() },
      })
      if (duplicate) {
        return NextResponse.json({ error: 'Já existe uma categoria com este nome' }, { status: 409 })
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
    })
    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error)
    return NextResponse.json({ error: 'Erro ao atualizar categoria' }, { status: 500 })
  }
}

// DELETE - Excluir categoria (apenas se não tiver produtos associados)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    // Verificar se a categoria existe
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          select: { id: true },
        },
      },
    })
    if (!category) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 })
    }

    // Verificar se há produtos associados
    if (category.products.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir uma categoria com produtos associados. Remova ou reassocie os produtos primeiro.' },
        { status: 409 }
      )
    }

    await prisma.category.delete({
      where: { id },
    })
    return NextResponse.json({ message: 'Categoria excluída com sucesso' }, { status: 200 })
  } catch (error) {
    console.error('Erro ao excluir categoria:', error)
    return NextResponse.json({ error: 'Erro ao excluir categoria' }, { status: 500 })
  }
}