import { supabase } from './supabase'

export const ticketService = {
  getTickets: async (projectId) => {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  createTicket: async (ticketData) => {
    const { data: { user } } = await supabase.auth.getUser()
    
    // Safety check: Remove 'points' if it's not a number or is missing
    const sanitizedPoints = typeof ticketData.points === 'number' ? ticketData.points : 0
    
    // Map 'desc' from frontend to 'description' in DB
    const { desc, points, ...otherData } = ticketData
    
    const { data, error } = await supabase
      .from('tickets')
      .insert([{
        ...otherData,
        points: sanitizedPoints,
        description: desc,
        creator_id: user.id
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  updateStatus: async (ticketId, status) => {
    const { data, error } = await supabase
      .from('tickets')
      .update({ status })
      .eq('id', ticketId)
    
    if (error) throw error
    return data
  },

  deleteTicket: async (ticketId) => {
    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', ticketId)
    
    if (error) throw error
    return true
  }
}
