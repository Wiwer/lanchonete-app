// app/lib/apiClient.ts
import { toast } from 'react-hot-toast' // ou o toast que você estiver usando

interface ApiError {
  status: number
  message: string
  code?: string
  timestamp?: string
}

export class ApiError extends Error {
  status: number
  code?: string

  constructor(status: number, message: string, code?: string) {
    super(message)
    this.status = status
    this.code = code
    this.name = 'ApiError'
  }
}

export async function apiClient<T = any>(
  url: string,
  options: RequestInit = {},
  showToastOnError: boolean = true
): Promise<T> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    })

    const data = await res.json()

    if (!res.ok) {
      const errorMessage = data.error || data.message || 'Erro na requisição'
      const errorCode = data.code || data.statusCode
      if (showToastOnError) {
        // Usar seu toast (ex: showToast do contexto)
        // Você pode passar a função de toast como dependência ou usar um contexto global
        console.error('❌ API Error:', errorMessage)
        // Exemplo com toast do contexto:
        // showToast(`❌ ${errorMessage}`, 'error')
      }
      throw new ApiError(res.status, errorMessage, errorCode)
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) throw error
    // Erros de rede ou parse
    const message = error instanceof Error ? error.message : 'Erro de rede'
    if (showToastOnError) {
      console.error('❌ Network Error:', message)
      // showToast(`❌ ${message}`, 'error')
    }
    throw new ApiError(500, message, 'NETWORK_ERROR')
  }
}