# 🍔 Sistema de Gerenciamento de Lanchonete

Sistema completo para gerenciamento de lanchonete desenvolvido com Next.js, Prisma e SQLite.

## ✨ Funcionalidades

- 📋 **Cardápio** - Visualizar produtos ativos
- 📊 **Admin** - Gerenciar cardápio, mesas e fechamentos
- 👨‍🍳 **Garçom** - Abrir mesas, criar pedidos e adicionar itens
- 💳 **Fechamentos** - Confirmar pagamentos
- 📜 **Histórico** - Visualizar pedidos finalizados

## 🛠️ Tecnologias

- Next.js 16 (App Router)
- Prisma 7
- SQLite
- Tailwind CSS
- TypeScript

## 🚀 Como executar

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/lanchonete-app.git
   cd lanchonete-app
Instale as dependências:

bash
npm install
Configure o banco de dados:

bash
npx prisma generate
npx prisma db push
npx prisma db seed
Execute o projeto:

bash
npm run dev
Acesse: http://localhost:3000

🔐 Senha padrão
Senha do gerente: 1234

📄 Licença
MIT
.