# Development Guide

## 1. Purpose

This guide is for developers working on the SENTINEL Case Management Console MVP in this repository. It explains how to run the project, where the current code lives, how to extend it safely, and what constraints apply to the current MVP.

## 2. Local Setup

### Prerequisites

1. Node.js 20.x
2. npm 10.x or compatible

### Install

```bash
npm install
npm run prisma:generate
```

### Run In Development

Start PostgreSQL first. With Docker:

```bash
docker compose up -d postgres adminer
npm run db:deploy
npm run db:seed
```

Then run the API and web app:

```bash
npm run dev:full
```

This starts the Express API on `http://localhost:4310` and the Vite web application. Vite proxies `/api` requests to the local API. If the default Vite port is already in use, Vite will automatically move to another port.

To run the processes separately, start the API with:

```bash
npm run dev:server
```

Then start the web app with `npm run dev`, or point `VITE_API_BASE_URL` at another running API.

### Production Build Check

```bash
npm run build
```

This validates TypeScript, bundles the Express API into `server-dist/index.js`, and builds the Vite web assets.

## 3. Current Project Structure

```text
src/
  components/
    NetworkGraph.tsx
    ReportPreview.tsx
    SubjectReconstruction.tsx
  data/
    seed.ts
  App.tsx
  api.ts
  index.css
  main.tsx
  types.ts
server/
  index.ts
prisma/
  schema.prisma
  seed.ts
  migrations/
docker-compose.yml
docker-compose.prod.yml
server/Dockerfile
Dockerfile.web
docs/
  BUSINESS-REQUIREMENTS-SPECIFICATION.md
  DATA-DICTIONARY.md
  DEVELOPMENT-GUIDE.md
  FUNCTIONAL-REQUIREMENTS-SPECIFICATION.md
  SOLUTION-ARCHITECTURE.md
  TECHNICAL-DESIGN.md
  TECHNOLOGY-STACK.md
  TEST-AND-DELIVERY-PLAN.md
```

## 4. Code Responsibilities

### App Shell

- `src/App.tsx` currently owns the main application flow, screen switching, login gate behavior, API-backed state updates, and form handling.
- `src/api.ts` wraps the HTTP calls to the API.

### Domain Types

- `src/types.ts` contains the core domain model for cases, subjects, evidence, reports, audit events, and module coverage.

### Seed Data

- `src/data/seed.ts` contains initial synthetic records and lookup values such as categories, threat levels, roles, and evidence types. The Prisma seed script uses this to populate PostgreSQL.

### API And Database

- `server/index.ts` contains the Express API, hashed demo operator login, Prisma persistence, audit events, and report generation.
- `prisma/schema.prisma` defines the PostgreSQL schema.
- `prisma/seed.ts` seeds demo operators and synthetic case data.
- `npm run server:build` bundles the API for the production Docker image.

### Feature Components

- `src/components/NetworkGraph.tsx` renders the case-to-subject-to-evidence graph.
- `src/components/ReportPreview.tsx` handles report preview and export actions.
- `src/components/SubjectReconstruction.tsx` renders the stylized subject reconstruction preview.

### Styling

- `src/index.css` contains the full tactical UI styling for the MVP.

## 5. Development Workflow

1. Review the requirement or requested change.
2. Confirm whether the change belongs to current MVP scope or future integrated scope.
3. Update domain types first if the change affects data shape.
4. Update seed data if the workflow requires new defaults or sample records.
5. Update the API contract in `server/index.ts` and `src/api.ts` when persistence or mutations change.
6. Update feature UI and state handling.
7. Run `npm run build` before considering the change complete.
8. Update the relevant document in `docs/` if the capability or architecture changed.

## 6. Design Constraints For Contributors

1. Preserve the existing tactical intelligence-console visual direction.
2. Keep code changes modular even though the current MVP uses a mostly centralized `App.tsx`.
3. Do not introduce production secrets. Seeded demo access keys must remain clearly non-production.
4. Treat localStorage as a temporary session cache only. Domain data belongs in PostgreSQL.
5. Keep requirements traceable to the product scope and existing BRS/FRS documents.

## 7. Recommended Next Refactors

1. Extract state management from `App.tsx` into hooks or reducers.
2. Split each major view into its own screen component.
3. Move report-generation logic into a dedicated formatter module.
4. Extract API repository logic behind a clearer service boundary.
5. Introduce automated tests for domain logic and report generation.

## 8. Backend Integration Preparation

When the lite backend is replaced by production services, use these boundaries:

1. Authentication service for operator identity and RBAC.
2. Case repository API for case CRUD and status tracking.
3. Subject registry API for entity profiles and de-duplication.
4. Evidence service or vault for attachment storage and chain-of-custody enforcement.
5. Audit service for immutable event history.
6. Search and analytics services for retrieval and cross-case pattern detection.

## 9. MVP Limitations Developers Must Remember

1. Current authentication is demo access-key authentication with hashed credentials and database-backed bearer sessions.
2. Current audit trail is persisted in PostgreSQL but is not yet immutable or tamper-evident.
3. Current evidence handling is metadata only and not file-backed.
4. Current 3D reconstruction is a stylized visual approximation.
5. Current search is in-memory and not enterprise scale.
