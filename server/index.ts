import 'dotenv/config'
import argon2 from 'argon2'
import cors from 'cors'
import express, { type NextFunction, type Request, type Response } from 'express'
import helmet from 'helmet'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { createHash } from 'node:crypto'
import { PrismaClient } from '@prisma/client'
import {
  caseCategories,
  casePriorities,
  caseStatuses,
  createInitialState,
  evidenceTypes,
  subjectRoles,
  threatLevels,
} from '../src/data/seed'
import type {
  AppState,
  CaseCategory,
  CasePriority,
  CaseRecord,
  CaseStatus,
  EvidenceType,
  ReportArtifact,
  SubjectProfile,
  SubjectRole,
  ThreatLevel,
} from '../src/types'

type OperatorRole = 'Operator' | 'Analyst' | 'Supervisor' | 'Administrator'
type TargetType = 'Case' | 'Subject' | 'Evidence' | 'Report' | 'Session'

interface SessionOperator {
  id: string
  displayName: string
  role: OperatorRole
}

interface AuthedRequest extends Request {
  operator: SessionOperator
  sessionId: string
}

const prisma = new PrismaClient()
const port = Number(process.env.PORT ?? 4310)
const jwtSecret = process.env.JWT_SECRET ?? 'local_dev_secret_change_me'
const jwtAccessTtl = process.env.JWT_ACCESS_TTL ?? '8h'
const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
const modules = createInitialState().modules

function createId(prefix: string) {
  return `${prefix}-${Math.floor(Date.now() / 1000).toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

function createCaseId() {
  return `CASE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
}

function createEvidenceId() {
  return `EVD-${Math.floor(1000 + Math.random() * 9000)}`
}

function createSubjectId() {
  return `SBJ-${Math.floor(1000 + Math.random() * 9000)}`
}

function clampRisk(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function tokenHash(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function ttlToDate(value: string) {
  const match = value.match(/^(\d+)([mhd])$/)
  if (!match) {
    return new Date(Date.now() + 8 * 60 * 60 * 1000)
  }

  const amount = Number(match[1])
  const unit = match[2]
  const multiplier = unit === 'm' ? 60 * 1000 : unit === 'h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000
  return new Date(Date.now() + amount * multiplier)
}

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === 'string' && allowed.includes(value as T)
}

function readString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

async function addAudit(
  actor: string,
  event: {
    action: string
    targetType: TargetType
    targetId: string
    detail: string
  },
) {
  await prisma.auditEvent.create({
    data: {
      id: createId('EVT'),
      actor,
      action: event.action,
      targetType: event.targetType,
      targetId: event.targetId,
      detail: event.detail,
      createdAt: new Date(),
    },
  })
}

async function buildState(): Promise<AppState> {
  const [caseRows, subjectRows, evidenceRows, auditRows, reportRows] = await prisma.$transaction([
    prisma.caseRecord.findMany({
      include: { subjectLinks: { orderBy: { createdAt: 'asc' } }, evidence: { select: { id: true } } },
      orderBy: { lastUpdatedAt: 'desc' },
    }),
    prisma.subjectProfile.findMany({
      include: { caseLinks: { select: { caseId: true }, orderBy: { createdAt: 'asc' } } },
      orderBy: { id: 'asc' },
    }),
    prisma.evidenceItem.findMany({ orderBy: { capturedAt: 'desc' } }),
    prisma.auditEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 250 }),
    prisma.reportArtifact.findMany({ orderBy: { createdAt: 'desc' } }),
  ])

  return {
    cases: caseRows.map((caseRecord) => ({
      id: caseRecord.id,
      title: caseRecord.title,
      category: caseRecord.category as CaseCategory,
      priority: caseRecord.priority as CasePriority,
      status: caseRecord.status as CaseStatus,
      summary: caseRecord.summary,
      owner: caseRecord.owner,
      openedAt: caseRecord.openedAt.toISOString(),
      lastUpdatedAt: caseRecord.lastUpdatedAt.toISOString(),
      subjectLinks: caseRecord.subjectLinks.map((link) => ({
        subjectId: link.subjectId,
        role: link.role as SubjectRole,
      })),
      evidenceIds: caseRecord.evidence.map((item) => item.id),
      notes: caseRecord.notes,
    })),
    subjects: subjectRows.map((subject) => ({
      id: subject.id,
      name: subject.name,
      alias: subject.alias,
      nationalId: subject.nationalId,
      location: subject.location,
      occupation: subject.occupation,
      threatLevel: subject.threatLevel as ThreatLevel,
      risk: {
        financial: subject.riskFinancial,
        network: subject.riskNetwork,
        mobility: subject.riskMobility,
      },
      bioProfile: {
        heightCm: subject.heightCm,
        weightKg: subject.weightKg,
        bodyType: subject.bodyType as SubjectProfile['bioProfile']['bodyType'],
        footSize: subject.footSize,
        hobbies: subject.hobbies,
        medicalConditions: subject.medicalConditions,
      },
      appearance: {
        mode: subject.appearanceMode as SubjectProfile['appearance']['mode'],
        sex: subject.sex as SubjectProfile['appearance']['sex'],
        faceConcept: subject.faceConcept as SubjectProfile['appearance']['faceConcept'],
        hairstyle: subject.hairstyle as SubjectProfile['appearance']['hairstyle'],
        skinTone: subject.skinTone,
        hairColor: subject.hairColor,
        eyeColor: subject.eyeColor,
        facialHair: subject.facialHair as SubjectProfile['appearance']['facialHair'],
        photoUrl: subject.photoUrl ?? undefined,
      },
      analystNote: subject.analystNote,
      linkedCaseIds: subject.caseLinks.map((link) => link.caseId),
    })),
    evidence: evidenceRows.map((item) => ({
      id: item.id,
      caseId: item.caseId,
      type: item.type as EvidenceType,
      source: item.source,
      summary: item.summary,
      custodyNote: item.custodyNote,
      capturedAt: item.capturedAt.toISOString(),
    })),
    auditTrail: auditRows.map((event) => ({
      id: event.id,
      actor: event.actor,
      action: event.action,
      targetType: event.targetType as TargetType,
      targetId: event.targetId,
      detail: event.detail,
      createdAt: event.createdAt.toISOString(),
    })),
    reports: reportRows.map((report) => ({
      id: report.id,
      kind: report.kind as ReportArtifact['kind'],
      targetId: report.targetId,
      title: report.title,
      createdAt: report.createdAt.toISOString(),
      html: report.html,
    })),
    modules,
  }
}

async function requireOperator(request: Request, response: Response, next: NextFunction) {
  const header = request.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : ''

  if (!token) {
    response.status(401).json({ error: 'Session expired. Please sign in again.' })
    return
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as JwtPayload
    const session = await prisma.session.findUnique({
      where: { tokenHash: tokenHash(token) },
      include: { operator: true },
    })

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt.getTime() <= Date.now() ||
      !session.operator.active ||
      payload.sub !== session.operatorId
    ) {
      response.status(401).json({ error: 'Session expired. Please sign in again.' })
      return
    }

    ;(request as AuthedRequest).operator = {
      id: session.operator.id,
      displayName: session.operator.displayName,
      role: session.operator.role as OperatorRole,
    }
    ;(request as AuthedRequest).sessionId = session.id
    next()
  } catch {
    response.status(401).json({ error: 'Session expired. Please sign in again.' })
  }
}

function buildReportShell(title: string, subtitle: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${title}</title>
<style>
body{font-family:Arial,sans-serif;background:#edf4f9;color:#0f172a;padding:32px;line-height:1.5}
.wrap{max-width:980px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden;border:1px solid #d6e0ea;box-shadow:0 30px 80px rgba(15,23,42,.12)}
.top{padding:28px 32px;background:linear-gradient(135deg,#0f1d32,#11324a);color:#f4fbff}
.band{display:inline-block;margin-bottom:12px;padding:6px 10px;border-radius:999px;background:#17d0b4;color:#042b25;font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase}
.body{padding:32px}
h1,h2,h3{margin:0 0 12px}
table{width:100%;border-collapse:collapse;margin:18px 0}
th,td{border:1px solid #dce7ef;padding:10px;text-align:left;font-size:14px;vertical-align:top}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:16px 0 20px}
.card{padding:14px;border:1px solid #dce7ef;border-radius:14px;background:#f7fbfe}
.muted{color:#516173}
ul{padding-left:18px}
</style>
</head>
<body>
  <div class="wrap">
    <div class="top">
      <div class="band">Restricted</div>
      <h1>${title}</h1>
      <p>${subtitle}</p>
    </div>
    <div class="body">${body}</div>
  </div>
</body>
</html>`
}

function buildCaseReport(caseRecord: CaseRecord, state: AppState): ReportArtifact {
  const linkedSubjects = caseRecord.subjectLinks
    .map((link) => ({ link, subject: state.subjects.find((subject) => subject.id === link.subjectId) }))
    .filter((item): item is { link: CaseRecord['subjectLinks'][number]; subject: SubjectProfile } => Boolean(item.subject))
  const linkedEvidence = state.evidence.filter((item) => item.caseId === caseRecord.id)
  const body = `
      <p class="muted">Case ID: ${caseRecord.id}</p>
      <div class="grid">
        <div class="card"><strong>Category</strong><div>${caseRecord.category}</div></div>
        <div class="card"><strong>Priority</strong><div>${caseRecord.priority}</div></div>
        <div class="card"><strong>Status</strong><div>${caseRecord.status}</div></div>
        <div class="card"><strong>Owner</strong><div>${caseRecord.owner}</div></div>
      </div>
      <h2>Executive summary</h2>
      <p>${caseRecord.summary}</p>
      <h2>Subjects of interest</h2>
      <table>
        <thead><tr><th>Subject ID</th><th>Name</th><th>Role</th><th>Threat</th><th>Risk</th></tr></thead>
        <tbody>${linkedSubjects
          .map(
            ({ link, subject }) => `<tr><td>${subject.id}</td><td>${subject.name}</td><td>${link.role}</td><td>${subject.threatLevel}</td><td>F ${subject.risk.financial} / N ${subject.risk.network} / M ${subject.risk.mobility}</td></tr>`,
          )
          .join('')}</tbody>
      </table>
      <h2>Evidence and materials</h2>
      <table>
        <thead><tr><th>Evidence ID</th><th>Type</th><th>Source</th><th>Summary</th><th>Custody note</th></tr></thead>
        <tbody>${linkedEvidence
          .map((item) => `<tr><td>${item.id}</td><td>${item.type}</td><td>${item.source}</td><td>${item.summary}</td><td>${item.custodyNote}</td></tr>`)
          .join('')}</tbody>
      </table>
      <h2>Operational note</h2>
      <p>${caseRecord.notes || 'No additional note.'}</p>`

  return {
    id: createId('RPT'),
    kind: 'case',
    targetId: caseRecord.id,
    title: `${caseRecord.title} case report`,
    createdAt: new Date().toISOString(),
    html: buildReportShell(`${caseRecord.title} case report`, `Prepared for ${caseRecord.id}`, body),
  }
}

function buildSubjectReport(subject: SubjectProfile, state: AppState): ReportArtifact {
  const linkedCases = state.cases.filter((caseRecord) => subject.linkedCaseIds.includes(caseRecord.id))
  const body = `
      <p class="muted">Subject ID: ${subject.id}</p>
      <div class="grid">
        <div class="card"><strong>Threat</strong><div>${subject.threatLevel}</div></div>
        <div class="card"><strong>Location</strong><div>${subject.location}</div></div>
        <div class="card"><strong>Occupation</strong><div>${subject.occupation}</div></div>
        <div class="card"><strong>Alias</strong><div>${subject.alias || 'None recorded'}</div></div>
      </div>
      <h2>Risk indicators</h2>
      <ul><li>Financial: ${subject.risk.financial}</li><li>Network: ${subject.risk.network}</li><li>Mobility: ${subject.risk.mobility}</li></ul>
      <h2>Bioprofile</h2>
      <table><tbody>
        <tr><th>Height</th><td>${subject.bioProfile.heightCm} cm</td></tr>
        <tr><th>Weight</th><td>${subject.bioProfile.weightKg} kg</td></tr>
        <tr><th>Body type</th><td>${subject.bioProfile.bodyType}</td></tr>
        <tr><th>Foot size</th><td>${subject.bioProfile.footSize}</td></tr>
        <tr><th>Hobbies</th><td>${subject.bioProfile.hobbies}</td></tr>
        <tr><th>Medical conditions</th><td>${subject.bioProfile.medicalConditions}</td></tr>
      </tbody></table>
      <h2>Case involvement</h2>
      <table>
        <thead><tr><th>Case ID</th><th>Title</th><th>Status</th><th>Category</th></tr></thead>
        <tbody>${linkedCases.map((caseRecord) => `<tr><td>${caseRecord.id}</td><td>${caseRecord.title}</td><td>${caseRecord.status}</td><td>${caseRecord.category}</td></tr>`).join('')}</tbody>
      </table>
      <h2>Analyst note</h2>
      <p>${subject.analystNote || 'No additional note.'}</p>`

  return {
    id: createId('RPT'),
    kind: 'subject',
    targetId: subject.id,
    title: `${subject.name} subject dossier`,
    createdAt: new Date().toISOString(),
    html: buildReportShell(`${subject.name} subject dossier`, `Prepared for ${subject.id}`, body),
  }
}

const app = express()

app.use(helmet())
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true)
        return
      }
      callback(new Error('Origin not allowed by CORS.'))
    },
  }),
)
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', async (_request, response) => {
  await prisma.$queryRaw`SELECT 1`
  response.json({ ok: true })
})

app.post('/api/auth/login', async (request, response) => {
  const operatorId = readString(request.body?.operatorId)
  const accessKey = readString(request.body?.accessKey)

  if (!operatorId || !accessKey) {
    response.status(400).json({ error: 'Operator ID and access key are required.' })
    return
  }

  const operator = await prisma.operator.findUnique({ where: { id: operatorId } })
  if (!operator || !operator.active || !(await argon2.verify(operator.accessKeyHash, accessKey))) {
    response.status(401).json({ error: 'Invalid operator ID or access key.' })
    return
  }

  const expiresAt = ttlToDate(jwtAccessTtl)
  const token = jwt.sign({ role: operator.role }, jwtSecret, {
    subject: operator.id,
    expiresIn: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
  })
  const sessionOperator: SessionOperator = {
    id: operator.id,
    displayName: operator.displayName,
    role: operator.role as OperatorRole,
  }

  await prisma.session.create({ data: { tokenHash: tokenHash(token), operatorId: operator.id, expiresAt } })
  await addAudit(operator.id, {
    action: 'Login',
    targetType: 'Session',
    targetId: operator.id,
    detail: 'Operator entered the intelligence console.',
  })

  response.json({ token, operator: sessionOperator, state: await buildState() })
})

app.post('/api/auth/logout', requireOperator, async (request, response) => {
  const { operator, sessionId } = request as AuthedRequest
  await prisma.session.update({ where: { id: sessionId }, data: { revokedAt: new Date() } })
  await addAudit(operator.id, {
    action: 'Logout',
    targetType: 'Session',
    targetId: operator.id,
    detail: 'Operator exited the intelligence console.',
  })
  response.json({ ok: true })
})

app.get('/api/state', requireOperator, async (_request, response) => {
  response.json({ state: await buildState() })
})

app.post('/api/cases', requireOperator, async (request, response) => {
  const operator = (request as AuthedRequest).operator
  const title = readString(request.body?.title)
  const summary = readString(request.body?.summary)
  const notes = readString(request.body?.notes)
  const category = request.body?.category
  const priority = request.body?.priority
  const status = request.body?.status

  if (!title || !summary || !isOneOf(category, caseCategories) || !isOneOf(priority, casePriorities) || !isOneOf(status, caseStatuses)) {
    response.status(400).json({ error: 'Case title, category, priority, status, and summary are required.' })
    return
  }

  const now = new Date()
  const caseRecord = await prisma.caseRecord.create({
    data: {
      id: createCaseId(),
      title,
      category,
      priority,
      status,
      summary,
      owner: operator.id,
      openedAt: now,
      lastUpdatedAt: now,
      notes,
    },
  })
  await addAudit(operator.id, {
    action: 'CreateCase',
    targetType: 'Case',
    targetId: caseRecord.id,
    detail: `Created case ${caseRecord.title}.`,
  })

  const state = await buildState()
  response.status(201).json({ state, caseRecord: state.cases.find((item) => item.id === caseRecord.id) })
})

app.patch('/api/cases/:caseId', requireOperator, async (request, response) => {
  const operator = (request as AuthedRequest).operator
  const caseId = readString(request.params.caseId)
  const caseRecord = await prisma.caseRecord.findUnique({ where: { id: caseId } })

  if (!caseRecord) {
    response.status(404).json({ error: 'Case not found.' })
    return
  }

  const nextStatus = request.body?.status
  const nextPriority = request.body?.priority
  if ((nextStatus && !isOneOf(nextStatus, caseStatuses)) || (nextPriority && !isOneOf(nextPriority, casePriorities))) {
    response.status(400).json({ error: 'Invalid case status or priority.' })
    return
  }

  const nextCase = await prisma.caseRecord.update({
    where: { id: caseRecord.id },
    data: {
      status: isOneOf(nextStatus, caseStatuses) ? nextStatus : caseRecord.status,
      priority: isOneOf(nextPriority, casePriorities) ? nextPriority : caseRecord.priority,
      owner: readString(request.body?.owner) || caseRecord.owner,
      notes: typeof request.body?.notes === 'string' ? request.body.notes : caseRecord.notes,
      lastUpdatedAt: new Date(),
    },
  })
  await addAudit(operator.id, {
    action: 'UpdateCase',
    targetType: 'Case',
    targetId: nextCase.id,
    detail: `Updated case workflow fields for ${nextCase.id}.`,
  })

  const state = await buildState()
  response.json({ state, caseRecord: state.cases.find((item) => item.id === nextCase.id) })
})

app.post('/api/cases/:caseId/subjects', requireOperator, async (request, response) => {
  const operator = (request as AuthedRequest).operator
  const caseId = readString(request.params.caseId)
  const subjectId = readString(request.body?.subjectId)
  const role = request.body?.role

  if (!subjectId || !isOneOf(role, subjectRoles)) {
    response.status(400).json({ error: 'Subject and role are required.' })
    return
  }

  const [caseRecord, subject] = await Promise.all([
    prisma.caseRecord.findUnique({ where: { id: caseId } }),
    prisma.subjectProfile.findUnique({ where: { id: subjectId } }),
  ])

  if (!caseRecord || !subject) {
    response.status(404).json({ error: 'Case or subject not found.' })
    return
  }

  try {
    await prisma.$transaction([
      prisma.caseSubjectLink.create({ data: { caseId: caseRecord.id, subjectId, role } }),
      prisma.caseRecord.update({ where: { id: caseRecord.id }, data: { lastUpdatedAt: new Date() } }),
    ])
  } catch {
    response.status(409).json({ error: 'Subject already linked to this case.' })
    return
  }

  await addAudit(operator.id, {
    action: 'LinkSubject',
    targetType: 'Case',
    targetId: caseRecord.id,
    detail: `Linked subject ${subject.id} as ${role}.`,
  })

  const state = await buildState()
  response.status(201).json({ state, caseRecord: state.cases.find((item) => item.id === caseRecord.id) })
})

app.post('/api/cases/:caseId/evidence', requireOperator, async (request, response) => {
  const operator = (request as AuthedRequest).operator
  const caseId = readString(request.params.caseId)
  const source = readString(request.body?.source)
  const summary = readString(request.body?.summary)
  const custodyNote = readString(request.body?.custodyNote)
  const type = request.body?.type

  if (!source || !summary || !isOneOf(type, evidenceTypes)) {
    response.status(400).json({ error: 'Evidence type, source, and summary are required.' })
    return
  }

  const caseRecord = await prisma.caseRecord.findUnique({ where: { id: caseId } })
  if (!caseRecord) {
    response.status(404).json({ error: 'Case not found.' })
    return
  }

  const evidenceItem = await prisma.evidenceItem.create({
    data: {
      id: createEvidenceId(),
      caseId: caseRecord.id,
      type,
      source,
      summary,
      custodyNote,
      capturedAt: new Date(),
    },
  })
  await prisma.caseRecord.update({ where: { id: caseRecord.id }, data: { lastUpdatedAt: new Date() } })
  await addAudit(operator.id, {
    action: 'AddEvidence',
    targetType: 'Evidence',
    targetId: evidenceItem.id,
    detail: `Added ${evidenceItem.type} evidence to ${caseRecord.id}.`,
  })

  const state = await buildState()
  response.status(201).json({ state, evidenceItem: state.evidence.find((item) => item.id === evidenceItem.id) })
})

app.post('/api/subjects', requireOperator, async (request, response) => {
  const operator = (request as AuthedRequest).operator
  const name = readString(request.body?.name)
  const nationalId = readString(request.body?.nationalId)

  if (!name || !nationalId) {
    response.status(400).json({ error: 'Subject name and national ID are required.' })
    return
  }

  const subject = await prisma.subjectProfile.create({
    data: {
      id: createSubjectId(),
      name,
      alias: readString(request.body?.alias),
      nationalId,
      location: readString(request.body?.location),
      occupation: readString(request.body?.occupation),
      threatLevel: 'Unassessed',
      riskFinancial: 12,
      riskNetwork: 12,
      riskMobility: 12,
      heightCm: Number(request.body?.bioProfile?.heightCm ?? 0),
      weightKg: Number(request.body?.bioProfile?.weightKg ?? 0),
      bodyType: readString(request.body?.bioProfile?.bodyType) || 'Average',
      footSize: readString(request.body?.bioProfile?.footSize),
      hobbies: readString(request.body?.bioProfile?.hobbies),
      medicalConditions: readString(request.body?.bioProfile?.medicalConditions),
      appearanceMode: readString(request.body?.appearance?.mode) || 'composite',
      sex: readString(request.body?.appearance?.sex) || 'Male',
      faceConcept: readString(request.body?.appearance?.faceConcept) || 'Oval',
      hairstyle: readString(request.body?.appearance?.hairstyle) || 'Short',
      skinTone: readString(request.body?.appearance?.skinTone) || '#b98e6b',
      hairColor: readString(request.body?.appearance?.hairColor) || '#2d241d',
      eyeColor: readString(request.body?.appearance?.eyeColor) || '#7ac4e7',
      facialHair: readString(request.body?.appearance?.facialHair) || 'None',
      analystNote: readString(request.body?.analystNote),
    },
  })
  await addAudit(operator.id, {
    action: 'RegisterSubject',
    targetType: 'Subject',
    targetId: subject.id,
    detail: `Registered new subject ${subject.name}.`,
  })

  const state = await buildState()
  response.status(201).json({ state, subject: state.subjects.find((item) => item.id === subject.id) })
})

app.patch('/api/subjects/:subjectId', requireOperator, async (request, response) => {
  const operator = (request as AuthedRequest).operator
  const subjectId = readString(request.params.subjectId)
  const subject = await prisma.subjectProfile.findUnique({ where: { id: subjectId } })

  if (!subject) {
    response.status(404).json({ error: 'Subject not found.' })
    return
  }

  const threatLevel = request.body?.threatLevel ?? subject.threatLevel
  if (!isOneOf(threatLevel, threatLevels)) {
    response.status(400).json({ error: 'Invalid threat level.' })
    return
  }

  const nextSubject = await prisma.subjectProfile.update({
    where: { id: subject.id },
    data: {
      threatLevel,
      analystNote: typeof request.body?.analystNote === 'string' ? request.body.analystNote : subject.analystNote,
      riskFinancial: request.body?.risk ? clampRisk(Number(request.body.risk.financial ?? subject.riskFinancial)) : subject.riskFinancial,
      riskNetwork: request.body?.risk ? clampRisk(Number(request.body.risk.network ?? subject.riskNetwork)) : subject.riskNetwork,
      riskMobility: request.body?.risk ? clampRisk(Number(request.body.risk.mobility ?? subject.riskMobility)) : subject.riskMobility,
    },
  })
  await addAudit(operator.id, {
    action: 'UpdateThreat',
    targetType: 'Subject',
    targetId: nextSubject.id,
    detail: `Updated subject assessment for ${nextSubject.id}.`,
  })

  const state = await buildState()
  response.json({ state, subject: state.subjects.find((item) => item.id === nextSubject.id) })
})

app.post('/api/reports/cases/:caseId', requireOperator, async (request, response) => {
  const operator = (request as AuthedRequest).operator
  const state = await buildState()
  const caseRecord = state.cases.find((item) => item.id === request.params.caseId)

  if (!caseRecord) {
    response.status(404).json({ error: 'Case not found.' })
    return
  }

  const report = buildCaseReport(caseRecord, state)
  await prisma.reportArtifact.create({
    data: {
      id: report.id,
      kind: report.kind,
      targetId: report.targetId,
      caseId: caseRecord.id,
      title: report.title,
      createdAt: new Date(report.createdAt),
      html: report.html,
    },
  })
  await addAudit(operator.id, {
    action: 'GenerateReport',
    targetType: 'Report',
    targetId: report.id,
    detail: `Generated case report for ${caseRecord.id}.`,
  })

  response.status(201).json({ state: await buildState(), report })
})

app.post('/api/reports/subjects/:subjectId', requireOperator, async (request, response) => {
  const operator = (request as AuthedRequest).operator
  const state = await buildState()
  const subject = state.subjects.find((item) => item.id === request.params.subjectId)

  if (!subject) {
    response.status(404).json({ error: 'Subject not found.' })
    return
  }

  const report = buildSubjectReport(subject, state)
  await prisma.reportArtifact.create({
    data: {
      id: report.id,
      kind: report.kind,
      targetId: report.targetId,
      subjectId: subject.id,
      title: report.title,
      createdAt: new Date(report.createdAt),
      html: report.html,
    },
  })
  await addAudit(operator.id, {
    action: 'GenerateReport',
    targetType: 'Report',
    targetId: report.id,
    detail: `Generated subject dossier for ${subject.id}.`,
  })

  response.status(201).json({ state: await buildState(), report })
})

app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  void _next
  console.error(error)
  response.status(500).json({ error: 'Unexpected server error.' })
})

app.listen(port, () => {
  console.log(`SENTINEL API listening on http://localhost:${port}`)
})
