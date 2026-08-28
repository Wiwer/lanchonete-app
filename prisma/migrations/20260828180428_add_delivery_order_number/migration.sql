-- CreateTable
CREATE TABLE "DeliveryOrderSequence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "lastNumber" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DeliveryOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cliente" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "complemento" TEXT,
    "referencia" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "pagamento" TEXT,
    "observacao" TEXT,
    "total" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "orderNumber" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_DeliveryOrder" ("cliente", "complemento", "createdAt", "endereco", "id", "observacao", "pagamento", "referencia", "status", "telefone", "total", "updatedAt") SELECT "cliente", "complemento", "createdAt", "endereco", "id", "observacao", "pagamento", "referencia", "status", "telefone", "total", "updatedAt" FROM "DeliveryOrder";
DROP TABLE "DeliveryOrder";
ALTER TABLE "new_DeliveryOrder" RENAME TO "DeliveryOrder";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryOrderSequence_date_key" ON "DeliveryOrderSequence"("date");
