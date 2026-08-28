// app/delivery/[id]/editar/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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

interface OrderItem {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  product: { name: string }
  observacao: string | null
}

export default function DeliveryEditarPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { showToast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [orderInfo, setOrderInfo] = useState<{ cliente: string; total: number } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar produtos
        const prodData = await apiClient('/api/products?ativos=true', { method: 'GET' }, false)
        setProducts(prodData)

        // Buscar pedido atual
        const order = await apiClient(`/api/delivery/${id}`, { method: 'GET' }, false)
        setOrderInfo({ cliente: order.cliente, total: order.total })

        // Carregar itens do pedido no carrinho
        const items = order.items.map((item: any) => ({
          productId: item.productId,
          name: item.product.name,
          price: item.unitPrice,
          quantity: item.quantity,
          observacao: item.observacao || undefined,
        }))
        setCart(items)
      } catch (error: any) {
        showToast(`❌ ${error.message || 'Erro ao carregar dados'}`, 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const groupedProducts = products.reduce((acc, product) => {
    const categoryName = product.category?.name || 'Outros'
    if (!acc[categoryName]) {
      acc[categoryName] = []
    }
    acc[categoryName].push(product)
    return acc
  }, {} as Record<string, Product[]>)

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
    if (cart.length === 0) {
      showToast('⚠️ Adicione pelo menos um item', 'warning')
      return
    }

    setEnviando(true)
    try {
      const payload = {
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          observacao: item.observacao || null,
        })),
      }

      await apiClient(`/api/delivery/${id}/items`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }, false)

      showToast('✅ Pedido atualizado com sucesso!', 'success')
      router.push(`/delivery/${id}`)
    } catch (error: any) {
      showToast(`❌ ${error.message || 'Erro ao atualizar pedido'}`, 'error')
    } finally {
      setEnviando(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <span className="text-gray-500">Carregando...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">✏️</span>
              <h1 className="text-3xl font-bold text-gray-800">
                Editar Pedido -  #{id.slice(0, 6)}
              </h1>
            </div>
            <Link
              href={`/delivery/${id}`}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-700 font-medium"
            >
              ← Voltar
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cardápio */}
            <div className="md:col-span-2 bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">📋 Cardápio</h2>
              {Object.keys(groupedProducts).length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum produto ativo.</p>
              ) : (
                Object.entries(groupedProducts).map(([categoryName, prods]) => (
                  <div key={categoryName} className="mb-4 last:mb-0">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">{categoryName}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {prods.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => adicionarAoCarrinho(product)}
                          className="flex justify-between items-center p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left border border-gray-200 text-sm"
                        >
                          <span className="font-medium text-gray-800">{product.name}</span>
                          <span className="text-green-600 font-bold">R$ {product.price.toFixed(2)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Carrinho */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                🛒 Itens
                <span className="text-sm font-normal text-gray-500">({cart.length})</span>
              </h2>

              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum item.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
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

          <div className="mt-6 flex justify-end gap-3">
            <Link
              href={`/delivery/${id}`}
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
              {enviando ? 'Salvando...' : '✅ Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}