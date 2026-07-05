-- CreateEnum
CREATE TYPE "MomentoRutina" AS ENUM ('DIA', 'NOCHE', 'AMBOS');

-- CreateTable
CREATE TABLE "Rutina" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipoPiel" TEXT NOT NULL,
    "portadaUrl" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Rutina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RutinaPaso" (
    "id" TEXT NOT NULL,
    "rutinaId" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "momento" "MomentoRutina" NOT NULL DEFAULT 'AMBOS',

    CONSTRAINT "RutinaPaso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RutinaPasoProductos" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RutinaPasoProductos_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rutina_slug_key" ON "Rutina"("slug");

-- CreateIndex
CREATE INDEX "RutinaPaso_rutinaId_idx" ON "RutinaPaso"("rutinaId");

-- CreateIndex
CREATE INDEX "_RutinaPasoProductos_B_index" ON "_RutinaPasoProductos"("B");

-- AddForeignKey
ALTER TABLE "RutinaPaso" ADD CONSTRAINT "RutinaPaso_rutinaId_fkey" FOREIGN KEY ("rutinaId") REFERENCES "Rutina"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RutinaPasoProductos" ADD CONSTRAINT "_RutinaPasoProductos_A_fkey" FOREIGN KEY ("A") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RutinaPasoProductos" ADD CONSTRAINT "_RutinaPasoProductos_B_fkey" FOREIGN KEY ("B") REFERENCES "RutinaPaso"("id") ON DELETE CASCADE ON UPDATE CASCADE;
