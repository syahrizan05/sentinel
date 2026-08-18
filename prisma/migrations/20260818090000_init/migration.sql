CREATE TABLE "Operator" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "accessKeyHash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Operator_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CaseRecord" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "CaseRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SubjectProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alias" TEXT NOT NULL DEFAULT '',
    "nationalId" TEXT NOT NULL,
    "location" TEXT NOT NULL DEFAULT '',
    "occupation" TEXT NOT NULL DEFAULT '',
    "threatLevel" TEXT NOT NULL,
    "riskFinancial" INTEGER NOT NULL,
    "riskNetwork" INTEGER NOT NULL,
    "riskMobility" INTEGER NOT NULL,
    "heightCm" INTEGER NOT NULL,
    "weightKg" INTEGER NOT NULL,
    "bodyType" TEXT NOT NULL,
    "footSize" TEXT NOT NULL DEFAULT '',
    "hobbies" TEXT NOT NULL DEFAULT '',
    "medicalConditions" TEXT NOT NULL DEFAULT '',
    "appearanceMode" TEXT NOT NULL,
    "sex" TEXT NOT NULL,
    "faceConcept" TEXT NOT NULL,
    "hairstyle" TEXT NOT NULL,
    "skinTone" TEXT NOT NULL,
    "hairColor" TEXT NOT NULL,
    "eyeColor" TEXT NOT NULL,
    "facialHair" TEXT NOT NULL,
    "photoUrl" TEXT,
    "analystNote" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "SubjectProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CaseSubjectLink" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseSubjectLink_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EvidenceItem" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "custodyNote" TEXT NOT NULL DEFAULT '',
    "capturedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvidenceItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReportArtifact" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "caseId" TEXT,
    "subjectId" TEXT,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "html" TEXT NOT NULL,

    CONSTRAINT "ReportArtifact_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX "Session_operatorId_idx" ON "Session"("operatorId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
CREATE INDEX "CaseRecord_category_idx" ON "CaseRecord"("category");
CREATE INDEX "CaseRecord_priority_idx" ON "CaseRecord"("priority");
CREATE INDEX "CaseRecord_status_idx" ON "CaseRecord"("status");
CREATE INDEX "CaseRecord_owner_idx" ON "CaseRecord"("owner");
CREATE INDEX "CaseRecord_lastUpdatedAt_idx" ON "CaseRecord"("lastUpdatedAt");
CREATE INDEX "SubjectProfile_name_idx" ON "SubjectProfile"("name");
CREATE INDEX "SubjectProfile_alias_idx" ON "SubjectProfile"("alias");
CREATE INDEX "SubjectProfile_nationalId_idx" ON "SubjectProfile"("nationalId");
CREATE INDEX "SubjectProfile_location_idx" ON "SubjectProfile"("location");
CREATE INDEX "SubjectProfile_threatLevel_idx" ON "SubjectProfile"("threatLevel");
CREATE UNIQUE INDEX "CaseSubjectLink_caseId_subjectId_key" ON "CaseSubjectLink"("caseId", "subjectId");
CREATE INDEX "CaseSubjectLink_subjectId_idx" ON "CaseSubjectLink"("subjectId");
CREATE INDEX "EvidenceItem_caseId_idx" ON "EvidenceItem"("caseId");
CREATE INDEX "EvidenceItem_type_idx" ON "EvidenceItem"("type");
CREATE INDEX "EvidenceItem_capturedAt_idx" ON "EvidenceItem"("capturedAt");
CREATE INDEX "AuditEvent_actor_idx" ON "AuditEvent"("actor");
CREATE INDEX "AuditEvent_action_idx" ON "AuditEvent"("action");
CREATE INDEX "AuditEvent_targetType_idx" ON "AuditEvent"("targetType");
CREATE INDEX "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");
CREATE INDEX "ReportArtifact_kind_idx" ON "ReportArtifact"("kind");
CREATE INDEX "ReportArtifact_targetId_idx" ON "ReportArtifact"("targetId");
CREATE INDEX "ReportArtifact_createdAt_idx" ON "ReportArtifact"("createdAt");

ALTER TABLE "Session" ADD CONSTRAINT "Session_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CaseSubjectLink" ADD CONSTRAINT "CaseSubjectLink_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "CaseRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CaseSubjectLink" ADD CONSTRAINT "CaseSubjectLink_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "SubjectProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EvidenceItem" ADD CONSTRAINT "EvidenceItem_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "CaseRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReportArtifact" ADD CONSTRAINT "ReportArtifact_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "CaseRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReportArtifact" ADD CONSTRAINT "ReportArtifact_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "SubjectProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
