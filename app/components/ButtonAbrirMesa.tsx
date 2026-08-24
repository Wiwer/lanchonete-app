'use client'
import { useRouter } from 'next/navigation'

export default function ButtonAbrirMesa({ tableNumber, occupied }) {
  const router = useRouter()

  const handleClick = async () => {
    if (occupied) return

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'open', tableNumber }),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(`Erro: ${error.error}`)
        return
      }

      const order = await res.json()
      router.push(`/pedido/${order.id}`)
    } catch (error) {
      alert('Erro ao abrir mesa. Tente novamente.')
    }
  }

  return (
    <button
      className={`... ${occupied ? 'bg-gray-200' : 'bg-blue-600'}`}
      disabled={occupied}
      onClick={handleClick}
    >
      {occupied ? 'Em uso' : 'Abrir Mesa'}
    </button>
  )
}