export type AppView = 'dashboard' | 'cases' | 'subjects' | 'reports' | 'activity'

export type ThreatLevel =
  | 'Unassessed'
  | 'Negligible'
  | 'Guarded'
  | 'Elevated'
  | 'Severe'
  | 'Critical'

export type CasePriority = 'Low' | 'Medium' | 'High' | 'Critical'
export type CaseStatus = 'Intake' | 'Active' | 'Monitoring' | 'Escalated' | 'Closed'
export type CaseCategory =
  | 'Counter-Intelligence'
  | 'Financial Crime'
  | 'Organised Crime'
  | 'Cyber Threat'
  | 'Influence Operation'
  | 'Person of Interest'
  | 'Public Order'

export type SubjectRole =
  | 'Primary Subject'
  | 'Financier'
  | 'Facilitator'
  | 'Witness'
  | 'Material Link'
  | 'Associate'

export type EvidenceType = 'Document' | 'Imagery' | 'Signal' | 'Financial' | 'Field Report'

export interface RiskIndicators {
  financial: number
  network: number
  mobility: number
}

export interface BioProfile {
  heightCm: number
  weightKg: number
  bodyType: 'Lean' | 'Athletic' | 'Average' | 'Heavy'
  footSize: string
  hobbies: string
  medicalConditions: string
}

export interface SubjectAppearance {
  mode: 'composite' | 'photo'
  sex: 'Male' | 'Female'
  faceConcept: 'Oval' | 'Round' | 'Square' | 'Heart' | 'Long'
  hairstyle: 'Bald' | 'Buzz' | 'Short' | 'Medium' | 'Long' | 'Ponytail' | 'Bun' | 'Afro'
  skinTone: string
  hairColor: string
  eyeColor: string
  facialHair: 'None' | 'Stubble' | 'Moustache' | 'Goatee' | 'Full Beard'
  photoUrl?: string
}

export interface SubjectProfile {
  id: string
  name: string
  alias: string
  nationalId: string
  location: string
  occupation: string
  threatLevel: ThreatLevel
  risk: RiskIndicators
  bioProfile: BioProfile
  appearance: SubjectAppearance
  analystNote: string
  linkedCaseIds: string[]
}

export interface CaseSubjectLink {
  subjectId: string
  role: SubjectRole
}

export interface CaseRecord {
  id: string
  title: string
  category: CaseCategory
  priority: CasePriority
  status: CaseStatus
  summary: string
  owner: string
  openedAt: string
  lastUpdatedAt: string
  subjectLinks: CaseSubjectLink[]
  evidenceIds: string[]
  notes: string
}

export interface EvidenceItem {
  id: string
  caseId: string
  type: EvidenceType
  source: string
  summary: string
  custodyNote: string
  capturedAt: string
}

export interface AuditEvent {
  id: string
  actor: string
  action: string
  targetType: 'Case' | 'Subject' | 'Evidence' | 'Report' | 'Session'
  targetId: string
  detail: string
  createdAt: string
}

export interface ReportArtifact {
  id: string
  kind: 'case' | 'subject'
  targetId: string
  title: string
  createdAt: string
  html: string
}

export interface FeatureCoverage {
  name: string
  focus: string
  status: 'Implemented' | 'In Progress' | 'Planned'
  note: string
}

export interface AppState {
  cases: CaseRecord[]
  subjects: SubjectProfile[]
  evidence: EvidenceItem[]
  auditTrail: AuditEvent[]
  reports: ReportArtifact[]
  modules: FeatureCoverage[]
}