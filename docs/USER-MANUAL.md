# SENTINEL User Manual, Test Scenarios, And Demo Walkthrough

## 1. Purpose

This manual explains how to operate the SENTINEL Case Management Console, demonstrate the seeded live-style workspace, and verify that the main workflows are functioning.

The system is a production-shaped MVP with:

1. React/Vite web console.
2. Express API.
3. PostgreSQL persistence through Prisma.
4. Hashed demo operator credentials.
5. Database-backed bearer sessions.
6. Case, subject, evidence, report, audit, and relationship graph workflows.

## 2. Local Access

### 2.1 Start The System

For local development:

```bash
docker compose up -d postgres adminer
npm run db:deploy
npm run db:seed
npm run dev:full
```

Open the web console:

```text
http://localhost:5173/
```

API health check:

```text
http://localhost:4310/api/health
```

Adminer database console:

```text
http://localhost:18082/
```

Adminer connection values:

```text
System: PostgreSQL
Server: postgres
Username: sentinel
Password: sentinel_dev_password
Database: sentinel
```

### 2.2 Demo Operator Accounts

| Role | Username | Demo Password | Suggested Use |
| --- | --- | --- | --- |
| Supervisor | `OPS-NIGHT-4` | `sentinel123` | Full demo walkthrough and management view |
| Analyst | `OPS-CY-1` | `cywatch` | Cyber-threat workflows |
| Analyst | `OPS-CY-2` | `cywatch` | Influence and infrastructure workflows |
| Operator | `OPS-HQ-3` | `opsready` | Case intake, public-order, and field workflows |

## 3. Seeded Live Workspace

After running `npm run db:seed`, the workspace contains:

1. 18 seeded cases across all categories.
2. 30 seeded subject profiles.
3. 54 seeded evidence records.
4. 4 persisted report artifacts.
5. 90+ audit events generated from seeded activity.
6. Cross-case subject links designed to make the relationship graph feel active.

Recommended demo cases:

| Case ID | Title | Why It Is Useful |
| --- | --- | --- |
| `CASE-2026-4102` | Warehouse transfer cluster | Dense graph with logistics, finance, and subject overlap |
| `CASE-2026-4124` | Terminal skimming procurement | Critical escalated financial-crime case |
| `CASE-2026-4130` | Proxy infrastructure renewal | Cyber escalation with infrastructure and credential indicators |
| `CASE-2026-4127` | Public forum mobilization | Public-order workflow with lower operational tone |
| `CASE-2026-4133` | Campus fundraising contact | Low-risk intake case for safe training demo |

Recommended demo subjects:

| Subject ID | Name | Why It Is Useful |
| --- | --- | --- |
| `SBJ-1003` | Daniel Raj | Critical subject with finance/logistics overlap |
| `SBJ-1009` | Prakash Menon | Cross-case bridge subject |
| `SBJ-1018` | Rina Suresh | Cyber/device repair workflow |
| `SBJ-1029` | Gavin Pereira | Financial compliance and shell-vendor links |
| `SBJ-1030` | Aina Maisarah | Unassessed new intake subject |

## 4. Main Navigation

The sidebar contains five main views:

1. Dashboard
2. Cases
3. Subject Registry
4. Reports
5. Audit Trail

The top bar shows the current workspace status, API persistence state, and local display time.

## 5. Dashboard

Use the Dashboard to understand the current operational posture.

Expected dashboard content:

1. Open case count.
2. Tracked subject count.
3. Elevated-or-higher threat count.
4. Evidence item count.
5. Recent case activity.
6. Threat distribution.
7. Feature coverage cards.

Suggested checks:

1. Confirm counts are non-zero after seed.
2. Confirm categories and threat levels appear varied.
3. Confirm the feature coverage includes production persistence.

## 6. Case Repository

### 6.1 Search And Filter Cases

1. Open `Cases`.
2. Use the search box to search by case title, case ID, or summary.
3. Use category filtering to narrow by case category.
4. Select a case from the list.

Expected result:

1. The case detail panel updates.
2. The linked subjects list updates.
3. The evidence list updates.
4. The graph updates to the selected case context.

Suggested searches:

```text
warehouse
proxy
CASE-2026-4128
telecom
```

### 6.2 Create A Case

1. Open `Cases`.
2. Fill in a new case title.
3. Select category, priority, and status.
4. Enter a summary and notes.
5. Click the create button.

Expected result:

1. A new `CASE-YYYY-####` identifier is generated.
2. The case appears in the repository.
3. Dashboard counts update.
4. Audit Trail records `CreateCase`.
5. Data persists after reload because it is stored in PostgreSQL.

### 6.3 Update Case Workflow

1. Select a case.
2. Change status, priority, owner, or notes.
3. Save the workflow update.

Expected result:

1. The case detail refreshes.
2. The updated timestamp changes.
3. Audit Trail records `UpdateCase`.

### 6.4 Link Subject To Case

1. Select a case.
2. Choose an existing subject.
3. Choose a role such as `Associate`, `Witness`, or `Facilitator`.
4. Link the subject.

Expected result:

1. Subject appears in the selected case.
2. Selected subject shows the case in reverse-linked case visibility.
3. Relationship graph adds the new subject node.
4. Audit Trail records `LinkSubject`.

### 6.5 Add Evidence

1. Select a case.
2. Choose evidence type.
3. Enter source, summary, and custody note.
4. Add evidence.

Expected result:

1. Evidence appears in the selected case.
2. Evidence node appears in the graph.
3. Dashboard evidence count increases.
4. Audit Trail records `AddEvidence`.

## 7. Subject Registry

### 7.1 Search Subjects

1. Open `Subject Registry`.
2. Search by name, alias, identifier, or location.
3. Select a subject.

Suggested searches:

```text
Prakash
Proxy
Klang
SBJ-1030
```

Expected result:

1. Subject detail panel updates.
2. Reverse-linked cases appear.
3. Bioprofile and appearance preview are visible.

### 7.2 Register A Subject

1. Open `Subject Registry`.
2. Fill identity fields: name, alias, national ID, location, occupation.
3. Fill bioprofile fields: height, weight, body type, foot size, hobbies, medical conditions.
4. Configure appearance traits.
5. Add analyst note.
6. Submit the registration.

Expected result:

1. A new `SBJ-####` identifier is generated.
2. Subject appears in the registry.
3. Subject defaults to `Unassessed`.
4. Initial risk scores are assigned.
5. Audit Trail records `RegisterSubject`.

### 7.3 Update Subject Assessment

1. Select a subject.
2. Change threat level.
3. Adjust financial, network, and mobility risk scores.
4. Update analyst note.
5. Save.

Expected result:

1. Subject detail updates.
2. Threat badge and graph styling update.
3. Case views using that subject show updated threat values.
4. Audit Trail records `UpdateThreat`.

## 8. Relationship Graph

The graph appears in case context and shows:

1. Selected case.
2. Linked subjects.
3. Evidence items.

Expected behavior:

1. Nodes are visually distinguished by type.
2. Subject threat level affects the subject visual treatment.
3. Nodes can be dragged.
4. Selecting another case updates the graph.

Recommended graph demo:

1. Open `CASE-2026-4102`.
2. Observe links to `SBJ-1001`, `SBJ-1003`, `SBJ-1005`, `SBJ-1009`, and `SBJ-1017`.
3. Switch to `CASE-2026-4128`.
4. Observe financial overlap through `SBJ-1003`, `SBJ-1014`, and `SBJ-1029`.

## 9. Reports

### 9.1 Generate Case Report

1. Open `Reports`.
2. Generate a case report for the selected case.
3. Preview the report.
4. Open in a new tab or download/print through browser controls.

Expected result:

1. Report appears in persisted report history.
2. Report includes case summary, linked subjects, evidence, and notes.
3. Audit Trail records `GenerateReport`.

### 9.2 Generate Subject Dossier

1. Open `Reports`.
2. Generate a subject dossier for the selected subject.
3. Preview the report.

Expected result:

1. Report appears in persisted report history.
2. Dossier includes threat, risk indicators, bioprofile, linked cases, and analyst note.
3. Audit Trail records `GenerateReport`.

## 10. Audit Trail

The Audit Trail shows operational activity, including:

1. Login.
2. Logout.
3. Case creation.
4. Case workflow updates.
5. Subject registration.
6. Subject threat updates.
7. Subject linking.
8. Evidence creation.
9. Report generation.

Expected behavior:

1. New events appear at the top.
2. Events include actor, action, target type, target ID, detail, and timestamp.
3. Seeded events make the system look active immediately.

## 11. Demo Walkthrough

Use this sequence for a polished end-to-end demonstration.

### 11.1 Opening

1. Open `http://localhost:5173/`.
2. Login as `OPS-NIGHT-4 / sentinel123`.
3. Explain that data is persisted in Dockerized PostgreSQL.
4. Show Dashboard counts and recent activity.

### 11.2 Investigate A Dense Case

1. Open `Cases`.
2. Search `warehouse`.
3. Select `CASE-2026-4102`.
4. Point out:
   - Critical priority.
   - Multiple linked subjects.
   - Evidence entries.
   - Relationship graph.
5. Drag graph nodes to show interactivity.

### 11.3 Show Cross-Case Subject Intelligence

1. Open `Subject Registry`.
2. Search `Prakash`.
3. Select `SBJ-1009`.
4. Show linked cases:
   - Warehouse transfer cluster.
   - Bonded shipment anomaly.
   - Scrap yard material diversion.
5. Explain reverse-link visibility.

### 11.4 Update A Live Assessment

1. Select `SBJ-1030`.
2. Change threat from `Unassessed` to `Guarded`.
3. Adjust risk scores.
4. Save.
5. Open Audit Trail and show `UpdateThreat`.

### 11.5 Create New Evidence

1. Return to `CASE-2026-4133`.
2. Add a `Field Report` evidence item.
3. Use source `Campus liaison callback`.
4. Use summary `Confirmed attendee list was informational only.`
5. Save.
6. Confirm evidence count and audit trail update.

### 11.6 Generate Report

1. Open `Reports`.
2. Generate a subject dossier for `SBJ-1030` or a case report for `CASE-2026-4133`.
3. Preview the report.
4. Open the report in a new tab.
5. Show that the report appears in persisted report history.

### 11.7 Persistence Proof

1. Refresh the browser.
2. Sign back in if needed.
3. Confirm the updated subject assessment, added evidence, and generated report remain visible.

## 12. Test Scenarios

### TS-01 Login Success

Steps:

1. Open app.
2. Enter `OPS-NIGHT-4`.
3. Enter `sentinel123`.
4. Submit.

Expected:

1. User enters dashboard.
2. Operator name is visible.
3. Audit Trail records `Login`.

### TS-02 Login Failure

Steps:

1. Enter `OPS-NIGHT-4`.
2. Enter an incorrect access key.
3. Submit.

Expected:

1. Access is denied.
2. Operational views remain unavailable.

### TS-03 Dashboard Seed Data

Steps:

1. Login.
2. Open Dashboard.

Expected:

1. Cases, subjects, elevated threats, and evidence counts are populated.
2. Feature coverage cards appear.

### TS-04 Case Search

Steps:

1. Open Cases.
2. Search `proxy`.

Expected:

1. `Proxy infrastructure renewal` appears.
2. Selecting it loads its detail and graph.

### TS-05 Category Filter

Steps:

1. Open Cases.
2. Filter by `Cyber Threat`.

Expected:

1. Cyber cases appear.
2. Non-cyber cases are hidden.

### TS-06 Case Creation

Steps:

1. Create a new case with valid title and summary.
2. Choose any valid category, priority, and status.

Expected:

1. New case is created.
2. Audit event is recorded.
3. Case persists after refresh.

### TS-07 Case Validation

Steps:

1. Attempt to create a case without title or summary.

Expected:

1. Validation message appears.
2. No case is created.

### TS-08 Subject Search

Steps:

1. Open Subject Registry.
2. Search `Klang`.

Expected:

1. Matching subjects appear.
2. Selecting a subject shows profile and linked cases.

### TS-09 Subject Registration

Steps:

1. Register a new subject with identity and national ID.
2. Submit.

Expected:

1. New subject appears.
2. Audit event is recorded.
3. Subject persists in PostgreSQL.

### TS-10 Threat Update

Steps:

1. Select a subject.
2. Change threat level and risk indicators.
3. Save.

Expected:

1. Subject assessment changes.
2. Graph/report values reflect updated threat.
3. Audit event is recorded.

### TS-11 Link Subject To Case

Steps:

1. Select a case.
2. Link an unlinked subject with a role.

Expected:

1. Case detail shows the new subject link.
2. Subject reverse case list includes the case.
3. Audit event is recorded.

### TS-12 Duplicate Subject Link

Steps:

1. Try linking the same subject to the same case again.

Expected:

1. API returns conflict.
2. UI shows an error.
3. No duplicate link appears.

### TS-13 Add Evidence

Steps:

1. Select a case.
2. Add valid evidence source and summary.

Expected:

1. Evidence appears on the case.
2. Evidence count increases.
3. Graph includes the evidence node.
4. Audit event is recorded.

### TS-14 Case Report

Steps:

1. Generate a case report.
2. Preview it.

Expected:

1. Report includes case, linked subjects, evidence, and notes.
2. Report is persisted.
3. Audit event is recorded.

### TS-15 Subject Dossier

Steps:

1. Generate a subject dossier.
2. Preview it.

Expected:

1. Dossier includes threat, risk, bioprofile, linked cases, and analyst note.
2. Report is persisted.
3. Audit event is recorded.

### TS-16 Logout

Steps:

1. Click Sign out.

Expected:

1. User returns to login screen.
2. Session token is cleared.
3. Audit event is recorded.

## 13. Known MVP Limits

1. Demo credentials are for local demonstration only.
2. RBAC roles are present as operator metadata but do not yet restrict individual actions.
3. Audit rows are persistent but not yet immutable or tamper-evident.
4. Evidence is metadata-only; file vault storage is future scope.
5. Search is in-memory on returned workspace state.
6. Report export uses browser capabilities rather than a controlled PDF rendering service.

## 14. Resetting The Demo

To reset data back to the seeded live workspace:

```bash
npm run db:seed
```

To stop containers:

```bash
npm run docker:down
```
