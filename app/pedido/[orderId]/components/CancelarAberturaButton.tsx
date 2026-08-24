'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/app/context/ToastContext'

interface CancelarAberturaButtonProps {
  orderId: string
  tableNumber: number
  disabled?: boolean
}

export default function CancelarAberturaButton({
  orderId,
  tableNumber,
  disabled = false,
}: CancelarAberturaButtonProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [showModal, setShowModal] = useState(false)
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (disabled) return null

  const handleCancelar = async () => {
    if (!senha.trim()) {
      setErro('Digite a senha do gerente.')
      return
    }

    setLoading(true)
    setErro('')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel',
          orderId,
          password: senha,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErro(data.error || 'Senha inválida. Tente novamente.')
        setSenha('')
        return
      }

      setShowModal(false)
      setSenha('')
      showToast(`✅ Mesa ${tableNumber} cancelada com sucesso!`, 'success')
      router.push('/mesas')
    } catch (error) {
      setErro('Erro ao cancelar. Tente novamente.')
      setSenha('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="mt-2 px-3 py-1 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white"
        title="Cancelar abertura da mesa"
      >
        <span>🗑️</span> Cancelar
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-2">🗑️ Cancelar Abertura</h2>
            <p className="text-gray-600 mb-4">
              Mesa {tableNumber} será cancelada (não há consumo).<br />
              Digite a senha do gerente para confirmar:
            </p>

            <div className="mb-4">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => {
                    setSenha(e.target.value)
                    setErro('')
                  }}
                  placeholder="Senha do gerente"
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  setSenha('')
                  setErro('')
                }}
                className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-700 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleCancelar}
                disabled={loading}
                className={`flex-1 py-2 rounded-lg transition-colors text-white font-medium ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {loading ? 'Validando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}