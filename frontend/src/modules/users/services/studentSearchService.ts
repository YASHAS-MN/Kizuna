import type { StudentPublicProfile } from '../types/student.types'

const MOCK_STUDENTS: StudentPublicProfile[] = [
  {
    id: 's1',
    name: 'Alice Rao',
    usn: '1RV23CS001',
    email: 'alice.rao@kizuna.edu',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    skills: ['React', 'TypeScript', 'CSS Grid', 'UI Systems'],
    bio: 'Passionate about frontend architecture and design systems. Looking for ML/Backend collaborators.',
    avatarInitials: 'AR'
  },
  {
    id: 's2',
    name: 'Bob Jenkins',
    usn: '1RV23CS002',
    email: 'bob.j@kizuna.edu',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    skills: ['Figma', 'UI/UX Design', 'Tailwind CSS', 'Prototyping'],
    bio: 'Product designer focusing on accessible user interfaces and interactive web app experiences.',
    avatarInitials: 'BJ'
  },
  {
    id: 's3',
    name: 'Charlie Kim',
    usn: '1RV23IS015',
    email: 'charlie.k@kizuna.edu',
    department: 'Information Science & Engineering',
    year: '3rd Year',
    skills: ['QA Testing', 'Jest', 'Cypress', 'CI/CD Pipelines'],
    bio: 'Focused on build automation, end-to-end testing, and continuous integration workflows.',
    avatarInitials: 'CK'
  },
  {
    id: 's4',
    name: 'David Smith',
    usn: '1RV23EC042',
    email: 'david.s@kizuna.edu',
    department: 'Electronics & Communication',
    year: '4th Year',
    skills: ['Machine Learning', 'Python', 'FastAPI', 'PyTorch'],
    bio: 'AI researcher working on natural language parsing and automated resume extraction tools.',
    avatarInitials: 'DS'
  },
  {
    id: 's5',
    name: 'Elena Rostova',
    usn: '1RV23CS088',
    email: 'elena.r@kizuna.edu',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    skills: ['Full Stack', 'Node.js', 'PostgreSQL', 'Docker'],
    bio: 'Backend developer specializing in Express APIs, database schemas, and microservice architectures.',
    avatarInitials: 'ER'
  },
  {
    id: 's6',
    name: 'Farhan Akhtar',
    usn: '1RV23CS105',
    email: 'farhan.a@kizuna.edu',
    department: 'Computer Science & Engineering',
    year: '2nd Year',
    skills: ['Go', 'Microservices', 'Kubernetes', 'gRPC'],
    bio: 'Systems programming enthusiast building cloud-native infrastructure for student hackathon projects.',
    avatarInitials: 'FA'
  }
]

/**
 * Replaceable Service Boundary for Student Discovery & Search.
 * NOTE: This is currently backed by a mock repository. In a future slice,
 * this will issue an HTTP request to GET /api/students/search?q=...
 */
export const studentSearchService = {
  async search(query: string): Promise<StudentPublicProfile[]> {
    // Simulate slight network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const cleanQuery = query.trim().toLowerCase()
    if (!cleanQuery) {
      return MOCK_STUDENTS
    }

    return MOCK_STUDENTS.filter(
      (student) =>
        student.name.toLowerCase().includes(cleanQuery) ||
        student.usn.toLowerCase().includes(cleanQuery) ||
        student.department.toLowerCase().includes(cleanQuery) ||
        student.skills.some((skill) => skill.toLowerCase().includes(cleanQuery))
    )
  },

  async getById(id: string): Promise<StudentPublicProfile | null> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    const student = MOCK_STUDENTS.find((s) => s.id === id)
    return student ? { ...student } : null
  }
}
