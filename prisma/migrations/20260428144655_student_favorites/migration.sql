-- CreateTable
CREATE TABLE "student_favorites" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "student_favorites_studentId_idx" ON "student_favorites"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "student_favorites_studentId_professionalId_key" ON "student_favorites"("studentId", "professionalId");

-- AddForeignKey
ALTER TABLE "student_favorites" ADD CONSTRAINT "student_favorites_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_favorites" ADD CONSTRAINT "student_favorites_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "professionals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
