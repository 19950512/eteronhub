ALTER TYPE "CompanyStatus" ADD VALUE 'DELETED';

ALTER TYPE "WorkerStatus" ADD VALUE 'DELETED';

ALTER TABLE "Company" ADD COLUMN     "deletedAt" TIMESTAMP(3);

ALTER TABLE "Worker" ADD COLUMN     "deletedAt" TIMESTAMP(3);

CREATE TABLE "ConsentRecord" (
    "id" TEXT NOT NULL,
    "subjectRole" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "termsVersion" TEXT NOT NULL,
    "privacyVersion" TEXT NOT NULL,
    "ageConfirmed" BOOLEAN NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ConsentRecord_subjectRole_subjectId_idx" ON "ConsentRecord"("subjectRole", "subjectId");
