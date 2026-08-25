// app/api/products/route.ts
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { NextResponse } from 'next/server'

const adapter = new PrismaBetterSqlite3({
  url: `file:${process.cwd()}/dev.db`,
})
const prisma = new PrismaClient({ adapter })

// GET - Listar produtos (ativos e inativos) com categoria
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const apenasAtivos = searchParams.get('ativos') === 'true'
    const categoryId = searchParams.get('categoryId')

    const where: any = {}
    if (apenasAtivos) where.active = true
    if (categoryId) where.categoryId = categoryId

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: [
        { category: { name: 'asc' } },
        { name: 'asc' },
      ],
    })
    return NextResponse.json(products, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 })
  }
}

// POST - Criar novo produto (com categoria)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, price, categoryId } = body

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }
    if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
      return NextResponse.json({ error: 'Preço inválido' }, { status: 400 })
    }

    const existing = await prisma.product.findUnique({
      where: { name: name.trim() },
    })
    if (existing) {
      return NextResponse.json({ error: 'Já existe um produto com este nome' }, { status: 409 })
    }

    // Verifica se a categoria existe
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      })
      if (!category) {
        return NextResponse.json({ error: 'Categoria inválida' }, { status: 400 })
      }
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        price: Number(price),
        categoryId: categoryId || null,
        active: false, // cria desativado por padrão
      },
      include: { category: true },
    })
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 })
  }
}

// PUT - Atualizar produto (nome, preço, categoria, ativo)
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, price, active, categoryId } = body

    if (!id) {
      return NextResponse.json({ error: 'ID do produto é obrigatório' }, { status: 400 })
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    })
    if (!existingProduct) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    // Verifica se a categoria existe (se foi fornecida)
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      })
      if (!category) {
        return NextResponse.json({ error: 'Categoria inválida' }, { status: 400 })
      }
    }

    const data: any = {}
    if (name !== undefined) {
      if (name.trim() === '') {
        return NextResponse.json({ error: 'Nome não pode ser vazio' }, { status: 400 })
      }
      if (name.trim() !== existingProduct.name) {
        const duplicate = await prisma.product.findUnique({
          where: { name: name.trim() },
        })
        if (duplicate) {
          return NextResponse.json({ error: 'Já existe um produto com este nome' }, { status: 409 })
        }
      }
      data.name = name.trim()
    }
    if (price !== undefined) {
      if (isNaN(Number(price)) || Number(price) < 0) {
        return NextResponse.json({ error: 'Preço inválido' }, { status: 400 })
      }
      data.price = Number(price)
    }
    if (active !== undefined) {
      data.active = active
    }
    if (categoryId !== undefined) {
      data.categoryId = categoryId || null
    }

    const updated = await prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    })
    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error('Erro ao atualizar produto:', error)
    return NextResponse.json({ error: 'Erro interno ao atualizar produto' }, { status: 500 })
  }
}

// DELETE - Desativar produto (active = false)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID do produto é obrigatório' }, { status: 400 })
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    })
    if (!existingProduct) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { active: false },
    })
    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error('Erro ao desativar produto:', error)
    return NextResponse.json({ error: 'Erro ao desativar produto' }, { status: 500 })
  }
}