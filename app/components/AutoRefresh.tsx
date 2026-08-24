'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AutoRefreshProps {
  interval?: number // em milissegundos, padrão 10000 (10s)
}

export default function AutoRefresh({ interval = 10000 }: AutoRefreshProps) {
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      router.refresh()
    }, interval)

    return () => clearInterval(timer)
  }, [router, interval])

  return null // não renderiza nada
}