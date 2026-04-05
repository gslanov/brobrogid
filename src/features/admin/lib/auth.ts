interface AdminUser {
  username: string
  passwordHash: string // SHA-256 hex
}

// Hardcoded users with SHA-256 hashed passwords
// admin123  → 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
// bro1pass  → eba04b8a2912717653c60594f74ba6ec80a0b432e866a27013cba3863f6c82bd
// bro2pass  → f8b7b5097799c4e823b7687da2775b97137e7cb625ca8404d0c2b4fa64b7b136
const ADMIN_USERS: AdminUser[] = [
  {
    username: 'admin',
    passwordHash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
  },
  {
    username: 'bro1',
    passwordHash: 'eba04b8a2912717653c60594f74ba6ec80a0b432e866a27013cba3863f6c82bd',
  },
  {
    username: 'bro2',
    passwordHash: 'f8b7b5097799c4e823b7687da2775b97137e7cb625ca8404d0c2b4fa64b7b136',
  },
]

const SESSION_KEY = 'brobrogid_admin_session'
const SESSION_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

async function hashPassword(password: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function authenticate(username: string, password: string): Promise<boolean> {
  const user = ADMIN_USERS.find((u) => u.username === username)
  if (!user) return false
  const hash = await hashPassword(password)
  return hash === user.passwordHash
}

export interface AdminSession {
  username: string
  loginAt: string
}

export function getSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session: AdminSession = JSON.parse(raw)
    const loginAt = new Date(session.loginAt).getTime()
    if (Date.now() - loginAt > SESSION_TTL_MS) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return session
  } catch {
    return null
  }
}

export function saveSession(username: string): void {
  const session: AdminSession = {
    username,
    loginAt: new Date().toISOString(),
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}

export function isAuthenticated(): boolean {
  return getSession() !== null
}
