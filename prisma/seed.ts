import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
  url: 'file:./dev.db',
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Iniciando seed completo...')

  // ========================================
  // 1. CRIAR CATEGORIAS
  // ========================================
  console.log('📁 Criando categorias...')
  const categorias = {
    lanches: await prisma.category.upsert({
      where: { name: 'Lanches' },
      update: {},
      create: { name: 'Lanches', description: 'Hambúrgueres artesanais, sanduíches e wraps' },
    }),
    bebidas: await prisma.category.upsert({
      where: { name: 'Bebidas' },
      update: {},
      create: { name: 'Bebidas', description: 'Refrigerantes, sucos naturais, águas e drinks' },
    }),
    sobremesas: await prisma.category.upsert({
      where: { name: 'Sobremesas' },
      update: {},
      create: { name: 'Sobremesas', description: 'Doces, tortas, milkshakes e sobremesas especiais' },
    }),
    porcoes: await prisma.category.upsert({
      where: { name: 'Porções & Acompanhamentos' },
      update: {},
      create: { name: 'Porções & Acompanhamentos', description: 'Porções para compartilhar e acompanhamentos' },
    }),
    salgados: await prisma.category.upsert({
      where: { name: 'Salgados' },
      update: {},
      create: { name: 'Salgados', description: 'Coxinhas, pastéis, pão de queijo e salgados assados' },
    }),
    saladas: await prisma.category.upsert({
      where: { name: 'Saladas' },
      update: {},
      create: { name: 'Saladas', description: 'Saladas frescas e bowls nutritivos' },
    }),
    cafes: await prisma.category.upsert({
      where: { name: 'Cafés & Chás' },
      update: {},
      create: { name: 'Cafés & Chás', description: 'Cafés especiais, capuccinos, chás e infusões' },
    }),
    sorvetes: await prisma.category.upsert({
      where: { name: 'Sorvetes' },
      update: {},
      create: { name: 'Sorvetes', description: 'Sorvetes artesanais, açaí e sundaes' },
    }),
  }
  console.log('✅ 8 categorias criadas!')

  // ========================================
  // 2. CRIAR PRODUTOS (com descrição)
  // ========================================
  console.log('📦 Criando produtos...')

  const products = [
    // LANCHES
    { name: 'X-Burguer Clássico', price: 25.0, categoryId: categorias.lanches.id, description: 'Pão brioche, hambúrguer 180g, queijo cheddar, alface, tomate e maionese da casa' },
    { name: 'X-Bacon Duplo', price: 32.0, categoryId: categorias.lanches.id, description: 'Pão australiano, dois hambúrgueres 150g, bacon crocante, queijo mussarela, cebola caramelizada e molho barbecue' },
    { name: 'Vegetariano de Grão-de-Bico', price: 26.0, categoryId: categorias.lanches.id, description: 'Pão integral, hambúrguer de grão-de-bico, abacate, rúcula, tomate seco e molho de iogurte' },
    { name: 'Wrap de Frango', price: 22.0, categoryId: categorias.lanches.id, description: 'Wrap integral, frango desfiado, cream cheese, alface, milho e cenoura ralada' },
    { name: 'Burger de Costela', price: 35.0, categoryId: categorias.lanches.id, description: 'Pão de brioche, hambúrguer de costela 200g, queijo provolone, cebola roxa, rúcula e molho chimichurri' },
    { name: 'X-Salada Light', price: 20.0, categoryId: categorias.lanches.id, description: 'Pão de forma integral, peito de peru, queijo branco, alface, tomate e molho de mostarda e mel' },

    // BEBIDAS
    { name: 'Coca-Cola (Lata)', price: 8.0, categoryId: categorias.bebidas.id, description: 'Refrigerante Coca-Cola lata 350ml' },
    { name: 'Coca-Cola Zero (Lata)', price: 8.0, categoryId: categorias.bebidas.id, description: 'Refrigerante Coca-Cola Zero açúcar lata 350ml' },
    { name: 'Guaraná (Lata)', price: 7.0, categoryId: categorias.bebidas.id, description: 'Refrigerante Guaraná Antárctica lata 350ml' },
    { name: 'Sprite (Lata)', price: 7.0, categoryId: categorias.bebidas.id, description: 'Refrigerante Sprite limão lata 350ml' },
    { name: 'Suco Natural de Laranja', price: 10.0, categoryId: categorias.bebidas.id, description: 'Suco de laranja natural feito na hora (500ml)' },
    { name: 'Suco de Limão com Hortelã', price: 9.0, categoryId: categorias.bebidas.id, description: 'Suco de limão siciliano com hortelã fresco (500ml)' },
    { name: 'Suco de Morango', price: 12.0, categoryId: categorias.bebidas.id, description: 'Suco de morango natural com um toque de limão (500ml)' },
    { name: 'Água Mineral com Gás', price: 5.0, categoryId: categorias.bebidas.id, description: 'Água mineral com gás 500ml' },
    { name: 'Água Mineral sem Gás', price: 4.0, categoryId: categorias.bebidas.id, description: 'Água mineral sem gás 500ml' },

    // SOBREMESAS
    { name: 'Milkshake de Chocolate', price: 15.0, categoryId: categorias.sobremesas.id, description: 'Milkshake cremoso de chocolate com calda de chocolate e chantilly' },
    { name: 'Milkshake de Morango', price: 15.0, categoryId: categorias.sobremesas.id, description: 'Milkshake de morango com pedaços de morango e chantilly' },
    { name: 'Petit Gâteau com Sorvete', price: 22.0, categoryId: categorias.sobremesas.id, description: 'Petit gâteau de chocolate meio amargo com sorvete de creme e calda de frutas vermelhas' },
    { name: 'Pudim de Leite Condensado', price: 12.0, categoryId: categorias.sobremesas.id, description: 'Pudim de leite condensado com calda de caramelo (fatia)' },
    { name: 'Torta de Limão', price: 14.0, categoryId: categorias.sobremesas.id, description: 'Torta de limão com merengue e base de biscoito' },
    { name: 'Brownie com Sorvete', price: 18.0, categoryId: categorias.sobremesas.id, description: 'Brownie de chocolate com nozes, sorvete de creme e calda de chocolate' },

    // PORÇÕES & ACOMPANHAMENTOS
    { name: 'Batata Frita (300g)', price: 18.0, categoryId: categorias.porcoes.id, description: 'Batata frita crocante com sal e pimenta (300g)' },
    { name: 'Batata Frita com Cheddar e Bacon', price: 26.0, categoryId: categorias.porcoes.id, description: 'Batata frita coberta com cheddar cremoso e bacon crocante' },
    { name: 'Onion Rings (Anéis de Cebola)', price: 20.0, categoryId: categorias.porcoes.id, description: 'Anéis de cebola empanados e fritos, servidos com molho barbecue' },
    { name: 'Polenta Frita', price: 18.0, categoryId: categorias.porcoes.id, description: 'Polenta frita crocante com molho de pimenta' },
    { name: 'Mandioca Frita', price: 19.0, categoryId: categorias.porcoes.id, description: 'Mandioca frita crocante com molho de alho' },

    // SALGADOS
    { name: 'Coxinha de Frango', price: 8.0, categoryId: categorias.salgados.id, description: 'Coxinha tradicional de frango desfiado (unidade)' },
    { name: 'Coxinha de Frango com Catupiry', price: 9.0, categoryId: categorias.salgados.id, description: 'Coxinha de frango com catupiry (unidade)' },
    { name: 'Pastel de Carne', price: 7.0, categoryId: categorias.salgados.id, description: 'Pastel frito de carne moída (unidade)' },
    { name: 'Pão de Queijo Recheado (presunto e queijo)', price: 10.0, categoryId: categorias.salgados.id, description: 'Pão de queijo recheado com presunto e queijo mussarela' },
    { name: 'Empada de Palmito', price: 9.0, categoryId: categorias.salgados.id, description: 'Empada de palmito com requeijão (unidade)' },

    // SALADAS
    { name: 'Salada Caesar', price: 24.0, categoryId: categorias.saladas.id, description: 'Alface romana, croutons, parmesão, frango grelhado e molho Caesar' },
    { name: 'Bowl de Quinoa com Legumes', price: 28.0, categoryId: categorias.saladas.id, description: 'Quinoa, legumes grelhados, abacate, rúcula e molho de mostarda e mel' },
    { name: 'Salada de Frutas', price: 16.0, categoryId: categorias.saladas.id, description: 'Salada de frutas frescas com calda de frutas vermelhas' },

    // CAFÉS & CHÁS
    { name: 'Café Expresso', price: 6.0, categoryId: categorias.cafes.id, description: 'Café expresso encorpado (60ml)' },
    { name: 'Capuccino', price: 10.0, categoryId: categorias.cafes.id, description: 'Capuccino cremoso com canela e chocolate em pó' },
    { name: 'Chá Gelado da Casa', price: 8.0, categoryId: categorias.cafes.id, description: 'Chá gelado de limão com hortelã e mel (500ml)' },
    { name: 'Chá de Camomila', price: 7.0, categoryId: categorias.cafes.id, description: 'Infusão de camomila com mel e limão' },

    // SORVETES
    { name: 'Sorvete de Chocolate (Bola)', price: 8.0, categoryId: categorias.sorvetes.id, description: 'Bola de sorvete de chocolate artesanal' },
    { name: 'Sorvete de Morango (Bola)', price: 8.0, categoryId: categorias.sorvetes.id, description: 'Bola de sorvete de morango com pedaços de fruta' },
    { name: 'Açaí na Tigela (300ml)', price: 15.0, categoryId: categorias.sorvetes.id, description: 'Açaí na tigela com granola, banana e mel (300ml)' },
    { name: 'Açaí na Tigela (500ml)', price: 20.0, categoryId: categorias.sorvetes.id, description: 'Açaí na tigela com granola, banana, morango e mel (500ml)' },
    { name: 'Sundae de Chocolate', price: 12.0, categoryId: categorias.sorvetes.id, description: 'Sundae de chocolate com calda, chantilly e cereja' },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: {
        price: product.price,
        categoryId: product.categoryId,
        description: product.description,
        active: true,
      },
      create: {
        name: product.name,
        price: product.price,
        categoryId: product.categoryId,
        description: product.description,
        active: true,
      },
    })
  }
  console.log(`✅ ${products.length} produtos criados!`)

  // ========================================
  // 3. CRIAR MESAS (15 mesas)
  // ========================================
  console.log('🪑 Criando 15 mesas...')
  for (let i = 1; i <= 15; i++) {
    await prisma.table.upsert({
      where: { number: i },
      update: {},
      create: { number: i },
    })
  }
  console.log('✅ 15 mesas criadas!')

  // ========================================
  // 4. CONFIGURAÇÕES DO SISTEMA
  // ========================================
  console.log('⚙️ Criando configurações...')
  await prisma.systemConfig.upsert({
    where: { id: 'single' },
    update: {},
    create: { id: 'single', maintenance: false },
  })
  await prisma.gerenteConfig.upsert({
    where: { id: 'single' },
    update: {},
    create: { id: 'single', senha: '1234' },
  })
  console.log('✅ SystemConfig e GerenteConfig criados!')

  // ========================================
  // 5. SEQUÊNCIAS PARA NÚMEROS DE PEDIDO
  // ========================================
  console.log('🔢 Criando sequências...')
  const hoje = new Date().toISOString().split('T')[0]
  await prisma.orderSequence.upsert({
    where: { date: hoje },
    update: {},
    create: { date: hoje, lastNumber: 0 },
  })
  await prisma.deliveryOrderSequence.upsert({
    where: { date: hoje },
    update: {},
    create: { date: hoje, lastNumber: 0 },
  })
  console.log('✅ Sequências criadas!')

  // ========================================
  // 6. PEDIDOS DE EXEMPLO
  // ========================================
  console.log('📋 Criando pedidos de exemplo...')

  // Buscar mesas e produtos
  const mesa1 = await prisma.table.findUnique({ where: { number: 1 } })
  const mesa2 = await prisma.table.findUnique({ where: { number: 2 } })
  const mesa3 = await prisma.table.findUnique({ where: { number: 3 } })
  const mesa4 = await prisma.table.findUnique({ where: { number: 4 } })
  const xBurguer = await prisma.product.findUnique({ where: { name: 'X-Burguer Clássico' } })
  const batata = await prisma.product.findUnique({ where: { name: 'Batata Frita (300g)' } })
  const coca = await prisma.product.findUnique({ where: { name: 'Coca-Cola (Lata)' } })
  const onion = await prisma.product.findUnique({ where: { name: 'Onion Rings (Anéis de Cebola)' } })
  const milkshake = await prisma.product.findUnique({ where: { name: 'Milkshake de Chocolate' } })
  const suco = await prisma.product.findUnique({ where: { name: 'Suco Natural de Laranja' } })
  const capuccino = await prisma.product.findUnique({ where: { name: 'Capuccino' } })

  // Mesa 1: Pedido aberto (X-Burguer + Batata)
  if (mesa1 && xBurguer && batata) {
    const seq = await prisma.orderSequence.upsert({
      where: { date: hoje },
      update: { lastNumber: { increment: 1 } },
      create: { date: hoje, lastNumber: 1 },
    })
    await prisma.order.create({
      data: {
        tableId: mesa1.id,
        status: 'OPEN',
        total: xBurguer.price + batata.price,
        orderNumber: seq.lastNumber,
        items: {
          create: [
            { productId: xBurguer.id, quantity: 1, unitPrice: xBurguer.price },
            { productId: batata.id, quantity: 1, unitPrice: batata.price },
          ],
        },
      },
    })
    console.log(`✅ Mesa 1 aberta com pedido #${seq.lastNumber}`)
  }

  // Mesa 2: Pedido aberto (Coca-Cola)
  if (mesa2 && coca) {
    const seq = await prisma.orderSequence.upsert({
      where: { date: hoje },
      update: { lastNumber: { increment: 1 } },
      create: { date: hoje, lastNumber: 1 },
    })
    await prisma.order.create({
      data: {
        tableId: mesa2.id,
        status: 'OPEN',
        total: coca.price,
        orderNumber: seq.lastNumber,
        items: {
          create: [{ productId: coca.id, quantity: 1, unitPrice: coca.price }],
        },
      },
    })
    console.log(`✅ Mesa 2 aberta com pedido #${seq.lastNumber}`)
  }

  // Mesa 3: Aguardando pagamento (Milkshake + Onion Rings)
  if (mesa3 && milkshake && onion) {
    const seq = await prisma.orderSequence.upsert({
      where: { date: hoje },
      update: { lastNumber: { increment: 1 } },
      create: { date: hoje, lastNumber: 1 },
    })
    await prisma.order.create({
      data: {
        tableId: mesa3.id,
        status: 'WAITING_PAYMENT',
        total: milkshake.price + onion.price,
        orderNumber: seq.lastNumber,
        items: {
          create: [
            { productId: milkshake.id, quantity: 1, unitPrice: milkshake.price },
            { productId: onion.id, quantity: 1, unitPrice: onion.price },
          ],
        },
      },
    })
    console.log(`✅ Mesa 3 aguardando pagamento com pedido #${seq.lastNumber}`)
  }

  // Mesa 4: Pedido fechado (Suco + Capuccino)
  if (mesa4 && suco && capuccino) {
    const seq = await prisma.orderSequence.upsert({
      where: { date: hoje },
      update: { lastNumber: { increment: 1 } },
      create: { date: hoje, lastNumber: 1 },
    })
    await prisma.order.create({
      data: {
        tableId: mesa4.id,
        status: 'CLOSED',
        total: suco.price + capuccino.price,
        orderNumber: seq.lastNumber,
        items: {
          create: [
            { productId: suco.id, quantity: 1, unitPrice: suco.price },
            { productId: capuccino.id, quantity: 1, unitPrice: capuccino.price },
          ],
        },
      },
    })
    console.log(`✅ Mesa 4 fechada com pedido #${seq.lastNumber}`)
  }

  // Pedidos de delivery (2)
  // Delivery 1: Entregue
  const deliverySeq1 = await prisma.deliveryOrderSequence.upsert({
    where: { date: hoje },
    update: { lastNumber: { increment: 1 } },
    create: { date: hoje, lastNumber: 1 },
  })
  await prisma.deliveryOrder.create({
    data: {
      cliente: 'João Silva',
      telefone: '(11) 99999-1111',
      endereco: 'Rua das Flores, 123, Vila Mariana',
      complemento: 'Apto 42',
      referencia: 'Próximo ao mercado',
      pagamento: 'Pix',
      observacao: 'Entregar no portão',
      total: 35.0,
      status: 'ENTREGUE',
      orderNumber: deliverySeq1.lastNumber,
      items: {
        create: [
          { productId: xBurguer!.id, quantity: 1, unitPrice: xBurguer!.price },
          { productId: coca!.id, quantity: 1, unitPrice: coca!.price },
        ],
      },
    },
  })
  console.log(`✅ Delivery #${deliverySeq1.lastNumber} entregue`)

  // Delivery 2: Cancelado
  const deliverySeq2 = await prisma.deliveryOrderSequence.upsert({
    where: { date: hoje },
    update: { lastNumber: { increment: 1 } },
    create: { date: hoje, lastNumber: 1 },
  })
  await prisma.deliveryOrder.create({
    data: {
      cliente: 'Maria Oliveira',
      telefone: '(11) 98888-2222',
      endereco: 'Avenida Brasil, 456, Centro',
      complemento: null,
      referencia: null,
      pagamento: 'Cartão de Crédito',
      observacao: 'Sem cebola no hambúrguer',
      total: 26.0,
      status: 'CANCELADO',
      orderNumber: deliverySeq2.lastNumber,
      items: {
        create: [
          { productId: xBurguer!.id, quantity: 1, unitPrice: xBurguer!.price },
        ],
      },
    },
  })
  console.log(`✅ Delivery #${deliverySeq2.lastNumber} cancelado`)

  console.log('🌱 Seed concluído!')
  console.log('📊 Resumo:')
  console.log(`   - ${products.length} produtos`)
  console.log(`   - 15 mesas`)
  console.log(`   - 4 pedidos de salão (1 aberto, 1 aberto, 1 aguardando, 1 fechado)`)
  console.log(`   - 2 pedidos delivery (1 entregue, 1 cancelado)`)
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })