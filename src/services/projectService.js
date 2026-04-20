import { supabase } from './supabase'

export const projectService = {
  getProjects: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Get projects where user is a member
    const { data: membership } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_email', user.email)

    if (!membership || membership.length === 0) return []

    const projectIds = membership.map(m => m.project_id)
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .in('id', projectIds)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  createProject: async (title, description) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // 1. Forge the project node
    const { data: project, error: projError } = await supabase
      .from('projects')
      .insert([{ title, description }])
      .select()
      .single()

    if (projError) throw projError

    // 2. Automatically register creator as the 'admin' authority
    const { error: memberError } = await supabase
      .from('project_members')
      .insert([{
        project_id: project.id,
        user_email: user.email,
        role: 'admin'
      }])

    if (memberError) throw memberError
    return project
  }
}
