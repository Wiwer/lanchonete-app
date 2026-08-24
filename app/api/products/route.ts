// app/api/products/route.ts
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { NextResponse } from 'next/server'

const adapter = new PrismaBetterSqlite3({
  url: `file:${process.cwd()}/dev.db`,
})
const prisma = new PrismaClient({ adapter })

// GET - Listar produtos (ativos e inativos)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const apenasAtivos = searchParams.get('ativos') === 'true'

    const products = await prisma.product.findMany({
      where: apenasAtivos ? { active: true } : undefined,
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(products, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 })
  }
}

// POST - Criar novo produto
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, price } = body

    // Validações
    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }
    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      return NextResponse.json({ error: 'Preço inválido' }, { status: 400 })
    }

    // Verifica duplicidade
    const existing = await prisma.product.findUnique({
      where: { name: name.trim() },
    })
    if (existing) {
      return NextResponse.json({ error: 'Já existe um produto com este nome' }, { status: 409 })
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        price: Number(price),
        active: false, // Por padrão, produtos novos são inativos
      },
    })
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 })
  }
}

// PUT - Atualizar produto (nome, preço, ativo)
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, price, active } = body

    if (!id) {
      return NextResponse.json({ error: 'ID do produto é obrigatório' }, { status: 400 })
    }

    // Busca o produto atual
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    })
    if (!existingProduct) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    // Prepara dados para atualização
    const data: any = {}

    if (name !== undefined) {
      if (name.trim() === '') {
        return NextResponse.json({ error: 'Nome não pode ser vazio' }, { status: 400 })
      }
      // Verifica se o novo nome já existe em outro produto
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

    const updated = await prisma.product.update({
      where: { id },
      data,
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error('Erro ao atualizar produto:', error)
    return NextResponse.json({ error: 'Erro interno ao atualizar produto' }, { status: 500 })
  }
}

// DELETE - Desativar produto (em vez de deletar, muda active para false)
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

    // Em vez de deletar, desativa o produto (active = false)
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