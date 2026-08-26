// app/admin/cardapio/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useToast } from '@/app/context/ToastContext'
import { formatOrderNumber } from '@/app/lib/formatOrderNumber'
import { Popover } from '@headlessui/react'

interface Category {
  id: string
  name: string
}

interface Product {
  description: string
  id: string
  name: string
  price: number
  active: boolean
  categoryId: string | null
  category?: Category | null
}

export default function AdminCardapioPage() {
  const { showToast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    categoryId: '',
  })
  const [descricaoExpandida, setDescricaoExpandida] = useState(false)

  // Estados para os filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos') // 'todos', 'ativo', 'inativo'

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      if (!res.ok) throw new Error('Erro ao buscar produtos')
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      showToast('❌ Erro ao carregar produtos', 'error')
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('Erro ao buscar categorias')
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      showToast('❌ Erro ao carregar categorias', 'error')
    }
  }

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCategories()]).finally(() => setLoading(false))
  }, [])

  // Aplicar filtros na lista de produtos
  const filteredProducts = products.filter((product) => {
    // Filtro por nome
    const matchName = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    // Filtro por categoria
    const matchCategory = filterCategory ? product.categoryId === filterCategory : true
    // Filtro por status
    const matchStatus =
      filterStatus === 'todos'
        ? true
        : filterStatus === 'ativo'
        ? product.active === true
        : product.active === false
    return matchName && matchCategory && matchStatus
  })

  const handleOpenCreate = () => {
    setEditingProduct(null)
    setFormData({ name: '', price: '', description: '', categoryId: '' })
    setShowModal(true)
    setDescricaoExpandida(false)
  }

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description || '',
      categoryId: product.categoryId || '',
    })
    setShowModal(true)
    setDescricaoExpandida(false)
  }

  const handleSave = async () => {
    const { name, price, categoryId, description } = formData
    if (!name.trim() || !price) {
      showToast('⚠️ Preencha todos os campos', 'warning')
      return
    }

    try {
      const url = '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'
      const body = {
        id: editingProduct?.id,
        name: name.trim(),
        price: parseFloat(price),
        categoryId: categoryId || null,
        description: description || null,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const error = await res.json()
        showToast(`❌ ${error.error}`, 'error')
        return
      }

      showToast(editingProduct ? '✅ Produto atualizado!' : '✅ Produto criado!', 'success')
      setShowModal(false)
      fetchProducts()
    } catch (error) {
      showToast('❌ Erro ao salvar produto', 'error')
    }
  }

  const handleToggleActive = async (product: Product) => {
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          active: !product.active,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        showToast(`❌ ${error.error}`, 'error')
        return
      }

      showToast(product.active ? '✅ Produto desativado' : '✅ Produto ativado', 'success')
      fetchProducts()
    } catch (error) {
      showToast('❌ Erro ao alterar status', 'error')
    }
  }

  const limparFiltros = () => {
    setSearchTerm('')
    setFilterCategory('')
    setFilterStatus('todos')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <span className="text-gray-600">Carregando...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">📋 Gerenciar Cardápio</h1>
            <Link href="/admin" className="text-blue-600 hover:text-blue-800 font-medium">
              ← Voltar ao Admin
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Produtos</h2>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium whitespace-nowrap"
            >
              <span>+</span> Adicionar Produto
            </button>
          </div>

          {/* Barra de filtros */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">🔍 Buscar</label>
                <input
                  type="text"
                  placeholder="Nome do produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">📂 Categoria</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="">Todas</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">📊 Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="todos">Todos</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={limparFiltros}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium w-full md:w-auto"
                >
                  🧹 Limpar Filtros
                </button>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Mostrando {filteredProducts.length} de {products.length} produtos
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Nome</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Preço</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Categoria</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-1">
                  <span
                    className={`font-medium ${!product.active ? 'text-gray-500 line-through' : 'text-gray-800'}`}
                  >
                    {product.name}
                  </span>
                  {product.description && (
                    <Popover className="relative">
                      <Popover.Button className="text-gray-400 hover:text-blue-500 transition-colors focus:outline-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                          />
                        </svg>
                      </Popover.Button>
                      <Popover.Panel className="absolute z-10 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm text-gray-700">
                        {product.description}
                      </Popover.Panel>
                    </Popover>
                  )}
                </div>
              </td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${!product.active ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                        R$ {product.price.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">
                        {product.category?.name || 'Sem categoria'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        product.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {product.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        onClick={() => handleOpenEdit(product)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleActive(product)}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors font-medium ${
                          product.active
                            ? 'bg-orange-500 hover:bg-orange-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {product.active ? 'Desativar' : 'Ativar'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      Nenhum produto encontrado com os filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal (mesmo de antes) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingProduct ? '✏️ Editar Produto' : '➕ Novo Produto'}
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-1">Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                placeholder="Ex: X-Burguer"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-1">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                placeholder="Ex: 25.00"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-1">Descrição</label>
              <div className="relative">
                {!descricaoExpandida ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                      placeholder="Descrição do produto (opcional)"
                    />
                    <button
                      type="button"
                      onClick={() => setDescricaoExpandida(true)}
                      className="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-700 font-medium whitespace-nowrap"
                    >
                      📝
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 resize-y"
                      placeholder="Descrição completa do produto..."
                    />
                    <button
                      type="button"
                      onClick={() => setDescricaoExpandida(false)}
                      className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-700 font-medium"
                    >
                      🔽 Recolher
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-800 mb-1">Categoria</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="">Sem categoria</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-800 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                {editingProduct ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}