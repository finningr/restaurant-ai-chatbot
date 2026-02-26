import { supabaseAdmin } from '@/lib/supabase'

export type AppUser = {
  id: string
  email: string
  password: string
  name: string
  role: string
  has_chatbot: boolean
  status: string
  restaurant_name?: string
  created_at: string
}

export async function getUserByEmail(email: string): Promise<AppUser | null> {
  const { data, error } = await supabaseAdmin
    .from('app_users')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle()

  if (error) {
    console.error('getUserByEmail error:', error)
    return null
  }
  return data as AppUser | null
}

export async function userExists(email: string): Promise<boolean> {
  const user = await getUserByEmail(email)
  return !!user
}

export async function getAllUsers(): Promise<AppUser[]> {
  const { data, error } = await supabaseAdmin
    .from('app_users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getAllUsers error:', error)
    return []
  }
  return (data || []) as AppUser[]
}

export async function createUser(user: {
  id: string
  email: string
  password: string
  name: string
  role: string
  hasChatbot?: boolean
  restaurantName?: string
}): Promise<{ error?: string }> {
  const { error } = await supabaseAdmin.from('app_users').insert({
    id: user.id,
    email: user.email.toLowerCase().trim(),
    password: user.password,
    name: user.name,
    role: user.role,
    has_chatbot: user.hasChatbot ?? (user.role === 'admin'),
    status: 'active',
    restaurant_name: user.restaurantName || null,
  })

  if (error) {
    console.error('createUser error:', error)
    return { error: error.message }
  }
  return {}
}

export async function updateUserStatus(
  email: string,
  status: 'active' | 'paused' | 'deleted'
): Promise<{ error?: string }> {
  const { error } = await supabaseAdmin
    .from('app_users')
    .update({ status })
    .eq('email', email)

  if (error) {
    console.error('updateUserStatus error:', error)
    return { error: error.message }
  }
  return {}
}

export async function deleteUser(email: string): Promise<{ error?: string }> {
  const { error } = await supabaseAdmin.from('app_users').delete().eq('email', email)

  if (error) {
    console.error('deleteUser error:', error)
    return { error: error.message }
  }
  return {}
}
