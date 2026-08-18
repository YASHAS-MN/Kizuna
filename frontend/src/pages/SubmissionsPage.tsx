interface Submission {
  id: string
  milestone: string
  project: string
  submittedAt: string
  status: 'graded' | 'pending'
  score?: string
}

export default function SubmissionsPage() {
  const mockSubmissions: Submission[] = [
    {
      id: 's1',
      milestone: 'Milestone 1: Architecture Proposal',
      project: 'Kizuna Platform Foundation',
      submittedAt: '2026-08-15',
      status: 'graded',
      score: '95/100'
    },
    {
      id: 's2',
      milestone: 'Milestone 2: Design Prototype',
      project: 'AI-Powered Resume Analyzer',
      submittedAt: '2026-08-16',
      status: 'pending'
    },
    {
      id: 's3',
      milestone: 'Milestone 1: Architecture Proposal',
      project: 'Campus Event Coordination Hub',
      submittedAt: '2026-08-14',
      status: 'graded',
      score: '88/100'
    }
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Evaluation Hub</h1>
        <p className="page-subtitle">Submit deliverables and review grading outcomes.</p>
      </div>

      <div className="submissions-table-container">
        <table className="submissions-table">
          <thead>
            <tr>
              <th>Deliverable</th>
              <th>Project Group</th>
              <th>Date Submitted</th>
              <th>Status</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {mockSubmissions.map((sub) => (
              <tr key={sub.id}>
                <td className="submission-project">{sub.milestone}</td>
                <td>{sub.project}</td>
                <td className="submission-meta">{sub.submittedAt}</td>
                <td>
                  {sub.status === 'graded' ? (
                    <span className="badge badge-success">Graded</span>
                  ) : (
                    <span className="badge badge-warning">Pending Review</span>
                  )}
                </td>
                <td className="submission-score" style={{ color: sub.score ? 'var(--success)' : 'var(--text-muted)' }}>
                  {sub.score || '--'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
