CREATE TYPE "DataPrivacyStatus" AS ENUM ('DSGVO_COMPLIANT', 'EU_HOSTED', 'NON_EU');

ALTER TABLE "Software"
ADD COLUMN "dataPrivacyStatus" "DataPrivacyStatus" NOT NULL DEFAULT 'EU_HOSTED';
