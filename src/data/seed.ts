import type {
  AppState,
  AuditEvent,
  BioProfile,
  CaseCategory,
  CasePriority,
  CaseRecord,
  CaseStatus,
  EvidenceItem,
  FeatureCoverage,
  ReportArtifact,
  SubjectAppearance,
  SubjectProfile,
} from '../types'

export const caseCategories: CaseCategory[] = [
  'Counter-Intelligence',
  'Financial Crime',
  'Organised Crime',
  'Cyber Threat',
  'Influence Operation',
  'Person of Interest',
  'Public Order',
]

export const caseStatuses: CaseStatus[] = ['Intake', 'Active', 'Monitoring', 'Escalated', 'Closed']
export const casePriorities: CasePriority[] = ['Low', 'Medium', 'High', 'Critical']

export const subjectRoles = [
  'Primary Subject',
  'Financier',
  'Facilitator',
  'Witness',
  'Material Link',
  'Associate',
] as const

export const evidenceTypes = ['Document', 'Imagery', 'Signal', 'Financial', 'Field Report'] as const

export const threatLevels = [
  'Unassessed',
  'Negligible',
  'Guarded',
  'Elevated',
  'Severe',
  'Critical',
] as const

type SubjectSeed = Omit<SubjectProfile, 'linkedCaseIds'>

const appearance = (overrides: Partial<SubjectAppearance>): SubjectAppearance => ({
  mode: 'composite',
  sex: 'Male',
  faceConcept: 'Oval',
  hairstyle: 'Short',
  skinTone: '#b98e6b',
  hairColor: '#2d241d',
  eyeColor: '#7ac4e7',
  facialHair: 'None',
  ...overrides,
})

const bio = (overrides: Partial<BioProfile>): BioProfile => ({
  heightCm: 176,
  weightKg: 74,
  bodyType: 'Average',
  footSize: '42',
  hobbies: 'Night driving, gaming cafes, futsal',
  medicalConditions: 'None observed',
  ...overrides,
})

const subjectRows = [
  ['SBJ-1001', 'Faris Hadi', 'Rook', '900101-14-5512', 'Shah Alam', 'Freelance network installer', 'Severe', 74, 86, 58, 'Athletic', 'Drone racing, gym', 'Frequently appears near finance mule accounts and telecom device swaps.', 'Oval', 'Buzz', '#9d7150', 'Stubble', 'Male'],
  ['SBJ-1002', 'Nurin Sofia', 'Mira', '920909-10-1198', 'Petaling Jaya', 'Content strategist', 'Elevated', 48, 78, 41, 'Lean', 'Design forums, travel blogs', 'Linked to influence messaging clusters and coordinated burner accounts.', 'Heart', 'Long', '#d0a283', 'None', 'Female'],
  ['SBJ-1003', 'Daniel Raj', 'Ledger', '870414-08-5521', 'Johor Bahru', 'Logistics coordinator', 'Critical', 92, 81, 77, 'Heavy', 'Horse betting, modified cars', 'Strong cross-case financial overlap and movement between warehouse nodes.', 'Square', 'Short', '#8c6249', 'Goatee', 'Male'],
  ['SBJ-1004', 'Aqil Iman', 'Juniper', '950222-07-3112', 'Cyberjaya', 'Security researcher', 'Guarded', 25, 61, 19, 'Lean', 'CTF events, keyboard collecting', 'Technical capability present, operational intent remains unclear.', 'Oval', 'Medium', '#b88a64', 'None', 'Male'],
  ['SBJ-1005', 'Siti Wardah', 'Harbor', '910808-05-4211', 'Klang', 'Warehouse supervisor', 'Elevated', 67, 55, 70, 'Average', 'Fishing trips, karaoke', 'Likely facilitator for physical material transfers.', 'Oval', 'Bun', '#ae7f5c', 'None', 'Female'],
  ['SBJ-1006', 'Irfan Zaki', 'Pylon', '940606-06-7742', 'Ipoh', 'Field technician', 'Negligible', 18, 22, 35, 'Average', 'Fishing, classic motorcycles', 'Observed in peripheral activity only; currently low concern.', 'Oval', 'Ponytail', '#9e7256', 'Moustache', 'Male'],
  ['SBJ-1007', 'Marcus Tan', 'Switch', '881203-10-3319', 'Subang Jaya', 'Payment terminal reseller', 'Severe', 88, 76, 62, 'Athletic', 'Cycling, reseller forums', 'Repeated high-value terminal purchases.', 'Square', 'Short', '#a67655', 'Stubble', 'Male'],
  ['SBJ-1008', 'Leong Mei Yi', 'Glass', '930517-14-8022', 'George Town', 'Import documentation clerk', 'Guarded', 42, 49, 67, 'Lean', 'Marathon training, language clubs', 'Appears in shipment paperwork but not command activity.', 'Heart', 'Ponytail', '#c79268', 'None', 'Female'],
  ['SBJ-1009', 'Prakash Menon', 'Anchor', '850722-07-5421', 'Port Klang', 'Freight broker', 'Critical', 94, 83, 81, 'Heavy', 'Offshore fishing, private auctions', 'Central overlap across warehouse, port, and invoice cases.', 'Square', 'Short', '#7f5a43', 'Full Beard', 'Male'],
  ['SBJ-1010', 'Yasmin Qadir', 'Velvet', '970311-10-2180', 'Ampang', 'Social media buyer', 'Elevated', 54, 82, 38, 'Average', 'Beauty livestreams, cafe meetups', 'Manages paid amplification channels for influence clusters.', 'Oval', 'Long', '#b98162', 'None', 'Female'],
  ['SBJ-1011', 'Haziq Rahman', 'Kernel', '960808-06-4587', 'Bangi', 'Cloud support engineer', 'Severe', 39, 91, 44, 'Lean', 'Homelab building, CTF teams', 'Infrastructure leases overlap with credential replay attempts.', 'Long', 'Medium', '#a56f4f', 'Goatee', 'Male'],
  ['SBJ-1012', 'Amelia Khoo', 'Mint', '900414-01-7520', 'Kuching', 'Money services agent', 'Elevated', 78, 44, 56, 'Average', 'Cross-border markets, baking', 'Frequent remittance structuring below reporting thresholds.', 'Round', 'Bun', '#d2a37d', 'None', 'Female'],
  ['SBJ-1013', 'Ridzuan Salleh', 'Spoke', '840930-03-6182', 'Kota Bharu', 'Motorcycle courier', 'Guarded', 33, 58, 89, 'Lean', 'Long-distance riding, futsal', 'High mobility courier profile with limited financial signal.', 'Oval', 'Buzz', '#9a684b', 'Moustache', 'Male'],
  ['SBJ-1014', 'Elaine Chong', 'Ledgerline', '890625-10-4428', 'Cheras', 'Bookkeeper', 'Severe', 86, 71, 29, 'Average', 'Temple committee, accounting forums', 'Maintains invoices linked to shell-company payment flows.', 'Heart', 'Medium', '#c08d67', 'None', 'Female'],
  ['SBJ-1015', 'Naveen Arul', 'Static', '950205-08-1103', 'Seremban', 'Radio technician', 'Elevated', 37, 73, 64, 'Athletic', 'Amateur radio, hiking', 'Device signal timing overlaps with transfer windows.', 'Oval', 'Short', '#8d6048', 'Stubble', 'Male'],
  ['SBJ-1016', 'Hanis Farhana', 'Muse', '980919-14-3301', 'Kuala Lumpur', 'Event coordinator', 'Guarded', 44, 69, 57, 'Lean', 'Gallery openings, public forums', 'Recruits venue contacts and manages public-order logistics.', 'Heart', 'Long', '#c99672', 'None', 'Female'],
  ['SBJ-1017', 'Kamal Iskandar', 'Gate', '820117-05-8017', 'Melaka', 'Private security supervisor', 'Severe', 61, 77, 69, 'Heavy', 'Bodybuilding, convoy groups', 'Coordinates access control around restricted-loading sites.', 'Square', 'Buzz', '#93654d', 'Full Beard', 'Male'],
  ['SBJ-1018', 'Rina Suresh', 'Patch', '940428-07-2234', 'Puchong', 'Device repair owner', 'Elevated', 58, 84, 35, 'Average', 'Vintage phones, board games', 'SIM swaps and device repairs cluster around compromise events.', 'Round', 'Medium', '#b47f5c', 'None', 'Female'],
  ['SBJ-1019', 'Omar Zain', 'Drift', '910120-03-4112', 'Kuantan', 'Tow truck operator', 'Guarded', 28, 46, 78, 'Athletic', 'Car meets, night drives', 'Vehicle recovery records place him near two monitored sites.', 'Long', 'Ponytail', '#9f7054', 'Goatee', 'Male'],
  ['SBJ-1020', 'Talia Ng', 'Northstar', '990707-10-6071', 'Damansara', 'Marketing analyst', 'Negligible', 21, 36, 22, 'Lean', 'Data visualization, trail running', 'Peripheral open-source contact with no operational role observed.', 'Oval', 'Short', '#d4a982', 'None', 'Female'],
  ['SBJ-1021', 'Syed Ammar', 'Courier-12', '870902-14-7714', 'Putrajaya', 'Parcel route planner', 'Elevated', 64, 59, 83, 'Average', 'Map archives, badminton', 'Route planning resembles handoff timing used by transfer cells.', 'Square', 'Short', '#a77955', 'Moustache', 'Male'],
  ['SBJ-1022', 'Vivian Lau', 'Quill', '920302-13-3450', 'Ipoh', 'Freelance translator', 'Guarded', 31, 66, 42, 'Lean', 'Language exchange, podcasts', 'Translates coordinated narratives for three online clusters.', 'Heart', 'Long', '#cf9b74', 'None', 'Female'],
  ['SBJ-1023', 'Badrul Hafiz', 'Oxide', '860515-06-9044', 'Rawang', 'Scrap yard partner', 'Critical', 81, 88, 74, 'Heavy', 'Metal auctions, off-road driving', 'Repeated contact with material storage sites and cash handlers.', 'Square', 'Bald', '#7d533e', 'Full Beard', 'Male'],
  ['SBJ-1024', 'Janet Lim', 'Canvas', '901212-01-2894', 'Kota Kinabalu', 'Print shop owner', 'Elevated', 52, 64, 46, 'Average', 'Photography, hiking clubs', 'Print orders and courier labels overlap with public-order leaflets.', 'Round', 'Bun', '#c18f6c', 'None', 'Female'],
  ['SBJ-1025', 'Danish Amar', 'Proxy', '970616-10-4519', 'Cyberjaya', 'Hosting reseller', 'Severe', 47, 93, 31, 'Lean', 'Cloud credits, chess', 'Controls VPS accounts used by suspicious automation bursts.', 'Long', 'Medium', '#a87454', 'Stubble', 'Male'],
  ['SBJ-1026', 'Maya Krishnan', 'Bloom', '960323-08-1009', 'Brickfields', 'NGO volunteer', 'Guarded', 24, 55, 33, 'Average', 'Community kitchens, poetry', 'Witness and community contact; no current threat escalation.', 'Oval', 'Long', '#9c6c50', 'None', 'Female'],
  ['SBJ-1027', 'Adrian Wong', 'Beacon', '880118-10-7192', 'Kajang', 'Telecom contractor', 'Severe', 63, 87, 52, 'Athletic', 'Drone repair, climbing', 'Cell-site access and device swap records require active review.', 'Square', 'Buzz', '#b07b58', 'Stubble', 'Male'],
  ['SBJ-1028', 'Noor Aisyah', 'Lattice', '940812-14-2391', 'Klang', 'Customs runner', 'Elevated', 69, 62, 76, 'Lean', 'Night markets, swimming', 'Customs document handling overlaps with bonded warehouse movement.', 'Heart', 'Ponytail', '#b88764', 'None', 'Female'],
  ['SBJ-1029', 'Gavin Pereira', 'Marker', '830731-05-1990', 'Petaling Jaya', 'Compliance consultant', 'Critical', 89, 75, 45, 'Average', 'Golf, professional associations', 'Appears to sanitize company filings tied to payment mule network.', 'Oval', 'Short', '#94664c', 'Goatee', 'Male'],
  ['SBJ-1030', 'Aina Maisarah', 'Echo', '990110-06-7860', 'Shah Alam', 'Campus society treasurer', 'Unassessed', 16, 31, 24, 'Lean', 'Debate club, volunteer drives', 'Newly registered contact pending corroboration.', 'Round', 'Medium', '#c79670', 'None', 'Female'],
] as const

const subjectSeeds: SubjectSeed[] = subjectRows.map((item) => ({
  id: item[0],
  name: item[1],
  alias: item[2],
  nationalId: item[3],
  location: item[4],
  occupation: item[5],
  threatLevel: item[6] as SubjectProfile['threatLevel'],
  risk: { financial: Number(item[7]), network: Number(item[8]), mobility: Number(item[9]) },
  bioProfile: bio({ bodyType: item[10] as BioProfile['bodyType'], hobbies: item[11] }),
  appearance: appearance({
    faceConcept: item[13] as SubjectAppearance['faceConcept'],
    hairstyle: item[14] as SubjectAppearance['hairstyle'],
    skinTone: item[15],
    facialHair: item[16] as SubjectAppearance['facialHair'],
    sex: item[17] as SubjectAppearance['sex'],
  }),
  analystNote: item[12],
}))

const caseBlueprints = [
  ['CASE-2026-4102', 'Warehouse transfer cluster', 'Organised Crime', 'Critical', 'Active', 'Material flows and courier patterns suggest a coordinated logistics support cell.', 'OPS-NIGHT-4', '2026-08-01T09:00:00.000Z', '2026-08-18T12:10:00.000Z', 'Escalation recommended due to repeated cross-border logistics indicators.', [['SBJ-1001', 'Primary Subject'], ['SBJ-1003', 'Financier'], ['SBJ-1005', 'Facilitator'], ['SBJ-1009', 'Associate'], ['SBJ-1017', 'Material Link']]],
  ['CASE-2026-4107', 'Coordinated influence messaging', 'Influence Operation', 'High', 'Monitoring', 'Multiple coordinated digital accounts pushing aligned narratives on fixed intervals.', 'OPS-CY-2', '2026-08-05T10:30:00.000Z', '2026-08-17T06:50:00.000Z', 'Correlate further against content clusters and posting origin timing.', [['SBJ-1001', 'Associate'], ['SBJ-1002', 'Primary Subject'], ['SBJ-1010', 'Facilitator'], ['SBJ-1022', 'Material Link']]],
  ['CASE-2026-4111', 'Unauthorized access tooling lead', 'Cyber Threat', 'Medium', 'Intake', 'Recovered scripts and infrastructure notes indicate an early-stage capability build.', 'OPS-CY-1', '2026-08-09T14:15:00.000Z', '2026-08-16T18:00:00.000Z', 'Await context extraction from device metadata.', [['SBJ-1004', 'Primary Subject'], ['SBJ-1011', 'Associate'], ['SBJ-1025', 'Material Link']]],
  ['CASE-2026-4118', 'Portside person-of-interest watch', 'Person of Interest', 'Low', 'Active', 'Travel and contact patterns merit continued observation without escalation yet.', 'OPS-HQ-3', '2026-08-11T07:20:00.000Z', '2026-08-18T08:25:00.000Z', 'No enforcement trigger currently; maintain monitoring cadence.', [['SBJ-1005', 'Associate'], ['SBJ-1006', 'Witness'], ['SBJ-1019', 'Witness']]],
  ['CASE-2026-4124', 'Terminal skimming procurement', 'Financial Crime', 'Critical', 'Escalated', 'Point-of-sale terminal purchases and firmware changes suggest organized payment compromise preparation.', 'OPS-NIGHT-4', '2026-08-12T02:40:00.000Z', '2026-08-19T00:45:00.000Z', 'Coordinate with acquiring-bank fraud desk before any field action.', [['SBJ-1007', 'Primary Subject'], ['SBJ-1014', 'Financier'], ['SBJ-1029', 'Facilitator']]],
  ['CASE-2026-4125', 'Bonded shipment anomaly', 'Counter-Intelligence', 'High', 'Active', 'Repeated bonded cargo amendments align with movement of restricted industrial components.', 'OPS-HQ-3', '2026-08-13T04:20:00.000Z', '2026-08-18T23:18:00.000Z', 'Customs liaison requested document hold on next amendment cycle.', [['SBJ-1008', 'Material Link'], ['SBJ-1009', 'Primary Subject'], ['SBJ-1028', 'Facilitator']]],
  ['CASE-2026-4126', 'SIM swap facilitation ring', 'Cyber Threat', 'High', 'Active', 'Device repair, telecom access, and account resets form a repeatable compromise pathway.', 'OPS-CY-1', '2026-08-14T06:10:00.000Z', '2026-08-18T21:30:00.000Z', 'Preserve telecom access logs for last seven reset windows.', [['SBJ-1018', 'Primary Subject'], ['SBJ-1027', 'Facilitator'], ['SBJ-1001', 'Associate']]],
  ['CASE-2026-4127', 'Public forum mobilization', 'Public Order', 'Medium', 'Monitoring', 'Venue bookings, leaflet print runs, and route messages point to a coordinated demonstration support group.', 'OPS-HQ-3', '2026-08-14T12:30:00.000Z', '2026-08-18T19:40:00.000Z', 'Monitor for route escalation language; community liaison remains primary channel.', [['SBJ-1016', 'Primary Subject'], ['SBJ-1024', 'Material Link'], ['SBJ-1026', 'Witness']]],
  ['CASE-2026-4128', 'Cash mule account burst', 'Financial Crime', 'Critical', 'Active', 'New accounts received rapid layered deposits connected to freight and print-shop entities.', 'OPS-NIGHT-4', '2026-08-15T01:05:00.000Z', '2026-08-18T17:12:00.000Z', 'Finance review cell recommends account-freeze packet if next burst repeats.', [['SBJ-1012', 'Primary Subject'], ['SBJ-1014', 'Financier'], ['SBJ-1029', 'Associate'], ['SBJ-1003', 'Associate']]],
  ['CASE-2026-4129', 'Courier timing corridor', 'Organised Crime', 'Medium', 'Active', 'Parcel routing, motorcycle courier traces, and vehicle recovery logs reveal repeated corridor timing.', 'OPS-HQ-3', '2026-08-15T08:50:00.000Z', '2026-08-18T16:44:00.000Z', 'Graph shows strongest bridge to warehouse transfer cluster through route planner.', [['SBJ-1013', 'Primary Subject'], ['SBJ-1021', 'Facilitator'], ['SBJ-1019', 'Material Link']]],
  ['CASE-2026-4130', 'Proxy infrastructure renewal', 'Cyber Threat', 'High', 'Escalated', 'Hosting renewals, proxy inventories, and automation windows indicate active infrastructure refresh.', 'OPS-CY-2', '2026-08-16T03:15:00.000Z', '2026-08-18T15:25:00.000Z', 'Escalated to cyber desk due to active credential replay indicators.', [['SBJ-1025', 'Primary Subject'], ['SBJ-1011', 'Associate'], ['SBJ-1018', 'Material Link']]],
  ['CASE-2026-4131', 'Scrap yard material diversion', 'Counter-Intelligence', 'Critical', 'Monitoring', 'High-grade scrap movement and buyer records suggest diversion of controlled industrial components.', 'OPS-NIGHT-4', '2026-08-16T13:25:00.000Z', '2026-08-18T13:22:00.000Z', 'Requires discreet validation before contacting yard owner.', [['SBJ-1023', 'Primary Subject'], ['SBJ-1009', 'Associate'], ['SBJ-1017', 'Facilitator']]],
  ['CASE-2026-4132', 'Leaflet and route coordination', 'Influence Operation', 'Medium', 'Active', 'Printed material distribution mirrors online narrative timing and planned public-route messaging.', 'OPS-CY-2', '2026-08-17T02:00:00.000Z', '2026-08-18T11:58:00.000Z', 'Compare print batches with channel scrape timing from CASE-2026-4107.', [['SBJ-1024', 'Primary Subject'], ['SBJ-1010', 'Associate'], ['SBJ-1022', 'Facilitator']]],
  ['CASE-2026-4133', 'Campus fundraising contact', 'Person of Interest', 'Low', 'Intake', 'New contact entered through donation-ledger references and social links to public forum organizers.', 'OPS-HQ-3', '2026-08-17T05:35:00.000Z', '2026-08-18T10:10:00.000Z', 'Low-risk intake case; use as training walkthrough for subject registration and assessment.', [['SBJ-1030', 'Primary Subject'], ['SBJ-1020', 'Witness'], ['SBJ-1026', 'Associate']]],
  ['CASE-2026-4134', 'Telecom access badge misuse', 'Cyber Threat', 'High', 'Active', 'Telecom badge entries and after-hours device swaps suggest credential misuse by a contractor group.', 'OPS-CY-1', '2026-08-17T09:45:00.000Z', '2026-08-18T09:42:00.000Z', 'Badge audit should be preserved before normal retention rotation.', [['SBJ-1027', 'Primary Subject'], ['SBJ-1015', 'Material Link'], ['SBJ-1018', 'Associate']]],
  ['CASE-2026-4135', 'Shell vendor compliance review', 'Financial Crime', 'High', 'Closed', 'Corporate filings and compliance memos resolved a subset of shell-vendor exposure, with residual links moved to active cases.', 'OPS-NIGHT-4', '2026-08-02T10:20:00.000Z', '2026-08-17T17:35:00.000Z', 'Closed after vendor exposure scoped; live risk transferred to CASE-2026-4128.', [['SBJ-1029', 'Primary Subject'], ['SBJ-1014', 'Associate'], ['SBJ-1012', 'Material Link']]],
  ['CASE-2026-4136', 'Route marshal standby list', 'Public Order', 'Low', 'Monitoring', 'A standby contact list suggests event-support roles but lacks escalation indicators.', 'OPS-HQ-3', '2026-08-18T02:10:00.000Z', '2026-08-18T08:40:00.000Z', 'Keep monitoring cadence light; do not over-collect community contacts.', [['SBJ-1016', 'Associate'], ['SBJ-1020', 'Witness'], ['SBJ-1030', 'Material Link']]],
  ['CASE-2026-4137', 'Warehouse invoice mirror', 'Financial Crime', 'Medium', 'Active', 'Invoice numbering mirrors the warehouse transfer cluster and may indicate cloned vendor paperwork.', 'OPS-NIGHT-4', '2026-08-18T04:15:00.000Z', '2026-08-18T07:55:00.000Z', 'Review against closed shell vendor file and active cash mule case.', [['SBJ-1005', 'Material Link'], ['SBJ-1014', 'Primary Subject'], ['SBJ-1029', 'Facilitator']]],
] as const

const evidenceTemplates = [
  ['Financial', 'Bank anomaly alert', 'Layered payments, settlement references, or prepaid instruments overlap with linked subject activity.', 'Imported from controlled finance review queue.'],
  ['Document', 'Operational document capture', 'Document metadata, invoice line, roster, or booking record supports the case narrative.', 'Original retained by source owner; working copy stored for case review.'],
  ['Signal', 'Channel and infrastructure extract', 'Time-correlated messages, access logs, or infrastructure records align with case windows.', 'Extract minimized to relevant identifiers and timestamps.'],
] as const

const cases: CaseRecord[] = caseBlueprints.map((item, caseIndex) => ({
  id: item[0],
  title: item[1],
  category: item[2] as CaseCategory,
  priority: item[3] as CasePriority,
  status: item[4] as CaseStatus,
  summary: item[5],
  owner: item[6],
  openedAt: item[7],
  lastUpdatedAt: item[8],
  notes: item[9],
  subjectLinks: item[10].map(([subjectId, role]) => ({ subjectId, role: role as CaseRecord['subjectLinks'][number]['role'] })),
  evidenceIds: evidenceTemplates.map((_, evidenceIndex) => `EVD-${String(7001 + caseIndex * evidenceTemplates.length + evidenceIndex).padStart(4, '0')}`),
}))

const evidence: EvidenceItem[] = cases.flatMap((caseRecord, caseIndex) =>
  evidenceTemplates.map(([type, source, summary, custodyNote], evidenceIndex) => ({
    id: caseRecord.evidenceIds[evidenceIndex],
    caseId: caseRecord.id,
    type,
    source,
    summary: `${summary} ${caseRecord.title}.`,
    custodyNote,
    capturedAt: new Date(new Date(caseRecord.lastUpdatedAt).getTime() - (evidenceIndex + 1) * 43 * 60 * 1000 - caseIndex * 7 * 60 * 1000).toISOString(),
  })),
)

const subjects: SubjectProfile[] = subjectSeeds.map((subject) => ({
  ...subject,
  linkedCaseIds: cases.filter((caseRecord) => caseRecord.subjectLinks.some((link) => link.subjectId === subject.id)).map((caseRecord) => caseRecord.id),
}))

const reports: ReportArtifact[] = [
  ['RPT-SEED-4102', 'case', 'CASE-2026-4102', 'Warehouse transfer cluster case report', '2026-08-18T12:25:00.000Z'],
  ['RPT-SEED-1003', 'subject', 'SBJ-1003', 'Daniel Raj subject dossier', '2026-08-18T12:40:00.000Z'],
  ['RPT-SEED-4128', 'case', 'CASE-2026-4128', 'Cash mule account burst case report', '2026-08-18T17:30:00.000Z'],
  ['RPT-SEED-4130', 'case', 'CASE-2026-4130', 'Proxy infrastructure renewal case report', '2026-08-18T18:10:00.000Z'],
].map(([id, kind, targetId, title, createdAt]) => ({
  id,
  kind: kind as ReportArtifact['kind'],
  targetId,
  title,
  createdAt,
  html: `<!DOCTYPE html><html><body><h1>${title}</h1><p>Seeded report artifact for demonstration, review, printing, and report history workflows.</p></body></html>`,
}))

const auditTrail: AuditEvent[] = [
  {
    id: 'EVT-9001',
    actor: 'system-seed',
    action: 'SeedLoaded',
    targetType: 'Session' as const,
    targetId: 'bootstrap',
    detail: 'Synthetic repository initialized for production-style walkthrough.',
    createdAt: '2026-08-18T00:00:00.000Z',
  },
  ...cases.flatMap((caseRecord, index) => [
    {
      id: `EVT-SEED-CREATE-${caseRecord.id}`,
      actor: caseRecord.owner,
      action: 'CreateCase',
      targetType: 'Case' as const,
      targetId: caseRecord.id,
      detail: `Created case ${caseRecord.title}.`,
      createdAt: caseRecord.openedAt,
    },
    {
      id: `EVT-SEED-UPDATE-${caseRecord.id}`,
      actor: index % 2 === 0 ? 'OPS-NIGHT-4' : 'OPS-CY-2',
      action: 'UpdateCase',
      targetType: 'Case' as const,
      targetId: caseRecord.id,
      detail: `Updated workflow notes and triage status for ${caseRecord.id}.`,
      createdAt: caseRecord.lastUpdatedAt,
    },
  ]),
  ...evidence.map((item, index) => ({
    id: `EVT-SEED-${item.id}`,
    actor: index % 3 === 0 ? 'OPS-CY-1' : index % 3 === 1 ? 'OPS-HQ-3' : 'OPS-NIGHT-4',
    action: 'AddEvidence',
    targetType: 'Evidence' as const,
    targetId: item.id,
    detail: `Added ${item.type} evidence to ${item.caseId}.`,
    createdAt: item.capturedAt,
  })),
  ...reports.map((report, index) => ({
    id: `EVT-SEED-${report.id}`,
    actor: index % 2 === 0 ? 'OPS-NIGHT-4' : 'OPS-CY-2',
    action: 'GenerateReport',
    targetType: 'Report' as const,
    targetId: report.id,
    detail: `Generated ${report.kind === 'case' ? 'case report' : 'subject dossier'} ${report.title}.`,
    createdAt: report.createdAt,
  })),
].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())

const modules: FeatureCoverage[] = [
  {
    name: 'Case repository',
    focus: 'Case creation and tracking',
    status: 'Implemented',
    note: 'Live-style repository, workflow updates, dashboard counts, and report-ready records are populated.',
  },
  {
    name: 'Subject registry',
    focus: 'Cross-case identity visibility',
    status: 'Implemented',
    note: 'Subjects can be profiled, linked to cases, and reviewed from either direction with realistic cross-links.',
  },
  {
    name: 'Threat profiling',
    focus: 'Risk and tier assessment',
    status: 'Implemented',
    note: 'Threat levels and risk indicators update across lists, profiles, graph, and reports.',
  },
  {
    name: 'Evidence tracking',
    focus: 'Material and evidence linkage',
    status: 'Implemented',
    note: 'Evidence items are attached to cases with source, summary, custody note, and timestamp metadata.',
  },
  {
    name: 'Relationship analysis',
    focus: 'Graph and cross-reference view',
    status: 'Implemented',
    note: 'The live graph shows case-to-subject-to-evidence relationships in one operational view.',
  },
  {
    name: 'Production persistence',
    focus: 'PostgreSQL-backed API',
    status: 'Implemented',
    note: 'Prisma migrations, Dockerized PostgreSQL, hashed demo operators, and database-backed sessions are active.',
  },
  {
    name: 'Advanced integrations',
    focus: 'External system connectivity',
    status: 'Planned',
    note: 'External identity feeds, search services, immutable audit, and evidence-vault controls remain later-phase work.',
  },
]

export function createInitialState(): AppState {
  return {
    cases,
    subjects,
    evidence,
    reports,
    modules,
    auditTrail,
  }
}
