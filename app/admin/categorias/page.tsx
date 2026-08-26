// app/admin/categorias/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useToast } from '@/app/context/ToastContext'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'

interface Category {
  id: string
  name: string
  description: string | null
  _count?: {
    products: number
  }
}

interface Product {
  categoryId: string
  id: string
  name: string
  price: number
  active: boolean
}

const SortableItem = ({ category }: { category: Category }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-grab hover:bg-gray-100 transition-colors"
    >
      <span className="font-medium text-gray-800">{category.name}</span>
      <span className="text-sm text-gray-400">↕</span>
    </div>
  )
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
  const [showProductsModal, setShowProductsModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'inativo'>('todos')
  const [showReorderModal, setShowReorderModal] = useState(false)
  const [orderedCategories, setOrderedCategories] = useState<Category[]>([])
  const [isReordering, setIsReordering] = useState(false)

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

  useEffect(() => {
    Promise.all([fetchCategories(), fetchProducts()])
  }, [])
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
)
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
// Funções para reordenar categorias
const openReorderModal = () => {
  setOrderedCategories([...categories])
  setShowReorderModal(true)
}

const closeReorderModal = () => {
  setShowReorderModal(false)
  setOrderedCategories([])
}

const saveReorder = async () => {
  setIsReordering(true)
  try {
    const payload = orderedCategories.map((cat, index) => ({
      id: cat.id,
      order: index + 1,
    }))
    const res = await fetch('/api/categories/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories: payload }),
    })
    if (!res.ok) {
      const error = await res.json()
      showToast(`❌ ${error.error}`, 'error')
      return
    }
    showToast('✅ Ordem das categorias atualizada!', 'success')
    fetchCategories()
    closeReorderModal()
  } catch (error) {
    showToast('❌ Erro ao reordenar', 'error')
  } finally {
    setIsReordering(false)
  }
}
  // Função para abrir o modal de produtos
  const openProductsModal = (category?: Category) => {
    if (category) {
      setSelectedCategory(category)
    }
    setStatusFilter('ativo')
    setShowProductsModal(true)
  }

  const closeProductsModal = () => {
    setShowProductsModal(false)
    setSelectedCategory(null)
  }

  const handleToggleActive = async (productId: string, currentActive: boolean) => {
  try {
    const res = await fetch('/api/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: productId,
        active: !currentActive,
      }),
    })

    if (!res.ok) {
      const error = await res.json()
      showToast(`❌ ${error.error}`, 'error')
      return
    }

    // Recarregar a lista de produtos para atualizar o modal
    await fetchProducts()
    showToast(currentActive ? '✅ Produto desativado' : '✅ Produto ativado', 'success')
  } catch (error) {
    showToast('❌ Erro ao alterar status', 'error')
  }
}

  const filteredProducts = selectedCategory
  ? products
      .filter((product) => product.categoryId === selectedCategory.id)
      .filter((product) => {
        if (statusFilter === 'todos') return true
        if (statusFilter === 'ativo') return product.active === true
        if (statusFilter === 'inativo') return product.active === false
        return true
      })
  : []
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
            <button
              onClick={openReorderModal}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
            >
              🔄 Ordenar Categorias
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
                        onClick={() => openProductsModal(category)}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors font-medium"
                      >
                        📋 Ver Produtos
                      </button>
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

      {/* Modal de produtos da categoria */}
      {showProductsModal && selectedCategory && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && closeProductsModal()}
        >
          <div className="bg-white rounded-xl shadow-3xl p-6 max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                📋 Produtos - {selectedCategory.name}
              </h2>
              <button
                onClick={closeProductsModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setStatusFilter('todos')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'todos'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setStatusFilter('ativo')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'ativo'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Ativos
              </button>
              <button
                onClick={() => setStatusFilter('inativo')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'inativo'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Inativos
              </button>
              <span className="ml-auto text-sm text-gray-500">
                {filteredProducts.length} produto(s)
              </span>
            </div>
            <div className="flex-1 overflow-y-auto min-h-[200px]">
              {filteredProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum produto nesta categoria.</p>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b sticky top-0 z-10">
                    <tr>
                      <th className="text-left py-2 px-3 font-semibold text-gray-800">Nome</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-800">Preço</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-800">Status</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-800">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3 text-gray-800">{product.name}</td>
                        <td className="py-2 px-3 text-gray-800">R$ {product.price.toFixed(2)}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            product.active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {product.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <button
                            onClick={() => handleToggleActive(product.id, product.active)}
                            className={`px-2 py-1 text-xs rounded-lg font-medium transition-colors ${
                              product.active
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                          >
                            {product.active ? 'Desativar' : 'Ativar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeProductsModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-800 font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      {showReorderModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && closeReorderModal()}
        >
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">🔄 Ordenar Categorias</h2>
              <button
                onClick={closeReorderModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Arraste as categorias para reordená-las.</p>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={({ active, over }) => {
                if (!over) return
                const oldIndex = orderedCategories.findIndex((c) => c.id === active.id)
                const newIndex = orderedCategories.findIndex((c) => c.id === over.id)
                if (oldIndex !== newIndex) {
                  setOrderedCategories(arrayMove(orderedCategories, oldIndex, newIndex))
                }
              }}
            >
              <SortableContext items={orderedCategories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                <div className="flex-1 overflow-y-auto space-y-2 min-h-[150px]">
                  {orderedCategories.map((cat) => (
                    <SortableItem key={cat.id} category={cat} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeReorderModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-800 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={saveReorder}
                disabled={isReordering}
                className={`px-4 py-2 rounded-lg transition-colors text-white font-medium ${
                  isReordering
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {isReordering ? 'Salvando...' : 'Salvar Ordem'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  
)
}