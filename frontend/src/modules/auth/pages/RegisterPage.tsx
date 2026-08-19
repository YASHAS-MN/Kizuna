import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { registerUser } from '../services/registerService'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [usn, setUsn] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/home', { replace: true })
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return
    }

    setFormLoading(true)
    try {
      const result = await registerUser({
        fullName,
        usn,
        email,
        password,
        confirmPassword
      })

      if (result.success) {
        setSuccessMsg(result.message)
        // Reset form
        setFullName('')
        setUsn('')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check your inputs.')
    } finally {
      setFormLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flex: 1, minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <p style={{ color: 'var(--text-muted)' }}>Verifying session status...</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', padding: '2rem' }}>
      <div style={{ maxWidth: '460px', width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '2.5rem', borderRadius: '0.75rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div className="logo-icon" style={{ margin: '0 auto 0.75rem auto', width: '3rem', height: '3rem', fontSize: '1.75rem' }}>絆</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Create your Kizuna Account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Join the academic project & collaboration network</p>
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.75rem 1rem', borderRadius: '0.375rem', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1rem', borderRadius: '0.375rem', fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontWeight: 600 }}>{successMsg}</p>
            <Link to="/login" className="btn btn-primary" style={{ marginTop: '0.75rem', width: '100%' }}>
              Proceed to Sign In
            </Link>
          </div>
        )}

        {!successMsg && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
              <input
                type="text"
                placeholder="e.g. Alice Rao"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={formLoading}
                required
                className="search-input"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>USN (University Seat Number)</label>
              <input
                type="text"
                placeholder="e.g. 1RV23CS001"
                value={usn}
                onChange={(e) => setUsn(e.target.value)}
                disabled={formLoading}
                required
                className="search-input"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</label>
              <input
                type="email"
                placeholder="e.g. alice.rao@kizuna.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={formLoading}
                required
                className="search-input"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={formLoading}
                  required
                  className="search-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={formLoading}
                  required
                  className="search-input"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.875rem', marginTop: '0.75rem', opacity: formLoading ? 0.7 : 1, cursor: formLoading ? 'not-allowed' : 'pointer' }}
              disabled={formLoading}
            >
              {formLoading ? 'Creating account...' : 'Register'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
