# SENTINEL Case Management Console MVP

This repository contains a full-stack lite MVP for a standalone case management and intelligence console focused on case handling, subject profiling, evidence linkage, reporting, and relationship analysis.

The delivered MVP covers:

1. Operator login gate.
2. Case registration, tracking, filtering, and dashboard summaries.
3. Subject registry with threat profiling and reverse case links.
4. Evidence linkage and local audit trail.
5. Relationship graph for case, subject, and evidence context.
6. Report generation for case reports and subject dossiers.
7. Subject registration with bioprofile capture and a stylized 3D appearance preview.

## Documentation

Project documentation lives in `docs/`:

1. `BUSINESS-REQUIREMENTS-SPECIFICATION.md`
2. `FUNCTIONAL-REQUIREMENTS-SPECIFICATION.md`
3. `SOLUTION-ARCHITECTURE.md`
4. `TECHNICAL-DESIGN.md`
5. `DEVELOPMENT-GUIDE.md`
6. `TECHNOLOGY-STACK.md`
7. `PRODUCTION-SPECIFICATION.md`
8. `DATA-DICTIONARY.md`
9. `TEST-AND-DELIVERY-PLAN.md`
10. `USER-MANUAL.md`

The document set is derived from the original case-management concept and its later feature expansions:

1. The original SENTINEL-style case-management concept prompt.
2. Follow-up feature expansions for reporting and subject registration.

## Run The Project

```bash
npm install
npm run prisma:generate
npm run dev:full
```

The full development command expects PostgreSQL to be available through `DATABASE_URL`. To use the Dockerized database:

```bash
docker compose up -d postgres adminer
npm run db:deploy
npm run db:seed
npm run dev:full
```

The API runs on `http://localhost:4310`, and Vite proxies `/api` to the local server. To run everything in Docker, use `npm run docker:up`.

## Demo Access

| Role | Username | Demo Password |
| --- | --- | --- |
| Supervisor | `OPS-NIGHT-4` | `sentinel123` |
| Analyst | `OPS-CY-1` | `cywatch` |
| Analyst | `OPS-CY-2` | `cywatch` |
| Operator | `OPS-HQ-3` | `opsready` |

Build for production:

```bash
npm run build
```

Production container startup expects migrations to be applied before the runtime API starts:

```bash
DATABASE_URL=postgresql://sentinel:change_me@localhost:5433/sentinel npm run db:deploy
```

## Current Architecture Position

Implemented directly in the app:

1. Case management workflow.
2. Prisma/PostgreSQL repository behavior for cases, subjects, evidence, reports, and audit events.
3. Operational dashboard.
4. Threat-aware reporting.
5. Dockerized PostgreSQL persistence through the Express API.

Prepared as future integrations:

1. External identity or subject feeds.
2. Dedicated search and indexing services.
3. Immutable audit services and evidence vault controls.
4. Evidence vault and file storage.
5. Advanced analytics and correlation services.

## Important MVP Notes

1. Data is currently synthetic and seeded into PostgreSQL with `npm run db:seed`.
2. Browser localStorage stores only the lightweight session token and operator session metadata.
3. Authentication uses hashed demo access keys and bearer sessions, but is not enterprise SSO/RBAC.
4. Evidence integrity, RBAC, immutable audit logging, and external system integrations require production implementation in later phases.
