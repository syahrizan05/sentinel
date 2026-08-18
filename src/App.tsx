import { useEffect, useMemo, useState } from 'react'
import {
  addEvidence as addEvidenceRequest,
  clearSession,
  createCase as createCaseRequest,
  createSubject as createSubjectRequest,
  fetchState,
  generateCaseReport as generateCaseReportRequest,
  generateSubjectReport as generateSubjectReportRequest,
  linkSubjectToCase,
  login as loginRequest,
  logout as logoutRequest,
  persistSession,
  restoreSession,
  updateCase as updateCaseRequest,
  updateSubject as updateSubjectRequest,
  type SessionOperator,
} from './api'
import { NetworkGraph } from './components/NetworkGraph'
import { ReportPreview } from './components/ReportPreview'
import { SubjectReconstruction } from './components/SubjectReconstruction'
import {
  caseCategories,
  casePriorities,
  caseStatuses,
  createInitialState,
  evidenceTypes,
  subjectRoles,
  threatLevels,
} from './data/seed'
import type {
  AppState,
  AppView,
  CaseRecord,
  FeatureCoverage,
  ReportArtifact,
  SubjectProfile,
} from './types'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-MY', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function loadInitialSession() {
  if (typeof window === 'undefined') {
    return { token: '', operator: null as SessionOperator | null }
  }

  return restoreSession()
}

function createCaseDraft() {
  return {
    title: '',
    category: caseCategories[0],
    priority: casePriorities[1],
    status: caseStatuses[0],
    summary: '',
    notes: '',
  }
}

function createSubjectDraft() {
  return {
    name: '',
    alias: '',
    nationalId: '',
    location: '',
    occupation: '',
    analystNote: '',
    heightCm: 172,
    weightKg: 68,
    bodyType: 'Average',
    footSize: '42',
    hobbies: '',
    medicalConditions: '',
    sex: 'Male',
    faceConcept: 'Oval',
    hairstyle: 'Short',
    skinTone: '#b98e6b',
    hairColor: '#2d241d',
    eyeColor: '#7ac4e7',
    facialHair: 'None',
  }
}

function createEvidenceDraft() {
  return {
    type: evidenceTypes[0],
    source: '',
    summary: '',
    custodyNote: '',
  }
}

function normalizeScore(value: string) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) {
    return 0
  }

  return Math.max(0, Math.min(100, numeric))
}

const threatColors: Record<string, string> = {
  Unassessed: '#6f7c98',
  Negligible: '#6bc6ff',
  Guarded: '#37d17c',
  Elevated: '#f1b94c',
  Severe: '#f2744a',
  Critical: '#ef445b',
}

const categoryColors: Record<string, string> = {
  'Counter-Intelligence': '#16c6f4',
  'Financial Crime': '#35c973',
  'Organised Crime': '#ff9561',
  'Cyber Threat': '#08c6b8',
  'Influence Operation': '#f95aa3',
  'Person of Interest': '#f2b048',
  'Public Order': '#908dff',
}

function App() {
  const initialSession = loadInitialSession()
  const [sessionOperator, setSessionOperator] = useState(initialSession.operator?.id ?? '')
  const [accessKey, setAccessKey] = useState('')
  const [authenticatedOperator, setAuthenticatedOperator] = useState<SessionOperator | null>(initialSession.operator)
  const [authToken, setAuthToken] = useState(initialSession.token)
  const [isHydrating, setIsHydrating] = useState(Boolean(initialSession.token))
  const [busyAction, setBusyAction] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [view, setView] = useState<AppView>('dashboard')
  const [state, setState] = useState<AppState>(() => createInitialState())
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  const [reportPreview, setReportPreview] = useState<ReportArtifact | null>(null)
  const [caseSearch, setCaseSearch] = useState('')
  const [subjectSearch, setSubjectSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [newCase, setNewCase] = useState(createCaseDraft)
  const [subjectDraft, setSubjectDraft] = useState(createSubjectDraft)
  const [caseLinkRole, setCaseLinkRole] = useState<typeof subjectRoles[number]>('Associate')
  const [caseLinkSubjectId, setCaseLinkSubjectId] = useState('')
  const [evidenceDraft, setEvidenceDraft] = useState(createEvidenceDraft)
  const [caseWorkflow, setCaseWorkflow] = useState<Pick<CaseRecord, 'status' | 'priority' | 'owner' | 'notes'>>({
    status: caseStatuses[0],
    priority: casePriorities[1],
    owner: '',
    notes: '',
  })
  const [subjectAssessment, setSubjectAssessment] = useState<{
    threatLevel: SubjectProfile['threatLevel']
    financial: number
    network: number
    mobility: number
    analystNote: string
  }>({
    threatLevel: 'Unassessed',
    financial: 12,
    network: 12,
    mobility: 12,
    analystNote: '',
  })

  useEffect(() => {
    if (!authToken) {
      setIsHydrating(false)
      return
    }

    let isCurrent = true
    setIsHydrating(true)

    fetchState(authToken)
      .then((response) => {
        if (!isCurrent) {
          return
        }

        setState(response.state)
        setErrorMessage('')
      })
      .catch((error: unknown) => {
        if (!isCurrent) {
          return
        }

        clearSession()
        setAuthenticatedOperator(null)
        setAuthToken('')
        setReportPreview(null)
        setErrorMessage(error instanceof Error ? error.message : 'Unable to restore the workspace session.')
      })
      .finally(() => {
        if (isCurrent) {
          setIsHydrating(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [authToken])

  const cases = state.cases
  const subjects = state.subjects
  const evidence = state.evidence
  const isAuthenticated = Boolean(authToken && authenticatedOperator)

  const selectedCase = useMemo(
    () => cases.find((caseRecord) => caseRecord.id === selectedCaseId) ?? cases[0] ?? null,
    [cases, selectedCaseId],
  )

  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject.id === selectedSubjectId) ?? subjects[0] ?? null,
    [selectedSubjectId, subjects],
  )

  useEffect(() => {
    if (!selectedCase) {
      return
    }

    setCaseWorkflow({
      status: selectedCase.status,
      priority: selectedCase.priority,
      owner: selectedCase.owner,
      notes: selectedCase.notes,
    })
  }, [selectedCase])

  useEffect(() => {
    if (!selectedSubject) {
      return
    }

    setSubjectAssessment({
      threatLevel: selectedSubject.threatLevel,
      financial: selectedSubject.risk.financial,
      network: selectedSubject.risk.network,
      mobility: selectedSubject.risk.mobility,
      analystNote: selectedSubject.analystNote,
    })
  }, [selectedSubject])

  const filteredCases = useMemo(() => {
    const query = caseSearch.toLowerCase()
    return cases.filter((caseRecord) => {
      const matchesQuery =
        caseRecord.title.toLowerCase().includes(query) ||
        caseRecord.id.toLowerCase().includes(query) ||
        caseRecord.summary.toLowerCase().includes(query)
      const matchesCategory = categoryFilter === 'All' || caseRecord.category === categoryFilter
      return matchesQuery && matchesCategory
    })
  }, [caseSearch, cases, categoryFilter])

  const filteredSubjects = useMemo(() => {
    const query = subjectSearch.toLowerCase()
    return subjects.filter((subject) => {
      return [subject.name, subject.alias, subject.nationalId, subject.location]
        .join(' ')
        .toLowerCase()
        .includes(query)
    })
  }, [subjectSearch, subjects])

  const caseSubjects = selectedCase
    ? selectedCase.subjectLinks
        .map((link) => ({ link, subject: subjects.find((subject) => subject.id === link.subjectId) }))
        .filter((item): item is { link: CaseRecord['subjectLinks'][number]; subject: SubjectProfile } => Boolean(item.subject))
    : []

  const caseEvidence = selectedCase
    ? evidence.filter((item) => item.caseId === selectedCase.id)
    : []

  const runAction = async <T,>(action: string, work: () => Promise<T>) => {
    setBusyAction(action)
    setErrorMessage('')

    try {
      return await work()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Request failed.')
      return null
    } finally {
      setBusyAction('')
    }
  }

  const handleLogin = async () => {
    if (!sessionOperator.trim() || !accessKey.trim()) {
      setErrorMessage('Operator ID and access key are required.')
      return
    }

    const response = await runAction('login', () => loginRequest(sessionOperator.trim(), accessKey.trim()))
    if (!response) {
      return
    }

    persistSession(response.token, response.operator)
    setAuthenticatedOperator(response.operator)
    setAuthToken(response.token)
    setState(response.state)
    setAccessKey('')
    setView('dashboard')
    setStatusMessage(`Connected to the lite infrastructure workspace as ${response.operator.displayName}.`)
  }

  const handleLogout = async () => {
    const currentToken = authToken

    if (currentToken) {
      await logoutRequest(currentToken).catch(() => undefined)
    }

    clearSession()
    setAuthenticatedOperator(null)
    setAuthToken('')
    setAccessKey('')
    setReportPreview(null)
    setView('dashboard')
    setStatusMessage('Signed out from the operational workspace.')
  }

  const handleCaseCreate = async () => {
    if (!newCase.title.trim() || !newCase.summary.trim() || !authToken) {
      setErrorMessage('Case title and summary are required.')
      return
    }

    const response = await runAction('create-case', () => createCaseRequest(authToken, newCase))
    if (!response) {
      return
    }

    setState(response.state)
    setSelectedCaseId(response.caseRecord.id)
    setView('cases')
    setNewCase(createCaseDraft())
    setStatusMessage(`Case ${response.caseRecord.id} created.`)
  }

  const handleCaseWorkflowSave = async () => {
    if (!selectedCase || !authToken) {
      return
    }

    const response = await runAction('save-case', () => updateCaseRequest(authToken, selectedCase.id, caseWorkflow))
    if (!response) {
      return
    }

    setState(response.state)
    setStatusMessage(`Case ${selectedCase.id} workflow updated.`)
  }

  const handleSubjectLink = async () => {
    if (!selectedCase || !caseLinkSubjectId || !authToken) {
      return
    }

    const response = await runAction('link-subject', () =>
      linkSubjectToCase(authToken, selectedCase.id, caseLinkSubjectId, caseLinkRole),
    )
    if (!response) {
      return
    }

    setState(response.state)
    setCaseLinkSubjectId('')
    setStatusMessage(`Subject linked to ${selectedCase.id}.`)
  }

  const handleEvidenceAdd = async () => {
    if (!selectedCase || !evidenceDraft.source.trim() || !evidenceDraft.summary.trim() || !authToken) {
      setErrorMessage('Evidence source and summary are required.')
      return
    }

    const response = await runAction('add-evidence', () => addEvidenceRequest(authToken, selectedCase.id, evidenceDraft))
    if (!response) {
      return
    }

    setState(response.state)
    setEvidenceDraft(createEvidenceDraft())
    setStatusMessage(`Evidence added to ${selectedCase.id}.`)
  }

  const handleSubjectRegister = async () => {
    if (!subjectDraft.name.trim() || !subjectDraft.nationalId.trim() || !authToken) {
      setErrorMessage('Subject name and national ID are required.')
      return
    }

    const response = await runAction('register-subject', () =>
      createSubjectRequest(authToken, {
        name: subjectDraft.name,
        alias: subjectDraft.alias,
        nationalId: subjectDraft.nationalId,
        location: subjectDraft.location,
        occupation: subjectDraft.occupation,
        bioProfile: {
          heightCm: Number(subjectDraft.heightCm),
          weightKg: Number(subjectDraft.weightKg),
          bodyType: subjectDraft.bodyType as SubjectProfile['bioProfile']['bodyType'],
          footSize: subjectDraft.footSize,
          hobbies: subjectDraft.hobbies,
          medicalConditions: subjectDraft.medicalConditions,
        },
        appearance: {
          mode: 'composite',
          sex: subjectDraft.sex as SubjectProfile['appearance']['sex'],
          faceConcept: subjectDraft.faceConcept as SubjectProfile['appearance']['faceConcept'],
          hairstyle: subjectDraft.hairstyle as SubjectProfile['appearance']['hairstyle'],
          skinTone: subjectDraft.skinTone,
          hairColor: subjectDraft.hairColor,
          eyeColor: subjectDraft.eyeColor,
          facialHair: subjectDraft.facialHair as SubjectProfile['appearance']['facialHair'],
        },
        analystNote: subjectDraft.analystNote,
      }),
    )
    if (!response) {
      return
    }

    setState(response.state)
    setSelectedSubjectId(response.subject.id)
    setView('subjects')
    setSubjectDraft(createSubjectDraft())
    setStatusMessage(`Subject ${response.subject.id} registered.`)
  }

  const handleSubjectAssessmentSave = async () => {
    if (!selectedSubject || !authToken) {
      return
    }

    const response = await runAction('save-subject', () =>
      updateSubjectRequest(authToken, selectedSubject.id, {
        threatLevel: subjectAssessment.threatLevel,
        analystNote: subjectAssessment.analystNote,
        risk: {
          financial: subjectAssessment.financial,
          network: subjectAssessment.network,
          mobility: subjectAssessment.mobility,
        },
      }),
    )
    if (!response) {
      return
    }

    setState(response.state)
    setStatusMessage(`Subject ${selectedSubject.id} assessment updated.`)
  }

  const createCaseReport = async (caseRecord: CaseRecord) => {
    if (!authToken) {
      return
    }

    const response = await runAction('case-report', () => generateCaseReportRequest(authToken, caseRecord.id))
    if (!response) {
      return
    }

    setState(response.state)
    setReportPreview(response.report)
    setStatusMessage(`Case report generated for ${caseRecord.id}.`)
  }

  const createSubjectReport = async (subject: SubjectProfile) => {
    if (!authToken) {
      return
    }

    const response = await runAction('subject-report', () => generateSubjectReportRequest(authToken, subject.id))
    if (!response) {
      return
    }

    setState(response.state)
    setReportPreview(response.report)
    setStatusMessage(`Subject dossier generated for ${subject.id}.`)
  }

  const statCards = [
    { label: 'Open cases', value: cases.filter((item) => item.status !== 'Closed').length },
    { label: 'Tracked subjects', value: subjects.length },
    { label: 'Elevated+ threat', value: subjects.filter((item) => ['Elevated', 'Severe', 'Critical'].includes(item.threatLevel)).length },
    { label: 'Evidence items', value: evidence.length },
  ]

  const modules = state.modules as FeatureCoverage[]
  const operatorLabel = authenticatedOperator?.displayName ?? sessionOperator ?? 'Unassigned operator'

  if (!isAuthenticated) {
    return (
      <main className="login-shell">
        <section className="login-panel">
          <div className="login-copy">
            <span className="eyebrow">SENTINEL</span>
            <h1>{isHydrating ? 'Restoring operational workspace' : 'Intelligence case operations console'}</h1>
            <p>
              {isHydrating
                ? 'Reconnecting to the lite infrastructure services and validating the current session.'
                : 'A lightweight full-feature case management console for case recording, subject profiling, evidence linkage, relationship analysis, and intelligence reporting.'}
            </p>
            {!isHydrating && (
              <div className="callout-grid">
                <article>
                  <strong>Case management</strong>
                  <p>Structured case creation, workflow control, tracking, search, and audit.</p>
                </article>
                <article>
                  <strong>Unified repository</strong>
                  <p>Cross-linked cases, subjects, evidence, reports, and activity history on a shared API.</p>
                </article>
                <article>
                  <strong>Threat-aware reporting</strong>
                  <p>Generate a case report or subject dossier with persisted operational detail.</p>
                </article>
              </div>
            )}
          </div>
          {!isHydrating && (
            <div className="login-card">
              <span className="eyebrow">Operator access</span>
              <label>
                Operator ID
                <input value={sessionOperator} onChange={(event) => setSessionOperator(event.target.value)} placeholder="OPS-NIGHT-4" />
              </label>
              <label>
                Access Key
                <input type="password" value={accessKey} onChange={(event) => setAccessKey(event.target.value)} placeholder="Enter current shift key" />
              </label>
              <p className="muted-copy">Use a seeded operator like OPS-NIGHT-4 / sentinel123, or create a new operator ID with your own key.</p>
              <button className="primary-button" onClick={handleLogin} disabled={busyAction === 'login'}>
                {busyAction === 'login' ? 'Authenticating...' : 'Enter console'}
              </button>
              {errorMessage && <p className="muted-copy">{errorMessage}</p>}
            </div>
          )}
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div>
          <span className="eyebrow">SENTINEL</span>
          <h2>Case Management Console</h2>
          <p className="muted-copy">Full-feature workspace on lite infrastructure.</p>
        </div>
        <nav className="nav-list">
          {[
            ['dashboard', 'Dashboard'],
            ['cases', 'Cases'],
            ['subjects', 'Subject Registry'],
            ['reports', 'Reports'],
            ['activity', 'Audit Trail'],
          ].map(([key, label]) => (
            <button
              key={key}
              className={view === key ? 'nav-button active' : 'nav-button'}
              onClick={() => setView(key as AppView)}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="side-footer">
          <div>
            <strong>{operatorLabel}</strong>
            <span>{authenticatedOperator?.role ?? 'Authenticated operator'}</span>
          </div>
          <button className="ghost-button" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">Live workspace</span>
            <h1>
              {view === 'dashboard' && 'Operational command view'}
              {view === 'cases' && 'Case repository'}
              {view === 'subjects' && 'Subject registry and profiling'}
              {view === 'reports' && 'Reporting centre'}
              {view === 'activity' && 'Audit trail'}
            </h1>
          </div>
          <div className="status-bar">
            <span className="badge">Lite API persistence enabled</span>
            {isHydrating && <span className="badge subtle">Syncing</span>}
            <span className="badge subtle">{new Date().toLocaleString('en-MY')}</span>
          </div>
        </header>

        {(statusMessage || errorMessage) && (
          <section className="panel">
            <p>{errorMessage || statusMessage}</p>
          </section>
        )}

        {view === 'dashboard' && (
          <div className="view-stack">
            <section className="stats-grid">
              {statCards.map((card) => (
                <article className="stat-card" key={card.label}>
                  <span>{card.label}</span>
                  <strong>{card.value}</strong>
                </article>
              ))}
            </section>

            <section className="panel two-up">
              <div>
                <div className="section-header compact">
                  <div>
                    <h3>Recent case files</h3>
                    <p>Latest operational records and owners.</p>
                  </div>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Case</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Owner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cases.slice(0, 5).map((caseRecord) => (
                        <tr key={caseRecord.id}>
                          <td>
                            <button
                              className="text-button"
                              onClick={() => {
                                setSelectedCaseId(caseRecord.id)
                                setView('cases')
                              }}
                            >
                              {caseRecord.id}
                            </button>
                          </td>
                          <td>{caseRecord.category}</td>
                          <td>{caseRecord.status}</td>
                          <td>{caseRecord.owner}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <div className="section-header compact">
                  <div>
                    <h3>Threat distribution</h3>
                    <p>Tracked subjects by assigned threat tier.</p>
                  </div>
                </div>
                <div className="tier-stack">
                  {threatLevels.map((level) => {
                    const count = subjects.filter((subject) => subject.threatLevel === level).length
                    return (
                      <div key={level} className="tier-row">
                        <span>{level}</span>
                        <div className="tier-bar">
                          <div style={{ width: `${Math.max(8, count * 18)}px`, background: threatColors[level] }} />
                        </div>
                        <strong>{count}</strong>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>

            <section className="panel">
              <div className="section-header compact">
                <div>
                  <h3>Feature coverage</h3>
                  <p>What the current system delivers beyond the original standalone MVP.</p>
                </div>
              </div>
              <div className="module-grid">
                {modules.map((module) => (
                  <article key={module.name} className="module-card">
                    <div className="module-head">
                      <strong>{module.name}</strong>
                      <span className={`status-chip ${module.status.toLowerCase().replace(/\s+/g, '-')}`}>{module.status}</span>
                    </div>
                    <p>{module.focus}</p>
                    <small>{module.note}</small>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}

        {view === 'cases' && (
          <div className="view-stack">
            <section className="panel two-up repository-grid">
              <div>
                <div className="section-header compact">
                  <div>
                    <h3>Case list</h3>
                    <p>Search, filter, and jump to file detail.</p>
                  </div>
                </div>
                <div className="filter-row">
                  <input value={caseSearch} onChange={(event) => setCaseSearch(event.target.value)} placeholder="Search case ID, title, summary" />
                  <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                    <option value="All">All categories</option>
                    {caseCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="list-stack">
                  {filteredCases.map((caseRecord) => (
                    <button
                      key={caseRecord.id}
                      className={selectedCase?.id === caseRecord.id ? 'list-card active' : 'list-card'}
                      onClick={() => setSelectedCaseId(caseRecord.id)}
                    >
                      <div className="list-card-top">
                        <strong>{caseRecord.title}</strong>
                        <span className="tiny-id">{caseRecord.id}</span>
                      </div>
                      <div className="tag-row">
                        <span className="pill" style={{ background: `${categoryColors[caseRecord.category]}22`, color: categoryColors[caseRecord.category] }}>
                          {caseRecord.category}
                        </span>
                        <span className="pill subdued">{caseRecord.status}</span>
                        <span className="pill subdued">{caseRecord.priority}</span>
                      </div>
                      <p>{caseRecord.summary}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-panel">
                <div className="section-header compact">
                  <div>
                    <h3>Create case</h3>
                    <p>Structured registration aligned to the case console workflow.</p>
                  </div>
                </div>
                <label>
                  Title
                  <input value={newCase.title} onChange={(event) => setNewCase((current) => ({ ...current, title: event.target.value }))} />
                </label>
                <label>
                  Category
                  <select value={newCase.category} onChange={(event) => setNewCase((current) => ({ ...current, category: event.target.value as typeof current.category }))}>
                    {caseCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="split-row">
                  <label>
                    Priority
                    <select value={newCase.priority} onChange={(event) => setNewCase((current) => ({ ...current, priority: event.target.value as typeof current.priority }))}>
                      {casePriorities.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Status
                    <select value={newCase.status} onChange={(event) => setNewCase((current) => ({ ...current, status: event.target.value as typeof current.status }))}>
                      {caseStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label>
                  Summary
                  <textarea rows={4} value={newCase.summary} onChange={(event) => setNewCase((current) => ({ ...current, summary: event.target.value }))} />
                </label>
                <label>
                  Analyst note
                  <textarea rows={3} value={newCase.notes} onChange={(event) => setNewCase((current) => ({ ...current, notes: event.target.value }))} />
                </label>
                <button className="primary-button" onClick={handleCaseCreate} disabled={busyAction === 'create-case'}>
                  {busyAction === 'create-case' ? 'Registering...' : 'Register case'}
                </button>
              </div>
            </section>

            {selectedCase && (
              <section className="panel detail-grid">
                <div className="hero-card">
                  <div className="hero-top">
                    <div>
                      <span className="tiny-id">{selectedCase.id}</span>
                      <h2>{selectedCase.title}</h2>
                    </div>
                    <button className="primary-button" onClick={() => createCaseReport(selectedCase)} disabled={busyAction === 'case-report'}>
                      {busyAction === 'case-report' ? 'Compiling...' : 'Generate case report'}
                    </button>
                  </div>
                  <div className="tag-row">
                    <span className="pill" style={{ background: `${categoryColors[selectedCase.category]}22`, color: categoryColors[selectedCase.category] }}>
                      {selectedCase.category}
                    </span>
                    <span className="pill subdued">{selectedCase.priority}</span>
                    <span className="pill subdued">{selectedCase.status}</span>
                    <span className="pill subdued">Owner {selectedCase.owner}</span>
                  </div>
                  <p>{selectedCase.summary}</p>
                  <div className="meta-grid">
                    <div>
                      <span>Opened</span>
                      <strong>{formatDate(selectedCase.openedAt)}</strong>
                    </div>
                    <div>
                      <span>Updated</span>
                      <strong>{formatDate(selectedCase.lastUpdatedAt)}</strong>
                    </div>
                    <div>
                      <span>Subjects</span>
                      <strong>{selectedCase.subjectLinks.length}</strong>
                    </div>
                    <div>
                      <span>Evidence</span>
                      <strong>{caseEvidence.length}</strong>
                    </div>
                  </div>
                </div>

                <div className="panel-shell">
                  <div className="section-header compact">
                    <div>
                      <h3>Case workflow controls</h3>
                      <p>Update operational ownership, priority, status, and working notes.</p>
                    </div>
                  </div>
                  <div className="split-row">
                    <label>
                      Status
                      <select value={caseWorkflow.status} onChange={(event) => setCaseWorkflow((current) => ({ ...current, status: event.target.value as CaseRecord['status'] }))}>
                        {caseStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Priority
                      <select value={caseWorkflow.priority} onChange={(event) => setCaseWorkflow((current) => ({ ...current, priority: event.target.value as CaseRecord['priority'] }))}>
                        {casePriorities.map((priority) => (
                          <option key={priority} value={priority}>
                            {priority}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label>
                    Owner
                    <input value={caseWorkflow.owner} onChange={(event) => setCaseWorkflow((current) => ({ ...current, owner: event.target.value }))} />
                  </label>
                  <label>
                    Working note
                    <textarea rows={3} value={caseWorkflow.notes} onChange={(event) => setCaseWorkflow((current) => ({ ...current, notes: event.target.value }))} />
                  </label>
                  <button className="ghost-button" onClick={handleCaseWorkflowSave} disabled={busyAction === 'save-case'}>
                    {busyAction === 'save-case' ? 'Saving...' : 'Save workflow state'}
                  </button>
                </div>

                <div className="panel-shell">
                  <div className="section-header compact">
                    <div>
                      <h3>Linked subjects</h3>
                      <p>Attach known identities with an operational role.</p>
                    </div>
                  </div>
                  <div className="split-row">
                    <select value={caseLinkSubjectId} onChange={(event) => setCaseLinkSubjectId(event.target.value)}>
                      <option value="">Select subject</option>
                      {subjects
                        .filter((subject) => !selectedCase.subjectLinks.some((link) => link.subjectId === subject.id))
                        .map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.id} · {subject.name}
                          </option>
                        ))}
                    </select>
                    <select value={caseLinkRole} onChange={(event) => setCaseLinkRole(event.target.value as typeof caseLinkRole)}>
                      {subjectRoles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button className="ghost-button" onClick={handleSubjectLink} disabled={busyAction === 'link-subject'}>
                    {busyAction === 'link-subject' ? 'Linking...' : 'Link subject'}
                  </button>
                  <div className="mini-list">
                    {caseSubjects.map(({ link, subject }) => (
                      <article key={subject.id} className="mini-card">
                        <div>
                          <button
                            className="text-button"
                            onClick={() => {
                              setSelectedSubjectId(subject.id)
                              setView('subjects')
                            }}
                          >
                            {subject.name}
                          </button>
                          <p>{link.role}</p>
                        </div>
                        <span className="pill subdued" style={{ color: threatColors[subject.threatLevel] }}>
                          {subject.threatLevel}
                        </span>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="panel-shell">
                  <div className="section-header compact">
                    <div>
                      <h3>Evidence and materials</h3>
                      <p>Create evidence entries and preserve handling notes.</p>
                    </div>
                  </div>
                  <div className="split-row">
                    <select value={evidenceDraft.type} onChange={(event) => setEvidenceDraft((current) => ({ ...current, type: event.target.value as typeof current.type }))}>
                      {evidenceTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <input value={evidenceDraft.source} onChange={(event) => setEvidenceDraft((current) => ({ ...current, source: event.target.value }))} placeholder="Source" />
                  </div>
                  <textarea rows={3} value={evidenceDraft.summary} onChange={(event) => setEvidenceDraft((current) => ({ ...current, summary: event.target.value }))} placeholder="Evidence summary" />
                  <textarea rows={2} value={evidenceDraft.custodyNote} onChange={(event) => setEvidenceDraft((current) => ({ ...current, custodyNote: event.target.value }))} placeholder="Custody / handling note" />
                  <button className="ghost-button" onClick={handleEvidenceAdd} disabled={busyAction === 'add-evidence'}>
                    {busyAction === 'add-evidence' ? 'Saving...' : 'Add evidence'}
                  </button>
                  <div className="mini-list">
                    {caseEvidence.map((item) => (
                      <article key={item.id} className="mini-card evidence-card">
                        <div>
                          <strong>{item.id}</strong>
                          <p>{item.summary}</p>
                        </div>
                        <span className="pill subdued">{item.type}</span>
                      </article>
                    ))}
                  </div>
                </div>

                <NetworkGraph
                  caseRecord={selectedCase}
                  subjects={caseSubjects.map((item) => item.subject)}
                  evidence={caseEvidence}
                  onSelectSubject={(subjectId) => {
                    setSelectedSubjectId(subjectId)
                    setView('subjects')
                  }}
                />
              </section>
            )}
          </div>
        )}

        {view === 'subjects' && (
          <div className="view-stack">
            <section className="panel two-up repository-grid">
              <div>
                <div className="section-header compact">
                  <div>
                    <h3>Subject registry</h3>
                    <p>Search identified entities and pivot across linked cases.</p>
                  </div>
                </div>
                <input value={subjectSearch} onChange={(event) => setSubjectSearch(event.target.value)} placeholder="Search name, alias, ID, location" />
                <div className="list-stack">
                  {filteredSubjects.map((subject) => (
                    <button
                      key={subject.id}
                      className={selectedSubject?.id === subject.id ? 'list-card active' : 'list-card'}
                      onClick={() => setSelectedSubjectId(subject.id)}
                    >
                      <div className="list-card-top">
                        <strong>{subject.name}</strong>
                        <span className="tiny-id">{subject.id}</span>
                      </div>
                      <div className="tag-row">
                        <span className="pill subdued">{subject.alias || 'No alias'}</span>
                        <span className="pill subdued" style={{ color: threatColors[subject.threatLevel] }}>
                          {subject.threatLevel}
                        </span>
                      </div>
                      <p>{subject.location}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-panel">
                <div className="section-header compact">
                  <div>
                    <h3>Register subject</h3>
                    <p>Identity, bioprofile, and appearance reconstruction.</p>
                  </div>
                </div>
                <div className="split-row">
                  <label>
                    Name
                    <input value={subjectDraft.name} onChange={(event) => setSubjectDraft((current) => ({ ...current, name: event.target.value }))} />
                  </label>
                  <label>
                    Alias
                    <input value={subjectDraft.alias} onChange={(event) => setSubjectDraft((current) => ({ ...current, alias: event.target.value }))} />
                  </label>
                </div>
                <div className="split-row">
                  <label>
                    National ID
                    <input value={subjectDraft.nationalId} onChange={(event) => setSubjectDraft((current) => ({ ...current, nationalId: event.target.value }))} />
                  </label>
                  <label>
                    Occupation
                    <input value={subjectDraft.occupation} onChange={(event) => setSubjectDraft((current) => ({ ...current, occupation: event.target.value }))} />
                  </label>
                </div>
                <label>
                  Location
                  <input value={subjectDraft.location} onChange={(event) => setSubjectDraft((current) => ({ ...current, location: event.target.value }))} />
                </label>
                <div className="split-row three-up">
                  <label>
                    Height (cm)
                    <input type="number" value={subjectDraft.heightCm} onChange={(event) => setSubjectDraft((current) => ({ ...current, heightCm: Number(event.target.value) }))} />
                  </label>
                  <label>
                    Weight (kg)
                    <input type="number" value={subjectDraft.weightKg} onChange={(event) => setSubjectDraft((current) => ({ ...current, weightKg: Number(event.target.value) }))} />
                  </label>
                  <label>
                    Foot size
                    <input value={subjectDraft.footSize} onChange={(event) => setSubjectDraft((current) => ({ ...current, footSize: event.target.value }))} />
                  </label>
                </div>
                <div className="split-row three-up">
                  <label>
                    Body type
                    <select value={subjectDraft.bodyType} onChange={(event) => setSubjectDraft((current) => ({ ...current, bodyType: event.target.value }))}>
                      {['Lean', 'Athletic', 'Average', 'Heavy'].map((bodyType) => (
                        <option key={bodyType} value={bodyType}>
                          {bodyType}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Sex
                    <select value={subjectDraft.sex} onChange={(event) => setSubjectDraft((current) => ({ ...current, sex: event.target.value }))}>
                      {['Male', 'Female'].map((sex) => (
                        <option key={sex} value={sex}>
                          {sex}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Face concept
                    <select value={subjectDraft.faceConcept} onChange={(event) => setSubjectDraft((current) => ({ ...current, faceConcept: event.target.value }))}>
                      {['Oval', 'Round', 'Square', 'Heart', 'Long'].map((faceConcept) => (
                        <option key={faceConcept} value={faceConcept}>
                          {faceConcept}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="split-row three-up">
                  <label>
                    Hairstyle
                    <select value={subjectDraft.hairstyle} onChange={(event) => setSubjectDraft((current) => ({ ...current, hairstyle: event.target.value }))}>
                      {['Bald', 'Buzz', 'Short', 'Medium', 'Long', 'Ponytail', 'Bun', 'Afro'].map((hairstyle) => (
                        <option key={hairstyle} value={hairstyle}>
                          {hairstyle}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Eye color
                    <input type="color" value={subjectDraft.eyeColor} onChange={(event) => setSubjectDraft((current) => ({ ...current, eyeColor: event.target.value }))} />
                  </label>
                  <label>
                    Facial hair
                    <select value={subjectDraft.facialHair} onChange={(event) => setSubjectDraft((current) => ({ ...current, facialHair: event.target.value }))}>
                      {['None', 'Stubble', 'Moustache', 'Goatee', 'Full Beard'].map((facialHair) => (
                        <option key={facialHair} value={facialHair}>
                          {facialHair}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="split-row three-up">
                  <label>
                    Skin tone
                    <input type="color" value={subjectDraft.skinTone} onChange={(event) => setSubjectDraft((current) => ({ ...current, skinTone: event.target.value }))} />
                  </label>
                  <label>
                    Hair color
                    <input type="color" value={subjectDraft.hairColor} onChange={(event) => setSubjectDraft((current) => ({ ...current, hairColor: event.target.value }))} />
                  </label>
                </div>
                <label>
                  Hobbies
                  <textarea rows={2} value={subjectDraft.hobbies} onChange={(event) => setSubjectDraft((current) => ({ ...current, hobbies: event.target.value }))} />
                </label>
                <label>
                  Medical conditions
                  <textarea rows={2} value={subjectDraft.medicalConditions} onChange={(event) => setSubjectDraft((current) => ({ ...current, medicalConditions: event.target.value }))} />
                </label>
                <label>
                  Analyst note
                  <textarea rows={2} value={subjectDraft.analystNote} onChange={(event) => setSubjectDraft((current) => ({ ...current, analystNote: event.target.value }))} />
                </label>
                <SubjectReconstruction
                  name={subjectDraft.name || 'Composite preview'}
                  appearance={{
                    mode: 'composite',
                    sex: subjectDraft.sex as SubjectProfile['appearance']['sex'],
                    faceConcept: subjectDraft.faceConcept as SubjectProfile['appearance']['faceConcept'],
                    hairstyle: subjectDraft.hairstyle as SubjectProfile['appearance']['hairstyle'],
                    skinTone: subjectDraft.skinTone,
                    hairColor: subjectDraft.hairColor,
                    eyeColor: subjectDraft.eyeColor,
                    facialHair: subjectDraft.facialHair as SubjectProfile['appearance']['facialHair'],
                  }}
                  bioProfile={{
                    heightCm: subjectDraft.heightCm,
                    weightKg: subjectDraft.weightKg,
                    bodyType: subjectDraft.bodyType as SubjectProfile['bioProfile']['bodyType'],
                    footSize: subjectDraft.footSize,
                    hobbies: subjectDraft.hobbies,
                    medicalConditions: subjectDraft.medicalConditions,
                  }}
                />
                <button className="primary-button" onClick={handleSubjectRegister} disabled={busyAction === 'register-subject'}>
                  {busyAction === 'register-subject' ? 'Registering...' : 'Register and reconstruct'}
                </button>
              </div>
            </section>

            {selectedSubject && (
              <section className="panel detail-grid subject-detail-grid">
                <div className="hero-card subject-profile-card">
                  <div className="hero-top">
                    <div>
                      <span className="tiny-id">{selectedSubject.id}</span>
                      <h2>{selectedSubject.name}</h2>
                    </div>
                    <button className="primary-button" onClick={() => createSubjectReport(selectedSubject)} disabled={busyAction === 'subject-report'}>
                      {busyAction === 'subject-report' ? 'Compiling...' : 'Generate dossier'}
                    </button>
                  </div>
                  <div className="tag-row">
                    <span className="pill subdued">Alias {selectedSubject.alias || 'None'}</span>
                    <span className="pill subdued">{selectedSubject.location}</span>
                  </div>
                  <div className="subject-profile-layout">
                    <SubjectReconstruction
                      name={selectedSubject.name}
                      appearance={selectedSubject.appearance}
                      bioProfile={selectedSubject.bioProfile}
                    />
                    <div className="subject-meta-stack">
                      <div className="meta-grid">
                        <div>
                          <span>Threat</span>
                          <strong style={{ color: threatColors[selectedSubject.threatLevel] }}>{selectedSubject.threatLevel}</strong>
                        </div>
                        <div>
                          <span>Identity</span>
                          <strong>{selectedSubject.nationalId}</strong>
                        </div>
                        <div>
                          <span>Occupation</span>
                          <strong>{selectedSubject.occupation}</strong>
                        </div>
                        <div>
                          <span>Cases</span>
                          <strong>{selectedSubject.linkedCaseIds.length}</strong>
                        </div>
                      </div>
                      <label>
                        Threat level
                        <select
                          value={subjectAssessment.threatLevel}
                          onChange={(event) =>
                            setSubjectAssessment((current) => ({
                              ...current,
                              threatLevel: event.target.value as SubjectProfile['threatLevel'],
                            }))
                          }
                        >
                          {threatLevels.map((level) => (
                            <option key={level} value={level}>
                              {level}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button className="ghost-button" onClick={handleSubjectAssessmentSave} disabled={busyAction === 'save-subject'}>
                        {busyAction === 'save-subject' ? 'Saving...' : 'Save assessment'}
                      </button>
                    </div>
                  </div>
                  <p>{selectedSubject.analystNote}</p>
                </div>

                <div className="panel-shell">
                  <div className="section-header compact">
                    <div>
                      <h3>Risk indicators</h3>
                      <p>Aggregated signals used to inform threat assignment.</p>
                    </div>
                  </div>
                  {Object.entries(selectedSubject.risk).map(([key, value]) => (
                    <div key={key} className="risk-row">
                      <span>{key}</span>
                      <div className="tier-bar">
                        <div style={{ width: `${value}%`, background: key === 'financial' ? '#17d0b4' : key === 'network' ? '#5db5ff' : '#f5ad50' }} />
                      </div>
                      <strong>{value}</strong>
                    </div>
                  ))}
                  <div className="split-row three-up">
                    <label>
                      Financial
                      <input type="number" min={0} max={100} value={subjectAssessment.financial} onChange={(event) => setSubjectAssessment((current) => ({ ...current, financial: normalizeScore(event.target.value) }))} />
                    </label>
                    <label>
                      Network
                      <input type="number" min={0} max={100} value={subjectAssessment.network} onChange={(event) => setSubjectAssessment((current) => ({ ...current, network: normalizeScore(event.target.value) }))} />
                    </label>
                    <label>
                      Mobility
                      <input type="number" min={0} max={100} value={subjectAssessment.mobility} onChange={(event) => setSubjectAssessment((current) => ({ ...current, mobility: normalizeScore(event.target.value) }))} />
                    </label>
                  </div>
                  <label>
                    Analyst note
                    <textarea rows={3} value={subjectAssessment.analystNote} onChange={(event) => setSubjectAssessment((current) => ({ ...current, analystNote: event.target.value }))} />
                  </label>
                </div>

                <div className="panel-shell">
                  <div className="section-header compact">
                    <div>
                      <h3>Bioprofile</h3>
                      <p>Physical descriptors and analyst-provided attributes.</p>
                    </div>
                  </div>
                  <div className="meta-grid">
                    <div>
                      <span>Height</span>
                      <strong>{selectedSubject.bioProfile.heightCm} cm</strong>
                    </div>
                    <div>
                      <span>Weight</span>
                      <strong>{selectedSubject.bioProfile.weightKg} kg</strong>
                    </div>
                    <div>
                      <span>Body type</span>
                      <strong>{selectedSubject.bioProfile.bodyType}</strong>
                    </div>
                    <div>
                      <span>Foot size</span>
                      <strong>{selectedSubject.bioProfile.footSize}</strong>
                    </div>
                  </div>
                  <p><strong>Hobbies:</strong> {selectedSubject.bioProfile.hobbies}</p>
                  <p><strong>Medical conditions:</strong> {selectedSubject.bioProfile.medicalConditions}</p>
                </div>

                <div className="panel-shell">
                  <div className="section-header compact">
                    <div>
                      <h3>Case involvement</h3>
                      <p>Reverse links from subject to repository cases.</p>
                    </div>
                  </div>
                  <div className="mini-list">
                    {cases
                      .filter((caseRecord) => selectedSubject.linkedCaseIds.includes(caseRecord.id))
                      .map((caseRecord) => (
                        <article key={caseRecord.id} className="mini-card">
                          <div>
                            <button
                              className="text-button"
                              onClick={() => {
                                setSelectedCaseId(caseRecord.id)
                                setView('cases')
                              }}
                            >
                              {caseRecord.title}
                            </button>
                            <p>{caseRecord.id}</p>
                          </div>
                          <span className="pill subdued">{caseRecord.status}</span>
                        </article>
                      ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        {view === 'reports' && (
          <div className="view-stack">
            <section className="panel two-up">
              <div className="panel-shell">
                <div className="section-header compact">
                  <div>
                    <h3>Generate report</h3>
                    <p>Use direct entry points or create from the reporting centre.</p>
                  </div>
                </div>
                <div className="action-grid">
                  <button className="action-card" onClick={() => selectedCase && createCaseReport(selectedCase)}>
                    <strong>Case report</strong>
                    <p>Use the current selected case and compile linked subjects and evidence.</p>
                  </button>
                  <button className="action-card" onClick={() => selectedSubject && createSubjectReport(selectedSubject)}>
                    <strong>Subject dossier</strong>
                    <p>Use the current selected subject and compile all case involvement.</p>
                  </button>
                </div>
              </div>
              <div className="panel-shell">
                <div className="section-header compact">
                  <div>
                    <h3>Persisted reports</h3>
                    <p>Re-open previously generated reports from the shared workspace.</p>
                  </div>
                </div>
                <div className="mini-list">
                  {state.reports.length === 0 && <p className="muted-copy">No reports generated yet.</p>}
                  {state.reports.map((report) => (
                    <article key={report.id} className="mini-card">
                      <div>
                        <button className="text-button" onClick={() => setReportPreview(report)}>
                          {report.title}
                        </button>
                        <p>
                          {report.targetId} · {formatDate(report.createdAt)}
                        </p>
                      </div>
                      <span className="pill subdued">{report.kind}</span>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {view === 'activity' && (
          <div className="view-stack">
            <section className="panel">
              <div className="section-header compact">
                <div>
                  <h3>Audit trail</h3>
                  <p>Current session and persisted operational events.</p>
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Actor</th>
                      <th>Action</th>
                      <th>Target</th>
                      <th>Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.auditTrail.map((event) => (
                      <tr key={event.id}>
                        <td>{formatDate(event.createdAt)}</td>
                        <td>{event.actor}</td>
                        <td>{event.action}</td>
                        <td>
                          {event.targetType} · {event.targetId}
                        </td>
                        <td>{event.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </section>
      <ReportPreview report={reportPreview} onClose={() => setReportPreview(null)} />
    </main>
  )
}

export default App