-- CreateTable
CREATE TABLE "TargetGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TargetGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoftwareTargetGroup" (
    "softwareId" TEXT NOT NULL,
    "targetGroupId" TEXT NOT NULL,

    CONSTRAINT "SoftwareTargetGroup_pkey" PRIMARY KEY ("softwareId","targetGroupId")
);

-- CreateIndex
CREATE UNIQUE INDEX "TargetGroup_name_key" ON "TargetGroup"("name");

-- AddForeignKey
ALTER TABLE "SoftwareTargetGroup" ADD CONSTRAINT "SoftwareTargetGroup_softwareId_fkey" FOREIGN KEY ("softwareId") REFERENCES "Software"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoftwareTargetGroup" ADD CONSTRAINT "SoftwareTargetGroup_targetGroupId_fkey" FOREIGN KEY ("targetGroupId") REFERENCES "TargetGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
