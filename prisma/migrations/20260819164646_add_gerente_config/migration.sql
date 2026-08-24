-- CreateTable
CREATE TABLE "GerenteConfig" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'single',
    "senha" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
