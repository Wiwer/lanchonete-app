// app/lib/formatOrderNumber.ts
export function formatOrderNumber(orderNumber: number, createdAt: string | Date): string {
  let date: Date
  if (typeof createdAt === 'string') {
    date = new Date(createdAt)
  } else {
    date = createdAt
  }
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '')
  return `${dateStr}-${String(orderNumber).padStart(3, '0')}`
}