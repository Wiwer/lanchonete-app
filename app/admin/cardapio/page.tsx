// app/admin/cardapio/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useToast } from '@/app/context/ToastContext'

interface Category {
  id: string
  name: string
}

interface Product {
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
    categoryId: '',
  })

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

  const handleOpenCreate = () => {
    setEditingProduct(null)
    setFormData({ name: '', price: '', categoryId: '' })
    setShowModal(true)
  }

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      categoryId: product.categoryId || '',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    const { name, price, categoryId } = formData
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Produtos</h2>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
            >
              <span>+</span> Adicionar Produto
            </button>
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
                {products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`font-medium ${!product.active ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                        {product.name}
                      </span>
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
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      Nenhum produto cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
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