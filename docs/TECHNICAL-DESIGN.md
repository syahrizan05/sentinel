# Technical Design

## 1. Technology Stack

1. Front end: React 18 with TypeScript
2. Build tool: Vite 5
3. Visualization: `d3-force` for relationship layout
4. API: Express 5 with TypeScript, run through `tsx`
5. Persistence: PostgreSQL accessed through Prisma
6. Session storage: browser localStorage for the lightweight bearer token only
7. Styling: custom CSS with tactical dashboard visual language

## 2. Front-End Structure

Recommended internal layers:

1. App shell and navigation
2. Domain types and seed data
3. API client functions in `src/api.ts`
4. Lite repository and mutation endpoints in `server/index.ts`
5. Presentation components for cases, subjects, reports, and graph
6. Utility functions for threat scoring, IDs, and reporting

## 3. Primary Domain Entities

1. OperatorSession
2. CaseRecord
3. SubjectProfile
4. SubjectAppearance
5. EvidenceItem
6. AuditEvent
7. ReportArtifact

## 4. Key User Flows

### 4.1 Case Creation

1. Operator signs in.
2. Operator opens case registration form.
3. System generates a case ID.
4. API persists the case to PostgreSQL.
5. Case appears on the dashboard and repository views.
6. Audit event is created.

### 4.2 Subject Linking

1. Operator opens a case.
2. Operator selects one or more existing subjects.
3. Operator assigns relationship roles.
4. System updates the case graph and subject reverse links.
5. Audit event is created.

### 4.3 Subject Registration

1. Analyst opens registration form.
2. Analyst enters identity and bioprofile data.
3. Analyst configures appearance or uploads a photo in future versions.
4. System shows a stylized 3D preview.
5. On submit, the system creates the subject and logs the action.

### 4.4 Report Generation

1. Operator chooses a case or subject.
2. System composes a formatted HTML dossier.
3. User previews, opens, or prints the report.
4. Audit event is created.

## 5. Current API Boundary

The current backend is an Express API backed by Prisma/PostgreSQL. It exposes:

1. `POST /api/auth/login` and `POST /api/auth/logout`
2. `GET /api/state`
3. `POST /api/cases` and `PATCH /api/cases/:caseId`
4. `POST /api/cases/:caseId/subjects`
5. `POST /api/cases/:caseId/evidence`
6. `POST /api/subjects` and `PATCH /api/subjects/:subjectId`
7. `POST /api/reports/cases/:caseId` and `POST /api/reports/subjects/:subjectId`

## 6. Integration Seams

1. Subject registry can later hydrate from an external identity service.
2. The lite repository can later be replaced by production repository and audit APIs.
3. Graph data can later source from analytics and correlation services.
4. Evidence items can later move to a vault-backed store with integrity metadata.
5. Search can later redirect from in-memory filters to dedicated indexing APIs.

## 7. Testing Strategy For Code

1. Type-safe build validation on every change.
2. Manual scenario validation for login, case creation, subject registration, linking, threat changes, and report generation.
3. Future automated tests for reducers, report formatters, and graph input mapping.

## 8. Known MVP Limitations

1. Bearer sessions are database-backed, but enterprise SSO/RBAC is still future scope.
2. No immutable evidence hashing enforcement.
3. No enterprise authentication or authorization.
4. No real external system integrations.
5. 3D subject preview is stylized rather than forensic-grade reconstruction.
