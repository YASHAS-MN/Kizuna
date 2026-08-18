interface Member {
  name: string
  role: string
}

interface Team {
  id: string
  name: string
  project: string
  members: Member[]
  skills: string[]
}

export default function TeamsPage() {
  const mockTeams: Team[] = [
    {
      id: 't1',
      name: 'Team Alpha',
      project: 'Kizuna Platform Foundation',
      members: [
        { name: 'Alice Watson', role: 'Lead Frontend Developer' },
        { name: 'Bob Jenkins', role: 'UI Designer' },
        { name: 'Charlie Kim', role: 'QA Tester' },
      ],
      skills: ['React', 'TypeScript', 'CSS Grid', 'Figma'],
    },
    {
      id: 't2',
      name: 'Team Beta',
      project: 'AI-Powered Resume Analyzer',
      members: [
        { name: 'David Smith', role: 'Machine Learning Lead' },
        { name: 'Elena Rostova', role: 'Full Stack Engineer' },
      ],
      skills: ['Python', 'FastAPI', 'React', 'OpenAI API'],
    },
    {
      id: 't3',
      name: 'Team Gamma',
      project: 'Campus Event Coordination Hub',
      members: [
        { name: 'Gavin O\'Connor', role: 'Project Manager' },
        { name: 'Hana Tanaka', role: 'Frontend Engineer' },
        { name: 'Ian Wright', role: 'Backend Engineer' },
      ],
      skills: ['Vue.js', 'Node.js', 'PostgreSQL', 'Tailwind'],
    }
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Team Builder</h1>
        <p className="page-subtitle">Form collaborations, match skillset profiles, and scale resources.</p>
      </div>

      <div className="teams-grid">
        {mockTeams.map((team) => (
          <div key={team.id} className="team-card">
            <div className="team-header">
              <div>
                <h3 className="team-title">{team.name}</h3>
                <p className="team-project">{team.project}</p>
              </div>
            </div>

            <div className="team-members">
              {team.members.map((member, i) => (
                <div key={i} className="member-row">
                  <div className="member-identity">
                    <div className="member-avatar">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="member-name">{member.name}</span>
                  </div>
                  <span className="member-role">{member.role}</span>
                </div>
              ))}
            </div>

            <div className="team-skills">
              {team.skills.map((skill, i) => (
                <span key={i} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
