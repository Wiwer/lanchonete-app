# 🍔 Sistema de Gerenciamento de Lanchonete

Sistema completo para gerenciamento de lanchonete com módulos para **salão** e **delivery**, desenvolvido com Next.js, Prisma e SQLite.

---

## ✨ Funcionalidades

### 📋 Cardápio
- Visualização pública do cardápio com **categorias** (Lanches, Bebidas, Sobremesas, etc.)
- Produtos com **descrição** e status (Ativo/Inativo)
- Ordenação personalizada das categorias via drag-and-drop (admin)

### 👨‍🍳 Garçom
- Abrir mesas e criar pedidos (com carrinho temporário)
- Adicionar itens a mesas já abertas
- Visualizar pedidos em andamento
- Transferir mesas

### 📊 Admin (Painel Administrativo)
- **Gerenciar Cardápio**: criar, editar, ativar/desativar produtos (com descrição e categoria)
- **Gerenciar Categorias**: criar, editar, excluir e **reordenar** categorias com drag-and-drop
- **Visualizar Produtos por Categoria**: modal com filtro por status (Ativo/Inativo)
- **Mesas**: visualização e gerenciamento de mesas ocupadas/livres
- **Dashboard de Vendas**: gráficos e métricas (faturamento, ticket médio, variação, itens mais vendidos) com filtros por **Salão** e **Delivery**
- **Histórico Unificado**: pedidos de salão e delivery com filtros por data, tipo, mesa (badges clicáveis) e busca por número do pedido ou cliente

### 🛵 Delivery
- Listagem de pedidos com filtros por status (Pendente, Em preparo, Saiu para entrega, Entregue, Cancelado)
- Criação de pedido com dados do cliente e seleção de produtos do cardápio
- Edição de pedidos (apenas em status Pendente)
- Alteração de status (fluxo: Pendente → Em preparo → Saiu para entrega → Entregue)
- Impressão de comanda específica para delivery
- Número sequencial por dia (ex: `20260828-001`)

### 💳 Pagamentos
- Lista de mesas aguardando pagamento
- Confirmar pagamento (muda status para `CLOSED`)
- Reabrir mesa para ajustes (volta para `OPEN`)
- Senha do gerente para cancelamento de abertura

### 📜 Histórico
- Pedidos finalizados de **salão** e **delivery** em uma única página
- Filtros: data (início/fim), tipo (Todos/Salão/Delivery), mesa (badges), total (mín/máx)
- Busca por número do pedido (salão: `20260828-001`, delivery: `20260828-001`) ou nome do cliente
- Modal de detalhes com todos os itens do pedido

### 🖨️ Impressão
- Comanda de pedidos (salão e delivery) com modal de visualização
- Impressão otimizada (apenas o conteúdo da comanda)

### 🔧 Outros
- **Números de pedido sequenciais por dia** (salão e delivery)
- **Modo de manutenção** (ativável via banco de dados)
- **Páginas de erro personalizadas** (404, 500)
- **Tratamento centralizado de erros** (apiClient com toasts)
- **Auto-refresh** nas páginas de mesas e fechamentos
- **Componentização** de elementos reutilizáveis (ex: Badge "Em breve")

---

## 🛠️ Tecnologias

- **Next.js 16** (App Router)
- **Prisma 7** (ORM)
- **SQLite** (banco de dados local)
- **Tailwind CSS** (estilização)
- **TypeScript**
- **Recharts** (gráficos)
- **@dnd-kit** (drag-and-drop)
- **date-fns** (manipulação de datas)
- **@headlessui/react** (popovers)

---

## 🚀 Como executar

### 1. Clone o repositório
```bash
git clone https://github.com/Wiwer/lanchonete-app.git
cd lanchonete-app
2. Instale as dependências
bash
npm install
3. Configure o banco de dados
bash
npx prisma generate
npx prisma db push
npx prisma db seed
4. Execute o projeto
bash
npm run dev
5. Acesse
text
http://localhost:3000
🔐 Credenciais padrão
Senha do gerente: 123

Modo de manutenção: desativado por padrão (ativar via Prisma Studio em SystemConfig)

📂 Estrutura do Projeto (resumida)
text
app/
├── admin/               # Painel administrativo
│   ├── cardapio/        # Gerenciar produtos
│   ├── categorias/      # Gerenciar categorias
│   ├── dashboard/       # Métricas e gráficos
│   └── page.tsx         # Hub do admin
├── api/                 # Rotas da API
│   ├── categories/      # CRUD categorias + reorder
│   ├── delivery/        # CRUD pedidos delivery
│   ├── history/         # Histórico unificado
│   ├── orders/          # Pedidos do salão
│   ├── products/        # CRUD produtos
│   └── tables/          # Listagem de mesas
├── delivery/            # Módulo de delivery
│   ├── page.tsx         # Listagem de pedidos
│   ├── novo/            # Criar pedido
│   └── [id]/            # Detalhes e edição
├── garcom/              # Área do garçom
├── historico/           # Página de histórico
├── caixa/               # Pagamentos (antigo fechamentos)
├── components/          # Componentes reutilizáveis
├── context/             # Contextos (Toast, etc.)
└── lib/                 # Utilitários
🧪 Testes
Para testar o sistema:

Admin: acesse /admin e explore as funcionalidades.

Garçom: acesse /garcom, abra uma mesa e faça um pedido.

Delivery: acesse /delivery, crie e gerencie pedidos.

Dashboard: acesse /admin/dashboard para visualizar métricas.

📝 Licença
MIT © Seu Nome

🤝 Contribuindo
Contribuições são bem-vindas! Siga os passos:

Fork o projeto

Crie uma branch (git checkout -b feature/nova-funcionalidade)

Commit suas alterações (git commit -m 'feat: adiciona nova funcionalidade')

Push para a branch (git push origin feature/nova-funcionalidade)

Abra um Pull Request