import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authenticate, saveSession, isAuthenticated } from '../lib/auth'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // If already authenticated — redirect immediately
  if (isAuthenticated()) {
    navigate('/admin', { replace: true })
    return null
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const ok = await authenticate(username.trim(), password)
      if (ok) {
        saveSession(username.trim())
        navigate('/admin', { replace: true })
      } else {
        setError(t('admin.login.errorInvalid'))
      }
    } catch {
      setError(t('admin.login.errorGeneral'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#E85D26' }}>
            BROBROGID
          </h1>
          <p className="text-gray-400 text-sm mt-1">{t('admin.sidebar.adminPanel')}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('admin.login.title')}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.login.username')}
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm
                           focus:outline-none focus:ring-2 focus:border-transparent transition
                           disabled:opacity-60"
                style={{ '--tw-ring-color': '#E85D26' } as React.CSSProperties}
                placeholder="admin"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.login.password')}
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-gray-900 text-sm
                           focus:outline-none focus:ring-2 focus:border-transparent transition
                           disabled:opacity-60"
                style={{ '--tw-ring-color': '#E85D26' } as React.CSSProperties}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition
                         hover:opacity-90 active:opacity-80 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#E85D26' }}
            >
              {loading ? t('admin.login.signingIn') : t('admin.login.signIn')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
