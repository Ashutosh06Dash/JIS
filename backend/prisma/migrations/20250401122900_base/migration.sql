-- CreateEnum
CREATE TYPE "Role" AS ENUM ('REGISTRAR', 'JUDGE', 'LAWYER');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('PENDING', 'RESOLVED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "role" "Role" NOT NULL,
    "name" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "salt" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseDetails" (
    "id" SERIAL NOT NULL,
    "cin" TEXT NOT NULL,
    "defendantName" TEXT NOT NULL,
    "defendantAddress" TEXT NOT NULL,
    "crimeType" TEXT NOT NULL,
    "crimeDate" TIMESTAMP(3) NOT NULL,
    "crimeLocation" TEXT NOT NULL,
    "arrestingOfficer" TEXT NOT NULL,
    "arrestDate" TIMESTAMP(3) NOT NULL,
    "caseStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "CaseStatus" NOT NULL DEFAULT 'PENDING',
    "completionDate" TIMESTAMP(3),

    CONSTRAINT "CaseDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseSummary" (
    "id" SERIAL NOT NULL,
    "summaryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "caseId" INTEGER NOT NULL,

    CONSTRAINT "CaseSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hearing" (
    "id" SERIAL NOT NULL,
    "hearingDate" TIMESTAMP(3) NOT NULL,
    "nextHearingDate" TIMESTAMP(3),
    "caseId" INTEGER NOT NULL,

    CONSTRAINT "Hearing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Billing" (
    "id" SERIAL NOT NULL,
    "viewDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chargeAmount" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "lawyerId" INTEGER NOT NULL,

    CONSTRAINT "Billing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_userName_key" ON "User"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CaseDetails_cin_key" ON "CaseDetails"("cin");

-- CreateIndex
CREATE INDEX "CaseDetails_status_idx" ON "CaseDetails"("status");

-- CreateIndex
CREATE INDEX "CaseDetails_caseStartDate_idx" ON "CaseDetails"("caseStartDate");

-- CreateIndex
CREATE INDEX "CaseSummary_summaryDate_idx" ON "CaseSummary"("summaryDate");

-- CreateIndex
CREATE INDEX "Hearing_hearingDate_idx" ON "Hearing"("hearingDate");

-- CreateIndex
CREATE INDEX "Billing_viewDate_idx" ON "Billing"("viewDate");

-- AddForeignKey
ALTER TABLE "CaseSummary" ADD CONSTRAINT "CaseSummary_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "CaseDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hearing" ADD CONSTRAINT "Hearing_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "CaseDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Billing" ADD CONSTRAINT "Billing_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
