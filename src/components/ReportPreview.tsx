import type { ReportArtifact } from '../types'

function openReportWindow(report: ReportArtifact) {
  const opened = window.open('', '_blank', 'noopener,noreferrer')
  if (!opened) {
    return
  }
  opened.document.write(report.html)
  opened.document.close()
}

function downloadReport(report: ReportArtifact) {
  const blob = new Blob([report.html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${report.targetId.toLowerCase()}-${report.kind}-report.html`
  link.click()
  URL.revokeObjectURL(url)
}

export function ReportPreview({
  report,
  onClose,
}: {
  report: ReportArtifact | null
  onClose: () => void
}) {
  if (!report) {
    return null
  }

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-card report-modal">
        <div className="modal-header">
          <div>
            <span className="eyebrow">Intelligence report</span>
            <h3>{report.title}</h3>
          </div>
          <div className="modal-actions">
            <button className="ghost-button" onClick={() => downloadReport(report)}>
              Download HTML
            </button>
            <button className="ghost-button" onClick={() => openReportWindow(report)}>
              Open in tab
            </button>
            <button className="ghost-button" onClick={() => window.print()}>
              Print
            </button>
            <button className="primary-button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
        <div className="report-frame" dangerouslySetInnerHTML={{ __html: report.html }} />
      </div>
    </div>
  )
}