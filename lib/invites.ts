import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'

export type PendingInvite = {
  id: string
  token: string
  email: string
  name: string
  role: string
  created_at: string
  created_by: string
}

export function generateInviteToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function createInvite(data: {
  token: string
  email: string
  name: string
  role: string
  createdBy: string
}): Promise<{ error?: string }> {
  const { data: row, error } = await supabaseAdmin
    .from('pending_invites')
    .insert({
      token: data.token,
      email: data.email,
      name: data.name,
      role: data.role,
      created_by: data.createdBy,
    })
    .select('id')
    .single()

  if (error) {
    console.error('createInvite error:', error)
    return { error: error.message }
  }
  return {}
}

export async function getInviteByToken(token: string): Promise<PendingInvite | null> {
  const { data, error } = await supabaseAdmin
    .from('pending_invites')
    .select('*')
    .eq('token', token)
    .maybeSingle()

  if (error) {
    console.error('getInviteByToken error:', error)
    return null
  }
  return data as PendingInvite | null
}

export async function getInviteByEmail(email: string): Promise<PendingInvite | null> {
  const { data, error } = await supabaseAdmin
    .from('pending_invites')
    .select('*')
    .eq('email', email)
    .maybeSingle()

  if (error) {
    console.error('getInviteByEmail error:', error)
    return null
  }
  return data as PendingInvite | null
}

export async function deleteInvite(token: string): Promise<{ error?: string }> {
  const { error } = await supabaseAdmin
    .from('pending_invites')
    .delete()
    .eq('token', token)

  if (error) {
    console.error('deleteInvite error:', error)
    return { error: error.message }
  }
  return {}
}
