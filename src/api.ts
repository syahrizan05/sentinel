import type { AppState, CaseRecord, EvidenceItem, ReportArtifact, SubjectProfile } from './types'

const sessionStorageKey = 'sentinel-session-v1'
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

export interface SessionOperator {
  id: string
  displayName: string
  role: string
}

interface PersistedSession {
  token: string
  operator: SessionOperator
}

interface MutationResponse {
  state: AppState
}

interface CaseMutationResponse extends MutationResponse {
  caseRecord: CaseRecord
}

interface SubjectMutationResponse extends MutationResponse {
  subject: SubjectProfile
}

interface EvidenceMutationResponse extends MutationResponse {
  evidenceItem: EvidenceItem
}

interface ReportMutationResponse extends MutationResponse {
  report: ReportArtifact
}

function getApiUrl(path: string) {
  const normalizedBase = apiBaseUrl.replace(/\/$/, '')
  const normalizedPath = normalizedBase.endsWith('/api') && path.startsWith('/api/')
    ? path.slice(4)
    : path

  return `${normalizedBase}${normalizedPath}`
}

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(getApiUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(payload?.error ?? 'Request failed.')
  }

  return (await response.json()) as T
}

export function restoreSession() {
  const raw = window.localStorage.getItem(sessionStorageKey)
  if (!raw) {
    return { token: '', operator: null as SessionOperator | null }
  }

  try {
    const parsed = JSON.parse(raw) as PersistedSession
    if (!parsed.token || !parsed.operator) {
      return { token: '', operator: null as SessionOperator | null }
    }
    return parsed
  } catch {
    return { token: '', operator: null as SessionOperator | null }
  }
}

export function persistSession(token: string, operator: SessionOperator) {
  window.localStorage.setItem(sessionStorageKey, JSON.stringify({ token, operator }))
}

export function clearSession() {
  window.localStorage.removeItem(sessionStorageKey)
}

export async function login(operatorId: string, accessKey: string) {
  return request<{ token: string; operator: SessionOperator; state: AppState }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ operatorId, accessKey }),
  })
}

export async function logout(token: string) {
  return request<{ ok: true }>('/api/auth/logout', { method: 'POST' }, token)
}

export async function fetchState(token: string) {
  return request<{ state: AppState }>('/api/state', {}, token)
}

export async function createCase(token: string, payload: Pick<CaseRecord, 'title' | 'category' | 'priority' | 'status' | 'summary' | 'notes'>) {
  return request<CaseMutationResponse>('/api/cases', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token)
}

export async function updateCase(token: string, caseId: string, payload: Partial<Pick<CaseRecord, 'status' | 'priority' | 'owner' | 'notes'>>) {
  return request<CaseMutationResponse>(`/api/cases/${caseId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, token)
}

export async function linkSubjectToCase(token: string, caseId: string, subjectId: string, role: string) {
  return request<CaseMutationResponse>(`/api/cases/${caseId}/subjects`, {
    method: 'POST',
    body: JSON.stringify({ subjectId, role }),
  }, token)
}

export async function addEvidence(token: string, caseId: string, payload: Pick<EvidenceItem, 'type' | 'source' | 'summary' | 'custodyNote'>) {
  return request<EvidenceMutationResponse>(`/api/cases/${caseId}/evidence`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token)
}

export async function createSubject(token: string, payload: Omit<SubjectProfile, 'id' | 'threatLevel' | 'risk' | 'linkedCaseIds'>) {
  return request<SubjectMutationResponse>('/api/subjects', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token)
}

export async function updateSubject(
  token: string,
  subjectId: string,
  payload: Partial<Pick<SubjectProfile, 'threatLevel' | 'analystNote' | 'risk'>>,
) {
  return request<SubjectMutationResponse>(`/api/subjects/${subjectId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, token)
}

export async function generateCaseReport(token: string, caseId: string) {
  return request<ReportMutationResponse>(`/api/reports/cases/${caseId}`, { method: 'POST' }, token)
}

export async function generateSubjectReport(token: string, subjectId: string) {
  return request<ReportMutationResponse>(`/api/reports/subjects/${subjectId}`, { method: 'POST' }, token)
}
