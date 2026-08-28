// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

// Força o middleware a rodar no Node.js runtime
export const runtime = 'nodejs'


// Instância global do Prisma (evita múltiplas conexões)
const adapter = new PrismaBetterSqlite3({
  url: `file:${process.cwd()}/dev.db`,
})
const prisma = new PrismaClient({ adapter })

export async function middleware(request: NextRequest) {
  // Buscar flag de manutenção
  const config = await prisma.systemConfig.findUnique({
    where: { id: 'single' },
  })

  const isUnderMaintenance = config?.maintenance ?? false

  // Se estiver em manutenção, redireciona para a página de manutenção
  if (isUnderMaintenance) {
    const pathname = request.nextUrl.pathname

    // Não redireciona se já estiver na página de manutenção
    if (pathname.startsWith('/maintenance')) {
      return NextResponse.next()
    }

    // Redireciona para manutenção
    return NextResponse.redirect(new URL('/maintenance', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|favicon.ico|.*\\..*).*)'],
}