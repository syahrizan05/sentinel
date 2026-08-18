# Functional Requirements Specification

## 1. Purpose

This document defines the functional requirements for the SENTINEL Case Management Console MVP and maps the current delivery to the original case-management brief.

## 2. Functional Modules

### FR-01 Authentication Gate

- The system shall require an operator identifier and access key before operational access.
- The system shall carry the operator identity into the session context.
- The system shall allow sign-out and return to the login page.

### FR-02 Case Management Core

- The system shall create a case with unique ID, title, category, priority, status, owner, and summary.
- The system shall support case search, filtering, and selection.
- The system shall show case ownership, timestamps, counts, and recent changes.
- The system shall record operational audit events for case activity.

### FR-03 Subject Registry

- The system shall store identified subjects with profile data.
- The system shall support search by name, alias, identifier, and location.
- The system shall show all cases linked to a selected subject.

### FR-04 Threat Profiling

- The system shall assign a threat tier to each subject.
- The system shall display risk indicators for financial, network, and mobility dimensions.
- Threat tier changes shall propagate to lists, case views, graph nodes, and reports.

### FR-05 Subject Registration And Bioprofile

- The system shall register a new subject with identity and bioprofile fields.
- Bioprofile fields shall include height, weight, body type, foot size, hobbies, and medical conditions.
- If no photo is available, the operator shall be able to define appearance traits including sex, face concept, hairstyle, skin tone, eye color, and facial hair.
- The system shall show a rotatable stylized 3D preview of the generated appearance.

### FR-06 Subject Linking

- The system shall allow an operator to link one or more subjects to a case.
- Each link shall store a role such as Primary Subject, Financier, Facilitator, Witness, Material Link, or Associate.

### FR-07 Evidence Management

- The system shall allow creation of evidence/material items per case.
- Evidence shall store a reference ID, type, source, summary, and chain-of-custody note.
- Evidence shall appear in the relationship view and report output.

### FR-08 Relationship Network

- The system shall display a graph of a case, its linked subjects, and its evidence items.
- The graph shall visually distinguish subjects and evidence.
- The graph shall support drag interaction and selection.

### FR-09 Reporting

- The system shall generate a case report and a subject dossier.
- Case reports shall include case ID, summary, particulars, linked subjects, threat view, evidence, and narrative notes.
- Subject dossiers shall include subject ID, threat tier, risk indicators, bioprofile, linked cases, and analyst note.
- Reports shall support preview, open in new tab, and browser print/export.

### FR-10 Operational Dashboard

- The system shall show counts for open cases, tracked subjects, high-threat subjects, and evidence volume.
- The system shall show recent case activity and threat distribution.
- The dashboard shall show feature coverage cards aligned to the core product scope.

### FR-11 Search And Retrieval

- The system shall provide quick client-side retrieval across cases and subjects.
- Future releases shall externalize this capability into a dedicated indexing and retrieval service.

### FR-12 Audit Trail

- The system shall record operator actions including login, case creation, subject registration, threat changes, evidence updates, and report generation.
- Audit entries shall be timestamped and attributed to the current operator.

## 3. Non-Functional Requirements

1. The MVP shall run as a responsive web application on desktop and mobile browsers.
2. The MVP shall preserve state between reloads through the PostgreSQL-backed API.
3. The codebase shall be modular enough to separate future integration services from presentation logic.
4. The system shall not contain hard-coded production credentials.
5. The user interface shall emphasize fast operational scanning and high-density information display.

## 4. Traceability To Product Scope

1. Case creation, tracking, dashboarding, and audit map to the core operator workflow.
2. Subject registry, threat profiling, and reverse case links map to the identity and intelligence workflow.
3. Evidence linkage, graph visualization, and reports map to the investigation and reporting workflow.
4. Search, production persistence, and enterprise-connected services remain future enhancements beyond the standalone MVP.
