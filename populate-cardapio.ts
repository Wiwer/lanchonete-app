import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db',
})
const prisma = new PrismaClient({ adapter })

const produtos = [
  // Lanches
  { name: 'X-Burguer Simples', price: 22.0 },
  { name: 'X-Burguer Duplo', price: 28.0 },
  { name: 'X-Salada', price: 24.0 },
  { name: 'X-Tudo', price: 32.0 },
  { name: 'X-Bacon', price: 26.0 },
  { name: 'X-Frango', price: 23.0 },
  { name: 'X-Vegano', price: 27.0 },
  { name: 'X-Calabresa', price: 25.0 },
  { name: 'X-Egg', price: 21.0 },

  // Porções
  { name: 'Batata Frita (P)', price: 12.0 },
  { name: 'Batata Frita (M)', price: 18.0 },
  { name: 'Batata Frita (G)', price: 24.0 },
  { name: 'Batata Especial (cheddar + bacon)', price: 22.0 },
  { name: 'Anéis de Cebola', price: 15.0 },
  { name: 'Mandioca Frita', price: 14.0 },
  { name: 'Iscas de Peixe', price: 20.0 },
  { name: 'Tábua de Frios', price: 35.0 },

  // Bebidas
  { name: 'Coca-Cola (Lata)', price: 8.0 },
  { name: 'Coca-Cola (600ml)', price: 10.0 },
  { name: 'Coca-Cola (2L)', price: 16.0 },
  { name: 'Guaraná (Lata)', price: 7.0 },
  { name: 'Fanta Laranja (Lata)', price: 7.0 },
  { name: 'Suco de Laranja (Natural)', price: 12.0 },
  { name: 'Suco de Limão', price: 10.0 },
  { name: 'Água Mineral (500ml)', price: 5.0 },
  { name: 'Água com Gás', price: 6.0 },
  { name: 'Cerveja (Long Neck)', price: 12.0 },
  { name: 'Cerveja (Chopp)', price: 14.0 },
  { name: 'Refrigerante (Xarope)', price: 6.0 },

  // Sobremesas
  { name: 'Milkshake (Morango)', price: 15.0 },
  { name: 'Milkshake (Chocolate)', price: 15.0 },
  { name: 'Milkshake (Baunilha)', price: 15.0 },
  { name: 'Pudim', price: 10.0 },
  { name: 'Torta de Limão', price: 12.0 },
  { name: 'Bolo de Chocolate', price: 14.0 },
  { name: 'Sorvete (2 bolas)', price: 12.0 },
  { name: 'Petit Gateau', price: 18.0 },
  { name: 'Mousse de Maracujá', price: 11.0 },

  // Bebidas Quentes
  { name: 'Café', price: 4.0 },
  { name: 'Café com Leite', price: 6.0 },
  { name: 'Cappuccino', price: 9.0 },
  { name: 'Chá (camomila)', price: 5.0 },
  { name: 'Chá (mate)', price: 5.0 },

  // Extras (adicionais)
  { name: 'Bacon Extra', price: 5.0 },
  { name: 'Queijo Extra', price: 4.0 },
  { name: 'Ovo Extra', price: 3.0 },
  { name: 'Molho Especial', price: 3.0 },
]

async function main() {
  console.log('🌱 Iniciando população do cardápio...')

  let count = 0
  for (const produto of produtos) {
    try {
      await prisma.product.upsert({
        where: { name: produto.name },
        update: {
          price: produto.price,
          active: true, // ativa caso esteja desativado
        },
        create: {
          name: produto.name,
          price: produto.price,
          active: true,
        },
      })
      count++
    } catch (error) {
      console.error(`❌ Erro ao inserir ${produto.name}:`, error)
    }
  }

  console.log(`✅ ${count} produtos adicionados/atualizados com sucesso!`)
}

main()
  .catch((e) => {
    console.error('❌ Erro geral:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })