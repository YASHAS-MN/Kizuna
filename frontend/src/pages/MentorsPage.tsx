interface Mentor {
  id: string
  name: string
  title: string
  bio: string
  expertise: string[]
  initials: string
}

export default function MentorsPage() {
  const mockMentors: Mentor[] = [
    {
      id: 'm1',
      name: 'Dr. Sarah Jenkins',
      title: 'Associate Professor, Computer Science',
      bio: 'Specializes in distributed systems, human-computer interaction, and cloud infrastructure architectures.',
      expertise: ['Cloud Architecture', 'React Architecture', 'System Scaling'],
      initials: 'SJ'
    },
    {
      id: 'm2',
      name: 'Marcus Chen',
      title: 'Senior UX Researcher at DesignLabs',
      bio: 'Industry mentor guiding students on design sprints, user testing methodologies, and prototyping.',
      expertise: ['UI/UX Design', 'User Research', 'Product Strategy'],
      initials: 'MC'
    },
    {
      id: 'm3',
      name: 'Prof. Alan Vance',
      title: 'Director of AI Research Initiative',
      bio: 'Guiding projects incorporating large language models, regression analysis, and neural networks.',
      expertise: ['Machine Learning', 'Python Backend', 'Vector Databases'],
      initials: 'AV'
    }
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Mentor Directory</h1>
        <p className="page-subtitle">Reach out to faculty and industry leaders for reviews.</p>
      </div>

      <div className="mentors-grid">
        {mockMentors.map((mentor) => (
          <div key={mentor.id} className="mentor-card">
            <div className="mentor-avatar-lg">{mentor.initials}</div>
            <h3 className="mentor-name">{mentor.name}</h3>
            <p className="mentor-title">{mentor.title}</p>
            <p className="mentor-bio">{mentor.bio}</p>
            <div className="mentor-expertise">
              {mentor.expertise.map((tag, i) => (
                <span key={i} className="skill-tag" style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}>
                  {tag}
                </span>
              ))}
            </div>
            <button className="btn btn-secondary" style={{ width: '100%', marginTop: 'auto' }}>
              Request Session
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
