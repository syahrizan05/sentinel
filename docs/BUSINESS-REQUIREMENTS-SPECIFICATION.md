# Business Requirements Specification

## 1. Document Control

- Project: SENTINEL Case Management Console
- Working solution name: SENTINEL
- Core product in this repository: Case Management Console MVP
- Date: 2026-08-18
- Source inputs:
  - Original case-management concept prompt
  - Feature expansion for reporting and subject reconstruction

## 2. Executive Summary

The platform is intended to support case handling, subject profiling, evidence management, relationship analysis, and operational reporting for investigative workflows. This repository therefore targets a phased delivery approach:

- Phase 1 in this codebase: case-management MVP with linked subject registry, threat profiling, evidence linkage, operator dashboard, reporting, audit trail, and Dockerized PostgreSQL persistence.
- Phase 2 onward: optional integration with external identity sources, search services, evidence vaults, and advanced analytics.

## 3. Business Problem

Current investigative workflows are fragmented across multiple records, sources, and operational touchpoints. This creates delays in triage, weak visibility into subject-to-case relationships, duplicated entities, inconsistent evidence handling, and limited decision support for management.

## 4. Business Objectives

1. Centralize case registration, updates, ownership, and status tracking.
2. Improve subject visibility across cases through linked profiles and relationship analysis.
3. Provide structured reporting and management dashboards.
4. Strengthen evidence handling, auditability, and operational traceability.
5. Create a modular foundation for future data enrichment, analytics, and repository integration.

## 5. Scope

### 5.1 In Scope For This MVP

1. Operator login gate.
2. Case registration, update, filtering, and status tracking.
3. Subject registry with threat profiling and linked-case visibility.
4. Evidence and material linking to case files.
5. Relationship visualization between cases, subjects, and evidence.
6. Dashboard with operational summary metrics.
7. Report generation for cases and subjects.
8. Subject registration with bioprofile and stylized 3D appearance preview.
9. Local audit trail and PostgreSQL-backed persistence.

### 5.2 In Future Integrated Scope

1. Secure intake gateway for external and internal feeds.
2. Entity resolution and de-duplication.
3. Search indexing and retrieval services.
4. Integrated storage, backup, and retention controls.
5. Context extraction and analytics discovery pipelines.
6. Content decoding and controlled evidence vault services.
7. Environment segregation, formal SAT/UAT/FAT, and production hardening.

## 6. Business Stakeholders

- Sponsor: product owner / investigative operations lead
- Primary users: operators, analysts, supervisors
- Supporting roles: system administrators, security assessors, project delivery team
- External stakeholders: approved system/data owners, implementation vendor, audit/compliance reviewers

## 7. Business Capabilities

1. Case intake and management.
2. Subject intelligence registration and profiling.
3. Cross-reference and relationship discovery.
4. Evidence handling and dossier preparation.
5. Performance and backlog monitoring.
6. Audit-ready operational reporting.

## 8. Business Rules

1. Every case must have a unique case identifier.
2. Every subject must have a unique subject identifier.
3. Only authenticated operators may access operational views.
4. Changes to case status, evidence, subject threat level, and generated reports must be logged.
5. Evidence must remain linked to a parent case and must preserve reference metadata.
6. Subject threat tiers must be standardized across the platform.
7. Reports must include identifiers, summaries, and traceable supporting detail.

## 9. Success Criteria

1. Operators can create and manage cases without re-entering related subjects repeatedly.
2. Users can navigate from a case to its subjects and from a subject back to all linked cases.
3. Supervisors can view operational counts, backlog indicators, and recent activity from one dashboard.
4. Case and subject reports can be generated in a print-ready form.
5. The MVP provides a credible functional baseline for a production case-intelligence platform.

## 10. Constraints And Assumptions

1. This repository currently delivers a full-stack MVP with PostgreSQL persistence instead of live enterprise integrations.
2. Production infrastructure and enterprise security controls are not fully provisioned in this repository.
3. Synthetic data is acceptable for initial development and demonstration.
4. Future deployment must remove any placeholder data and connect only to approved sources.

## 11. Risks

1. Scope creep from future platform ambitions into the MVP implementation.
2. Overpromising advanced analytics before source integrations exist.
3. Security, retention, and evidence-custody controls requiring stricter production enforcement beyond the current API.
4. Ambiguity between demonstration behavior and production readiness.

## 12. Recommended Delivery Strategy

1. Deliver the case-management MVP first.
2. Confirm workflows and data model with users.
3. Add integration services module by module behind stable domain contracts.
4. Introduce role-based access control, immutable audit logging, and evidence integrity services before go-live.
