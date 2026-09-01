//🔄 Como restaurar um backup
//Para restaurar um backup específico://

//bash//
//cp backups/backup-20260831-1430.db dev.db//

// scripts/auto-backup.js
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

const DB_FILE = path.resolve(process.cwd(), 'dev.db')
const BACKUP_DIR = path.resolve(process.cwd(), 'backups')

// Criar pasta de backups se não existir
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true })
}

function fazerBackup() {
  if (!fs.existsSync(DB_FILE)) {
    console.log('⚠️ Banco de dados não encontrado. Nenhum backup criado.')
    return
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const backupFile = path.join(BACKUP_DIR, `dev-backup-${timestamp}.db`)

  fs.copyFileSync(DB_FILE, backupFile)
  console.log(`✅ Backup criado: ${path.basename(backupFile)}`)
}

// Backup imediato ao iniciar
console.log('🔄 Iniciando sistema de backup automático...')
fazerBackup()

// Agendar backup a cada hora (3600000 ms)
setInterval(fazerBackup, 3600000)

console.log('⏰ Backup automático configurado (a cada 1 hora)')
console.log(`📁 Pasta de backups: ${BACKUP_DIR}`)