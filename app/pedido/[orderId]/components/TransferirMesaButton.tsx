'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/app/context/ToastContext'
import { apiClient } from '@/app/lib/apiClient' // <-- NOVA IMPORTAÇÃO

interface TransferirMesaButtonProps {
  orderId: string
  currentTableNumber: number
}

export default function TransferirMesaButton({
  orderId,
  currentTableNumber,
}: TransferirMesaButtonProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [mesasLivres, setMesasLivres] = useState<number[]>([])
  const [mostrarModal, setMostrarModal] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [mesaSelecionada, setMesaSelecionada] = useState<number | null>(null)

  const abrirModal = async () => {
    setCarregando(true)
    setMesaSelecionada(null)
    try {
      const data = await apiClient('/api/tables/free', { method: 'GET' }, false)
      const livres = data
        .filter((num: number) => num !== currentTableNumber)
        .sort((a: number, b: number) => a - b)
      setMesasLivres(livres)
      setMostrarModal(true)
    } catch (error: any) {
      showToast(`❌ ${error.message || 'Erro ao buscar mesas livres'}`, 'error')
    } finally {
      setCarregando(false)
    }
  }

  const transferir = async (newTableNumber: number) => {
    setCarregando(true)
    try {
      await apiClient('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          action: 'transfer',
          orderId,
          newTableNumber,
        }),
      }, false)

      router.refresh()
      setMostrarModal(false)
      showToast(`✅ Conta transferida para a mesa ${newTableNumber}!`, 'success')
    } catch (error: any) {
      showToast(`❌ ${error.message || 'Erro ao transferir'}`, 'error')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <>
      <button
        onClick={abrirModal}
        className="mt-2 w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
      >
        🔄 Transferir mesa
      </button>

      {mostrarModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
          onClick={() => setMostrarModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              🔄 Transferir conta
            </h2>
            <p className="text-gray-600 mb-1">
              Mesa atual: <span className="font-semibold bg-blue-50 px-2 py-0.5 rounded">{currentTableNumber}</span>
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Selecione a mesa de destino (livre):
            </p>

            {carregando ? (
              <div className="flex justify-center py-8">
                <span className="text-gray-500">Carregando mesas...</span>
              </div>
            ) : mesasLivres.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center text-yellow-700">
                🚫 Nenhuma mesa livre disponível no momento.
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {mesasLivres.map((num) => {
                  const isSelected = mesaSelecionada === num
                  return (
                    <button
                      key={num}
                      onClick={() => setMesaSelecionada(num)}
                      className={`
                        flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-200
                        border-2
                        ${isSelected
                          ? 'bg-green-100 border-green-500 shadow-md scale-105'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                        }
                      `}
                    >
                      <span className="text-2xl">🍽️</span>
                      <span className={`text-lg font-bold ${isSelected ? 'text-green-700' : 'text-gray-700'}`}>
                        {num}
                      </span>
                      {isSelected && (
                        <span className="text-xs text-green-600 font-semibold mt-0.5">✓ selecionada</span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setMostrarModal(false)}
                className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-xl transition-colors text-gray-700 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (mesaSelecionada !== null) {
                    transferir(mesaSelecionada)
                  } else {
                    showToast('⚠️ Selecione uma mesa para transferir.', 'warning')
                  }
                }}
                disabled={mesaSelecionada === null || carregando}
                className={`
                  flex-1 py-2.5 rounded-xl font-semibold transition-all duration-200
                  ${mesaSelecionada !== null && !carregando
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {carregando ? 'Transferindo...' : '✅ Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}