/*
  Warnings:

  - Added the required column `amount` to the `account_banks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "account_banks" ADD COLUMN     "amount" INTEGER NOT NULL;
