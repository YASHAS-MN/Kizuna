import { useState, useEffect } from 'react'
import type { StudentPublicProfile } from '../types/student.types'
import { studentSearchService } from '../services/studentSearchService'
import StudentCard from './StudentCard'
import StudentProfileModal from './StudentProfileModal'

export default function StudentSearch() {
  const [query, setQuery] = useState('')
  const [students, setStudents] = useState<StudentPublicProfile[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentPublicProfile | null>(null)

  useEffect(() => {
    let isCurrent = true
    setIsSearching(true)

    const timer = setTimeout(() => {
      studentSearchService
        .search(query)
        .then((results) => {
          if (isCurrent) {
            setStudents(results)
            setIsSearching(false)
          }
        })
        .catch((err) => {
          if (isCurrent) {
            console.error('Student search error:', err)
            setIsSearching(false)
          }
        })
    }, 200)

    return () => {
      isCurrent = false
      clearTimeout(timer)
    }
  }, [query])

  return (
    <div>
      {/* Search Input Bar */}
      <div className="search-bar" style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search students by Name or USN (e.g. Alice, 1RV23CS001)..."
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="btn btn-secondary"
            style={{ padding: '0.75rem 1rem' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Loading Indicator */}
      {isSearching && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          Searching student records...
        </div>
      )}

      {/* Search Results Grid */}
      {!isSearching && (
        <div>
          {students.length > 0 ? (
            <div className="modules-grid" style={{ marginTop: 0 }}>
              {students.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onSelect={(s) => setSelectedStudent(s)}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 1.5rem',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.75rem',
                color: 'var(--text-muted)'
              }}
            >
              <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                No matching students found
              </p>
              <p style={{ fontSize: '0.9rem' }}>
                No student records match "{query}". Try searching by USN (e.g. <code>1RV23CS001</code>) or first name.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Student Detail Modal */}
      <StudentProfileModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  )
}
