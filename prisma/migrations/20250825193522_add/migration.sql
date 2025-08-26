-- CreateTable
CREATE TABLE "public"."UserProvider" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "num_tel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserProvider_pkey" PRIMARY KEY ("id")
);
