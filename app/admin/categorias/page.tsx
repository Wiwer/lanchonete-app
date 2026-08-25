// app/admin/categorias/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useToast } from '@/app/context/ToastContext'

interface Category {
  id: string
  name: string
  description: string | null
  _count?: {
    products: number
  }
}

export default function AdminCategoriasPage() {
  const { showToast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('Erro ao buscar categorias')
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      showToast('❌ Erro ao carregar categorias', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleOpenCreate = () => {
    setEditingCategory(null)
    setFormData({ name: '', description: '' })
    setShowModal(true)
  }

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    const { name, description } = formData
    if (!name.trim()) {
      showToast('⚠️ O nome é obrigatório', 'warning')
      return
    }

    try {
      const url = '/api/categories'
      const method = editingCategory ? 'PUT' : 'POST'
      const body = {
        id: editingCategory?.id,
        name: name.trim(),
        description: description.trim() || null,
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

      showToast(editingCategory ? '✅ Categoria atualizada!' : '✅ Categoria criada!', 'success')
      setShowModal(false)
      fetchCategories()
    } catch (error) {
      showToast('❌ Erro ao salvar categoria', 'error')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${name}"?`)) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const error = await res.json()
        showToast(`❌ ${error.error}`, 'error')
        return
      }

      showToast(`✅ Categoria "${name}" excluída com sucesso!`, 'success')
      fetchCategories()
    } catch (error) {
      showToast('❌ Erro ao excluir categoria', 'error')
    } finally {
      setIsDeleting(false)
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
            <h1 className="text-3xl font-bold text-gray-900">📂 Gerenciar Categorias</h1>
            <Link href="/admin" className="text-blue-600 hover:text-blue-800 font-medium">
              ← Voltar ao Admin
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Categorias</h2>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
            >
              <span>+</span> Nova Categoria
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Nome</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Descrição</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Produtos</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Ações</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-800">{category.name}</td>
                    <td className="py-3 px-4 text-gray-600">{category.description || '-'}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {category._count?.products || 0}
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        onClick={() => handleOpenEdit(category)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(category.id, category.name)}
                        disabled={isDeleting || (category._count?.products || 0) > 0}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors font-medium ${
                          isDeleting || (category._count?.products || 0) > 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                        title={
                          (category._count?.products || 0) > 0
                            ? 'Não é possível excluir categoria com produtos associados'
                            : ''
                        }
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      Nenhuma categoria cadastrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de criar/editar categoria */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingCategory ? '✏️ Editar Categoria' : '➕ Nova Categoria'}
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-1">Nome *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                placeholder="Ex: Porções"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-800 mb-1">Descrição</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                placeholder="Descrição opcional"
              />
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
                {editingCategory ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}