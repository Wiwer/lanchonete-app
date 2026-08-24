// app/hooks/useToast.ts
'use client'

import { useToast } from '@/app/context/ToastContext'

export function useToastHook() {
  const { showToast } = useToast()
  return { showToast }
}