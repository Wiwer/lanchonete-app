// app/api/docs/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lanchonete API',
      version: '1.0.0',
      description: 'API para gerenciamento de lanchonete - Next.js + Prisma',
      contact: {
        name: 'Seu Nome',
        email: 'seu-email@exemplo.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desenvolvimento',
      },
    ],
    components: {
      schemas: {
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            price: { type: 'number', format: 'float' },
            active: { type: 'boolean' },
            categoryId: { type: 'string' },
            category: { $ref: '#/components/schemas/Category' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            products: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            orderNumber: { type: 'integer' },
            tableId: { type: 'string' },
            table: { $ref: '#/components/schemas/Table' },
            status: { type: 'string', enum: ['OPEN', 'WAITING_PAYMENT', 'CLOSED'] },
            total: { type: 'number', format: 'float' },
            items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        OrderItem: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            quantity: { type: 'integer' },
            unitPrice: { type: 'number', format: 'float' },
            productId: { type: 'string' },
            product: { $ref: '#/components/schemas/Product' },
            orderId: { type: 'string' },
          },
        },
        Table: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            number: { type: 'integer' },
            orders: { type: 'array', items: { $ref: '#/components/schemas/Order' } },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    tags: [
      { name: 'Products', description: 'Gerenciamento de produtos' },
      { name: 'Categories', description: 'Gerenciamento de categorias' },
      { name: 'Orders', description: 'Gerenciamento de pedidos' },
      { name: 'Tables', description: 'Gerenciamento de mesas' },
      { name: 'History', description: 'Histórico de pedidos' },
      { name: 'Dashboard', description: 'Métricas e gráficos' },
    ],
  },
  apis: ['app/api/**/*.ts', 'app/api/**/*.js'],
}

export const swaggerSpec = swaggerJsdoc(options)