/*
  Warnings:

  - You are about to drop the column `bankDestine` on the `transfers` table. All the data in the column will be lost.
  - You are about to drop the column `bankInitial` on the `transfers` table. All the data in the column will be lost.
  - Added the required column `bankDestineId` to the `transfers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bankInitialId` to the `transfers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transfers" DROP COLUMN "bankDestine",
DROP COLUMN "bankInitial",
ADD COLUMN     "bankDestineId" TEXT NOT NULL,
ADD COLUMN     "bankInitialId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_bankInitialId_fkey" FOREIGN KEY ("bankInitialId") REFERENCES "account_banks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_bankDestineId_fkey" FOREIGN KEY ("bankDestineId") REFERENCES "account_banks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
