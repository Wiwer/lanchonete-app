// app/delivery/novo/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/app/context/ToastContext'
import { apiClient } from '@/app/lib/apiClient'

interface Product {
  id: string
  name: string
  price: number
  active: boolean
  category?: {
    id: string
    name: string
  } | null
}

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  observacao?: string
}

export default function DeliveryNovoPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [formData, setFormData] = useState({
    cliente: '',
    telefone: '',
    endereco: '',
    complemento: '',
    referencia: '',
    pagamento: '',
    observacao: '',
  })

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await apiClient('/api/products?ativos=true', { method: 'GET' }, false)
        setProducts(data)
      } catch (error: any) {
        showToast(`❌ ${error.message || 'Erro ao carregar produtos'}`, 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const adicionarAoCarrinho = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id)
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      }]
    })
  }

  const removerDoCarrinho = (productId: string, removerTodos = false) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId)
      if (!existing) return prev
      if (removerTodos || existing.quantity <= 1) {
        return prev.filter((item) => item.productId !== productId)
      }
      return prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    })
  }

  const totalCarrinho = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { cliente, telefone, endereco } = formData
    if (!cliente || !telefone || !endereco) {
      showToast('⚠️ Preencha nome, telefone e endereço', 'warning')
      return
    }
    if (cart.length === 0) {
      showToast('⚠️ Adicione pelo menos um item', 'warning')
      return
    }

    setEnviando(true)
    try {
      const payload = {
        ...formData,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          observacao: item.observacao || null,
        })),
      }

      await apiClient('/api/delivery', {
        method: 'POST',
        body: JSON.stringify(payload),
      }, false)

      showToast('✅ Pedido criado com sucesso!', 'success')
      router.push('/delivery')
    } catch (error: any) {
      showToast(`❌ ${error.message || 'Erro ao criar pedido'}`, 'error')
    } finally {
      setEnviando(false)
    }
  }

  const groupedProducts = products.reduce((acc, product) => {
    const categoryName = product.category?.name || 'Outros'
    if (!acc[categoryName]) {
      acc[categoryName] = []
    }
    acc[categoryName].push(product)
    return acc
  }, {} as Record<string, Product[]>)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <span className="text-gray-500">Carregando cardápio...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">📝</span>
              <h1 className="text-3xl font-bold text-gray-800">Novo Pedido Delivery</h1>
            </div>
            <Link
              href="/delivery"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-700 font-medium"
            >
              ← Voltar
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Dados do cliente */}
            <div className="md:col-span-2 bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">👤 Dados do Cliente</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input
                    type="text"
                    value={formData.cliente}
                    onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Nome do cliente"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço *</label>
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Rua, número, bairro"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                  <input
                    type="text"
                    value={formData.complemento}
                    onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Apto, bloco, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Referência</label>
                  <input
                    type="text"
                    value={formData.referencia}
                    onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Perto do mercado, etc."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
                  <select
                    value={formData.pagamento}
                    onChange={(e) => setFormData({ ...formData, pagamento: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Selecione</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Pix">Pix</option>
                    <option value="Vale Refeição">Vale Refeição</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                  <textarea
                    value={formData.observacao}
                    onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Instruções adicionais..."
                  />
                </div>
              </div>
            </div>

            {/* Cardápio e Carrinho */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">🛒 Itens</h2>
              <div className="max-h-60 overflow-y-auto mb-4 space-y-2">
                {Object.entries(groupedProducts).map(([categoryName, prods]) => (
                  <div key={categoryName}>
                    <h3 className="text-sm font-semibold text-gray-600 mt-2 first:mt-0">{categoryName}</h3>
                    {prods.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => adicionarAoCarrinho(product)}
                        className="w-full flex justify-between items-center p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left border border-gray-200 text-sm"
                      >
                        <span className="font-medium text-gray-800">{product.name}</span>
                        <span className="text-green-600 font-bold">R$ {product.price.toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum item adicionado.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <span className="font-medium text-gray-800 text-sm">{item.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() => removerDoCarrinho(item.productId)}
                            className="w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded flex items-center justify-center text-xs"
                          >
                            −
                          </button>
                          <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => adicionarAoCarrinho({ id: item.productId, name: item.name, price: item.price, active: true })}
                            className="w-5 h-5 bg-green-500 hover:bg-green-600 text-white rounded flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <span className="font-bold text-green-600 text-sm">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-green-700">R$ {totalCarrinho.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botão enviar */}
          <div className="mt-6 flex justify-end gap-3">
            <Link
              href="/delivery"
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-700 font-medium"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={enviando}
              className={`px-6 py-2 rounded-lg font-medium transition-colors text-white ${
                enviando
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {enviando ? 'Criando...' : '✅ Criar Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}