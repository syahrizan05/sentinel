import argon2 from 'argon2'
import { PrismaClient } from '@prisma/client'
import { createInitialState } from '../src/data/seed.ts'

const prisma = new PrismaClient()

const seededOperators = [
  { id: 'OPS-NIGHT-4', displayName: 'Night Watch Lead', role: 'Supervisor', accessKey: 'sentinel123' },
  { id: 'OPS-CY-1', displayName: 'Cyber Desk One', role: 'Analyst', accessKey: 'cywatch' },
  { id: 'OPS-CY-2', displayName: 'Cyber Desk Two', role: 'Analyst', accessKey: 'cywatch' },
  { id: 'OPS-HQ-3', displayName: 'HQ Operations Three', role: 'Operator', accessKey: 'opsready' },
]

async function main() {
  const state = createInitialState()

  await prisma.$transaction([
    prisma.session.deleteMany(),
    prisma.reportArtifact.deleteMany(),
    prisma.auditEvent.deleteMany(),
    prisma.evidenceItem.deleteMany(),
    prisma.caseSubjectLink.deleteMany(),
    prisma.caseRecord.deleteMany(),
    prisma.subjectProfile.deleteMany(),
    prisma.operator.deleteMany(),
  ])

  await prisma.operator.createMany({
    data: await Promise.all(
      seededOperators.map(async (operator) => ({
        id: operator.id,
        displayName: operator.displayName,
        role: operator.role,
        accessKeyHash: await argon2.hash(operator.accessKey),
      })),
    ),
  })

  await prisma.subjectProfile.createMany({
    data: state.subjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
      alias: subject.alias,
      nationalId: subject.nationalId,
      location: subject.location,
      occupation: subject.occupation,
      threatLevel: subject.threatLevel,
      riskFinancial: subject.risk.financial,
      riskNetwork: subject.risk.network,
      riskMobility: subject.risk.mobility,
      heightCm: subject.bioProfile.heightCm,
      weightKg: subject.bioProfile.weightKg,
      bodyType: subject.bioProfile.bodyType,
      footSize: subject.bioProfile.footSize,
      hobbies: subject.bioProfile.hobbies,
      medicalConditions: subject.bioProfile.medicalConditions,
      appearanceMode: subject.appearance.mode,
      sex: subject.appearance.sex,
      faceConcept: subject.appearance.faceConcept,
      hairstyle: subject.appearance.hairstyle,
      skinTone: subject.appearance.skinTone,
      hairColor: subject.appearance.hairColor,
      eyeColor: subject.appearance.eyeColor,
      facialHair: subject.appearance.facialHair,
      photoUrl: subject.appearance.photoUrl,
      analystNote: subject.analystNote,
    })),
  })

  await prisma.caseRecord.createMany({
    data: state.cases.map((caseRecord) => ({
      id: caseRecord.id,
      title: caseRecord.title,
      category: caseRecord.category,
      priority: caseRecord.priority,
      status: caseRecord.status,
      summary: caseRecord.summary,
      owner: caseRecord.owner,
      openedAt: new Date(caseRecord.openedAt),
      lastUpdatedAt: new Date(caseRecord.lastUpdatedAt),
      notes: caseRecord.notes,
    })),
  })

  await prisma.caseSubjectLink.createMany({
    data: state.cases.flatMap((caseRecord) =>
      caseRecord.subjectLinks.map((link) => ({
        caseId: caseRecord.id,
        subjectId: link.subjectId,
        role: link.role,
      })),
    ),
  })

  await prisma.evidenceItem.createMany({
    data: state.evidence.map((item) => ({
      id: item.id,
      caseId: item.caseId,
      type: item.type,
      source: item.source,
      summary: item.summary,
      custodyNote: item.custodyNote,
      capturedAt: new Date(item.capturedAt),
    })),
  })

  await prisma.auditEvent.createMany({
    data: state.auditTrail.map((event) => ({
      id: event.id,
      actor: event.actor,
      action: event.action,
      targetType: event.targetType,
      targetId: event.targetId,
      detail: event.detail,
      createdAt: new Date(event.createdAt),
    })),
  })

  await prisma.reportArtifact.createMany({
    data: state.reports.map((report) => ({
      id: report.id,
      kind: report.kind,
      targetId: report.targetId,
      caseId: report.kind === 'case' ? report.targetId : undefined,
      subjectId: report.kind === 'subject' ? report.targetId : undefined,
      title: report.title,
      createdAt: new Date(report.createdAt),
      html: report.html,
    })),
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
