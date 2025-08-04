/*
  Warnings:

  - You are about to drop the column `icon` on the `categories` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BankName" ADD VALUE 'PAGSEGURO';
ALTER TYPE "BankName" ADD VALUE 'MERCADOPAGO';
ALTER TYPE "BankName" ADD VALUE 'STONE';
ALTER TYPE "BankName" ADD VALUE 'GETNET';
ALTER TYPE "BankName" ADD VALUE 'SAFRA';
ALTER TYPE "BankName" ADD VALUE 'BANRISUL';
ALTER TYPE "BankName" ADD VALUE 'SICOOB';
ALTER TYPE "BankName" ADD VALUE 'SICREDI';
ALTER TYPE "BankName" ADD VALUE 'OUTROS';

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "icon";
