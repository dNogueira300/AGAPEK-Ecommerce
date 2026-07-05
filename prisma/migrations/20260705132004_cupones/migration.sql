-- CreateEnum
CREATE TYPE "TipoCupon" AS ENUM ('PORCENTAJE', 'MONTO_FIJO');

-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "cuponCodigo" TEXT,
ADD COLUMN     "descuento" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Cupon" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" "TipoCupon" NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "minCompra" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "usoMaximo" INTEGER,
    "usos" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "inicioAt" TIMESTAMPTZ(6),
    "finAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Cupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cupon_codigo_key" ON "Cupon"("codigo");
