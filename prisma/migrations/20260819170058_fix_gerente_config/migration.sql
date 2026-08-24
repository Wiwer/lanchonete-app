-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GerenteConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "senha" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_GerenteConfig" ("id", "senha", "updatedAt") SELECT "id", "senha", "updatedAt" FROM "GerenteConfig";
DROP TABLE "GerenteConfig";
ALTER TABLE "new_GerenteConfig" RENAME TO "GerenteConfig";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
