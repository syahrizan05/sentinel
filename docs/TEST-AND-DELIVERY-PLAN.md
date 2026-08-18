# Test And Delivery Plan

## 1. Delivery Approach

The repository implementation follows a phased delivery model.

1. Documentation baseline.
2. MVP development for the case-management console.
3. Build validation and manual scenario verification.
4. Future hardening for SAT, UAT, FAT, and production deployment.

## 2. MVP Verification Checklist

1. Login gate blocks access until operator credentials are entered and accepted by the API.
2. Case creation generates a unique ID and updates dashboard counts.
3. Existing subjects can be linked to a case with a selected role.
4. A subject can be registered with bioprofile and appearance attributes.
5. Threat level changes update lists, details, and graph visualization.
6. Evidence items can be added to cases.
7. Case and subject reports can be generated and printed.
8. Audit history reflects the performed actions.
9. State persists across page reloads through PostgreSQL.

## 3. Delivery Test Stages

1. SIT: module interaction, local data integrity, report generation, persistence.
2. SAT: environment, configuration, and installation validation in the target infrastructure.
3. UAT: operator, analyst, and supervisor workflow verification.
4. FAT: formal acceptance against approved scope and evidence.

## 4. Exit Criteria For MVP

1. Project builds successfully.
2. Core workflows operate without runtime errors in the browser.
3. Documentation and implementation remain traceable to requirements.

## 5. Next Delivery Items

1. Add stronger RBAC permissions and immutable audit/event services.
2. Add RBAC and immutable audit/event services.
3. Externalize enrichment, search, and evidence-vault functions.
4. Produce formal Gantt, environment architecture, and security test artifacts for go-live planning.
