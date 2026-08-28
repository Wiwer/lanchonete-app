// app/components/BadgeEmBreve.tsx
interface BadgeEmBreveProps {
  className?: string // para permitir customizações extras
}

export default function BadgeEmBreve({ className = '' }: BadgeEmBreveProps) {
  return (
    <span
      className={`absolute top-4 right-4 bg-amber-100 text-amber-800 text-base font-bold px-3 py-2.5 rounded-full flex items-center gap-1.5 border-2 border-amber-300 shadow-sm opacity-100 ${className}`}
    >
      🔒 Em breve
    </span>
  )
}