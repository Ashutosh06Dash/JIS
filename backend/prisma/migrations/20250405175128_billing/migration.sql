/*
  Warnings:

  - Added the required column `caseId` to the `Billing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Billing" ADD COLUMN     "caseId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Billing" ADD CONSTRAINT "Billing_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "CaseDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
