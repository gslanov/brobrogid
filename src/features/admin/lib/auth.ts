import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/shared/lib/supabase'

export interface AdminSession {
  email: string
  loginAt: string
}

interface JwtPayload {
  role?: string
  app_metadata?: { role?: string }
  [key: string]: unknown
}

/** Decode a JWT payload without verifying the signature (verification is done server-side). */
function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

/** True if the JWT carries an admin role (top-level `role` or `app_metadata.role`). */
function hasAdminRole(session: Session | null): boolean {
  if (!session?.access_token) return false
  const payload = decodeJwt(session.access_token)
  if (!payload) return false
  return payload.role === 'admin' || payload.app_metadata?.role === 'admin'
}

/**
 * Sign in with Supabase Auth (GoTrue) using email + password.
 * Returns true only when the credentials are valid AND the user has the admin role.
 * Non-admin users are signed out immediately so no admin session lingers.
 */
export async function authenticate(email: string, password: string): Promise<boolean> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.session) return false
  if (!hasAdminRole(data.session)) {
    await supabase.auth.signOut()
    return false
  }
  return true
}

/** Current admin session derived from the Supabase session, or null if absent/not an admin. */
export async function getSession(): Promise<AdminSession | null> {
  const { data } = await supabase.auth.getSession()
  const session = data.session
  if (!session || !hasAdminRole(session)) return null
  return {
    email: session.user.email ?? '',
    loginAt: new Date(session.user.last_sign_in_at ?? Date.now()).toISOString(),
  }
}

/** True if there is a valid, admin-scoped Supabase session. */
export async function isAuthenticated(): Promise<boolean> {
  return (await getSession()) !== null
}

/** Sign out of Supabase Auth. */
export async function clearSession(): Promise<void> {
  await supabase.auth.signOut()
}
