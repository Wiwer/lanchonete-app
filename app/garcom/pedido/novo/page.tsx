'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/app/context/ToastContext'

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
}

export default function GarcomNovoPedidoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  const mesaNumber = searchParams.get('mesa')

  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?ativos=true')
        if (!res.ok) throw new Error('Erro ao buscar produtos')
        const data = await res.json()
        setProducts(data)
      } catch (error) {
        showToast('❌ Erro ao carregar produtos', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Agrupar produtos por categoria
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

  const enviarPedido = async () => {
    if (cart.length === 0) {
      showToast('⚠️ Adicione pelo menos um item ao pedido', 'warning')
      return
    }
    if (!mesaNumber) {
      showToast('❌ Número da mesa não informado', 'error')
      return
    }

    setEnviando(true)
    try {
      const openRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'open',
          tableNumber: parseInt(mesaNumber),
        }),
      })
      if (!openRes.ok) {
        const error = await openRes.json()
        showToast(`❌ ${error.error}`, 'error')
        return
      }
      const order = await openRes.json()

      for (const item of cart) {
        const addRes = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'addItem',
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
          }),
        })
        if (!addRes.ok) {
          const error = await addRes.json()
          showToast(`❌ Erro ao adicionar ${item.name}: ${error.error}`, 'error')
          return
        }
      }

      showToast(`✅ Pedido da mesa ${mesaNumber} enviado com sucesso!`, 'success')
      router.push(`/garcom/pedido/${order.id}`)
    } catch (error) {
      showToast('❌ Erro ao enviar pedido', 'error')
    } finally {
      setEnviando(false)
    }
  }

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
        {/* Cabeçalho */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">📝</span>
              <h1 className="text-3xl font-bold text-gray-800">
                Novo Pedido - Mesa {mesaNumber}
              </h1>
            </div>
            <Link href="/garcom" className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-700 font-medium">
              ← Voltar às mesas
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cardápio agrupado por categoria */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📋 Cardápio</h2>
            {Object.keys(groupedProducts).length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum produto ativo no cardápio.</p>
            ) : (
              Object.entries(groupedProducts).map(([categoryName, prods]) => (
                <div key={categoryName} className="mb-6 last:mb-0">
                  <h3 className="text-md font-semibold text-gray-600 mb-2 border-b pb-1">
                    {categoryName}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {prods.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => adicionarAoCarrinho(product)}
                        className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left border border-gray-200"
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
              🛒 Pedido
              <span className="text-sm font-normal text-gray-500">({cart.length} itens)</span>
            </h2>

            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum item adicionado.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-gray-800">
                    <div className="flex-1">
                      <span className="font-medium text-gray-800">{item.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => removerDoCarrinho(item.productId)}
                          className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded flex items-center justify-center text-sm"
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold w-6 text-center text-gray-800">{item.quantity}</span>
                        <button
                          onClick={() => adicionarAoCarrinho({ id: item.productId, name: item.name, price: item.price, active: true })}
                          className="w-6 h-6 bg-green-500 hover:bg-green-600 text-white rounded flex items-center justify-center text-sm"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removerDoCarrinho(item.productId, true)}
                          className="ml-2 text-xs text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <span className="font-bold text-green-600">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-800">Total</span>
                <span className="text-2xl font-bold text-green-700">R$ {totalCarrinho.toFixed(2)}</span>
              </div>
              <button
                onClick={enviarPedido}
                disabled={enviando || cart.length === 0}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  enviando || cart.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {enviando ? 'Enviando...' : '📤 Enviar Pedido'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}