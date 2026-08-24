import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Task } from '../types/task.types'
import type { Project } from '../../projects/types/project.types'
import type { Team, TeamMember } from '../../teams/types/team.types'
import { taskService } from '../services/taskService'
import { projectService } from '../../projects/services/projectService'
import { teamService } from '../../teams/services/teamService'
import TaskBoard from '../components/TaskBoard'
import TaskForm from '../components/TaskForm'
import TaskDetailModal from '../components/TaskDetailModal'

export default function TasksPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<Project | null>(null)
  const [team, setTeam] = useState<Team | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [tasks, setTasks] = useState<Task[]>([])

  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const loadData = useCallback(async () => {
    if (!projectId) return
    try {
      // 1. Resolve Project
      const proj = await projectService.getProject(projectId)
      if (!proj) {
        setErrorMsg(`Project with ID "${projectId}" was not found.`)
        setLoading(false)
        return
      }
      setProject(proj)

      // 2. Resolve Associated Team & Members
      const tm = await teamService.getTeam(proj.teamId)
      if (tm) {
        setTeam(tm)
        setTeamMembers(tm.members)
      } else {
        setTeamMembers([])
      }

      // 3. Resolve Tasks for Project
      const projectTasks = await taskService.getTasksForProject(projectId)
      setTasks(projectTasks)
    } catch (err) {
      console.error('Failed to load project tasks workspace:', err)
      setErrorMsg('Failed to load task workspace data.')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadData()
    const unsubscribeTasks = taskService.subscribe(() => {
      loadData()
    })
    const unsubscribeProjects = projectService.subscribe(() => {
      loadData()
    })
    const unsubscribeTeams = teamService.subscribe(() => {
      loadData()
    })

    return () => {
      unsubscribeTasks()
      unsubscribeProjects()
      unsubscribeTeams()
    }
  }, [loadData])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        Loading project tasks board...
      </div>
    )
  }

  if (errorMsg || !project) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#ef4444', marginBottom: '0.5rem' }}>{errorMsg || 'Project not found'}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>The project context for these tasks could not be located.</p>
        <button onClick={() => navigate('/projects')} className="btn btn-primary">
          Back to Projects
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Task Workspace Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
              Team: {team ? team.name : 'Unknown Team'}
            </span>
            <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
              {tasks.length} Total Tasks
            </span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.875rem' }}>{project.name} — Task Board</h1>
          <p className="page-subtitle">Manage responsibilities, track milestone tasks, and monitor delivery status.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate(`/projects/${project.id}`)} className="btn btn-secondary">
            ← Project Workspace
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={teamMembers.length === 0}
            className="btn btn-primary"
          >
            + Create Task
          </button>
        </div>
      </div>

      {teamMembers.length === 0 && (
        <div style={{ padding: '0.875rem 1rem', backgroundColor: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '0.5rem', color: '#f59e0b', fontSize: '0.875rem' }}>
          Warning: Associated team members could not be resolved. Tasks cannot be assigned until team roster is available.
        </div>
      )}

      {/* Main Kanban Board Component */}
      <TaskBoard tasks={tasks} onSelectTask={(task) => setSelectedTask(task)} />

      {/* Task Creation Modal */}
      {showCreateModal && (
        <TaskForm
          projectId={project.id}
          teamMembers={teamMembers}
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadData}
        />
      )}

      {/* Task Detail & Actions Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          teamMembers={teamMembers}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={loadData}
        />
      )}
    </div>
  )
}
