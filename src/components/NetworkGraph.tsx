import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation } from 'd3-force'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { CaseRecord, EvidenceItem, SubjectProfile } from '../types'

type GraphNode = {
  id: string
  label: string
  kind: 'case' | 'subject' | 'evidence'
  color: string
  size: number
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

type GraphLink = {
  source: string | GraphNode
  target: string | GraphNode
}

const threatColor: Record<string, string> = {
  Unassessed: '#6f7c98',
  Negligible: '#6bc6ff',
  Guarded: '#37d17c',
  Elevated: '#f1b94c',
  Severe: '#f2744a',
  Critical: '#ef445b',
}

export function NetworkGraph({
  caseRecord,
  subjects,
  evidence,
  onSelectSubject,
}: {
  caseRecord: CaseRecord
  subjects: SubjectProfile[]
  evidence: EvidenceItem[]
  onSelectSubject: (subjectId: string) => void
}) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const draggingId = useRef<string | null>(null)
  const nodesRef = useRef<GraphNode[]>([])

  const base = useMemo(() => {
    const caseNode: GraphNode = {
      id: caseRecord.id,
      label: caseRecord.title,
      kind: 'case',
      color: '#17d0b4',
      size: 28,
    }

    const subjectNodes = subjects.map<GraphNode>((subject) => ({
      id: subject.id,
      label: subject.alias || subject.name,
      kind: 'subject',
      color: threatColor[subject.threatLevel],
      size: 18,
    }))

    const evidenceNodes = evidence.map<GraphNode>((item) => ({
      id: item.id,
      label: item.type,
      kind: 'evidence',
      color: '#f6c45a',
      size: 14,
    }))

    const links: GraphLink[] = [
      ...subjectNodes.map((node) => ({ source: caseRecord.id, target: node.id })),
      ...evidenceNodes.map((node) => ({ source: caseRecord.id, target: node.id })),
    ]

    return { nodes: [caseNode, ...subjectNodes, ...evidenceNodes], links }
  }, [caseRecord, evidence, subjects])

  const [nodes, setNodes] = useState<GraphNode[]>(base.nodes)

  useEffect(() => {
    const width = 620
    const height = 360
    const simulationNodes = base.nodes.map((node) => ({ ...node }))
    const simulationLinks = base.links.map((link) => ({ ...link }))

    nodesRef.current = simulationNodes

    const simulation = forceSimulation(simulationNodes)
      .force('link', forceLink<GraphNode, GraphLink>(simulationLinks).id((node) => node.id).distance(90))
      .force('charge', forceManyBody().strength(-190))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collision', forceCollide<GraphNode>().radius((node: GraphNode) => node.size + 10))

    simulation.on('tick', () => {
      setNodes(simulationNodes.map((node) => ({ ...node })))
    })

    return () => {
      simulation.stop()
    }
  }, [base])

  const handleMove = (clientX: number, clientY: number) => {
    if (!draggingId.current || !svgRef.current) {
      return
    }

    const rect = svgRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    nodesRef.current = nodesRef.current.map((node) =>
      node.id === draggingId.current ? { ...node, x, y, fx: x, fy: y } : node,
    )
    setNodes(nodesRef.current.map((node) => ({ ...node })))
  }

  const links = base.links.map((link) => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id
    const targetId = typeof link.target === 'string' ? link.target : link.target.id
    const source = nodes.find((node) => node.id === sourceId)
    const target = nodes.find((node) => node.id === targetId)
    return { source, target, key: `${sourceId}-${targetId}` }
  })

  return (
    <div className="graph-panel">
      <div className="section-header compact">
        <div>
          <h3>Relationship network</h3>
          <p>Case at centre, subjects in threat colours, evidence in amber.</p>
        </div>
        <span className="badge subtle">Drag nodes to inspect clusters</span>
      </div>
      <svg
        ref={svgRef}
        className="network-graph"
        viewBox="0 0 620 360"
        onMouseMove={(event) => handleMove(event.clientX, event.clientY)}
        onMouseUp={() => {
          draggingId.current = null
          nodesRef.current = nodesRef.current.map((node) => ({ ...node, fx: null, fy: null }))
        }}
        onMouseLeave={() => {
          draggingId.current = null
          nodesRef.current = nodesRef.current.map((node) => ({ ...node, fx: null, fy: null }))
        }}
      >
        <rect x="0" y="0" width="620" height="360" rx="22" className="graph-bg" />
        {links.map(
          ({ source, target, key }) =>
            source &&
            target && (
              <line
                key={key}
                x1={source.x ?? 0}
                y1={source.y ?? 0}
                x2={target.x ?? 0}
                y2={target.y ?? 0}
                className="graph-link"
              />
            ),
        )}
        {nodes.map((node) => (
          <g
            key={node.id}
            transform={`translate(${node.x ?? 0} ${node.y ?? 0})`}
            className={`graph-node ${node.kind}`}
            onMouseDown={(event) => {
              draggingId.current = node.id
              handleMove(event.clientX, event.clientY)
            }}
            onClick={() => {
              if (node.kind === 'subject') {
                onSelectSubject(node.id)
              }
            }}
          >
            {node.kind === 'evidence' ? (
              <rect x={-node.size / 1.4} y={-node.size / 1.4} width={node.size} height={node.size} fill={node.color} rx="4" />
            ) : (
              <circle r={node.size} fill={node.color} />
            )}
            <text y={node.size + 16} textAnchor="middle">
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}