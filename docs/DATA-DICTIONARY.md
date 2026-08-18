# Data Dictionary

## 1. CaseRecord

| Field | Type | Description |
| --- | --- | --- |
| id | string | Unique case identifier, format `CASE-YYYY-####` |
| title | string | Short case title |
| category | string | Operational case category |
| priority | string | Low, Medium, High, Critical |
| status | string | Intake, Active, Monitoring, Escalated, Closed |
| summary | string | Operator-entered synopsis |
| owner | string | Current operator or assigned handler |
| openedAt | string | ISO timestamp |
| lastUpdatedAt | string | ISO timestamp |
| subjectLinks | array | Linked subjects and their roles |
| evidenceIds | array | Linked evidence identifiers |
| notes | string | Analyst note |

## 2. SubjectProfile

| Field | Type | Description |
| --- | --- | --- |
| id | string | Unique subject ID, format `SBJ-####` |
| name | string | Primary subject name |
| alias | string | Known alias |
| nationalId | string | National or identity number |
| location | string | Current or primary location |
| occupation | string | Observed or known occupation |
| threatLevel | string | Unassessed, Negligible, Guarded, Elevated, Severe, Critical |
| risk | object | Financial, network, and mobility numeric indicators |
| bioProfile | object | Physical and medical descriptors |
| appearance | object | Appearance-builder attributes |
| analystNote | string | Operator analysis note |
| linkedCaseIds | array | Reverse-linked case IDs |

## 3. EvidenceItem

| Field | Type | Description |
| --- | --- | --- |
| id | string | Unique evidence reference |
| caseId | string | Parent case ID |
| type | string | Document, Imagery, Signal, Financial, Field Report |
| source | string | Source or origin reference |
| summary | string | Short description |
| custodyNote | string | Chain-of-custody or handling note |
| capturedAt | string | ISO timestamp |

## 4. AuditEvent

| Field | Type | Description |
| --- | --- | --- |
| id | string | Unique audit event identifier |
| actor | string | Operator ID |
| action | string | Action verb |
| targetType | string | Case, Subject, Evidence, Report, Session |
| targetId | string | Related entity ID |
| detail | string | Human-readable detail |
| createdAt | string | ISO timestamp |

## 5. ReportArtifact

| Field | Type | Description |
| --- | --- | --- |
| id | string | Generated report ID |
| kind | string | `case` or `subject` |
| targetId | string | Case or subject identifier |
| title | string | Display title |
| createdAt | string | ISO timestamp |
| html | string | Rendered report body |