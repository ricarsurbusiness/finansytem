-- CreateTable
CREATE TABLE "public"."CajaDiaria" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "base" DOUBLE PRECISION NOT NULL,
    "efectivo" DOUBLE PRECISION NOT NULL,
    "ingresos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gastos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balance" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CajaDiaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Compra" (
    "id" SERIAL NOT NULL,
    "concepto" TEXT,
    "monto" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "providerId" INTEGER,
    "cajaId" INTEGER NOT NULL,

    CONSTRAINT "Compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Venta" (
    "id" SERIAL NOT NULL,
    "concepto" TEXT,
    "total" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cajaId" INTEGER NOT NULL,

    CONSTRAINT "Venta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CajaDiaria_fecha_key" ON "public"."CajaDiaria"("fecha");

-- AddForeignKey
ALTER TABLE "public"."Compra" ADD CONSTRAINT "Compra_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."UserProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Compra" ADD CONSTRAINT "Compra_cajaId_fkey" FOREIGN KEY ("cajaId") REFERENCES "public"."CajaDiaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Venta" ADD CONSTRAINT "Venta_cajaId_fkey" FOREIGN KEY ("cajaId") REFERENCES "public"."CajaDiaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
