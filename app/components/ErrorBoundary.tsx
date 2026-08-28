'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('❌ Erro capturado pelo ErrorBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-[200px] flex flex-col items-center justify-center p-6 bg-red-50 rounded-xl border border-red-200 text-red-800">
            <span className="text-4xl mb-2">⚠️</span>
            <h3 className="text-lg font-semibold">Algo deu errado</h3>
            <p className="text-sm text-red-600 mt-1">
              {this.state.error?.message || 'Erro inesperado. Tente recarregar a página.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              Recarregar página
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}