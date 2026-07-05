-- CreateEnum
CREATE TYPE "TipoReclamo" AS ENUM ('RECLAMO', 'QUEJA');

-- CreateTable
CREATE TABLE "Reclamo" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipo" "TipoReclamo" NOT NULL,
    "nombre" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "domicilio" TEXT,
    "telefono" TEXT,
    "email" TEXT NOT NULL,
    "tipoBien" TEXT,
    "descripcionBien" TEXT,
    "monto" DECIMAL(10,2),
    "detalle" TEXT NOT NULL,
    "pedidoConsumidor" TEXT,
    "respuesta" TEXT,
    "atendido" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reclamo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reclamo_codigo_key" ON "Reclamo"("codigo");
