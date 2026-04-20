import { create } from 'zustand'
import { supabase } from '../services/supabase'

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  loading: true,
  
  setUser: (user) => set({ user }),
  
  fetchProfile: async (userId) => {
    try {
      // Use maybeSingle to avoid 406 errors if row doesn't exist
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      
      if (data) {
        set({ profile: data })
      } else {
        // Fallback profile for UI stability if record is missing
        set({ profile: { plan_tier: 'starter', full_name: 'Member' } })
        
        // If table exists but row is missing, try to create it manually
        if (!error) {
          const { data: newUser } = await supabase.auth.getUser()
          await supabase.from('profiles').upsert({ 
            id: userId, 
            full_name: newUser?.user?.user_metadata?.full_name || 'Member',
            plan_tier: 'starter' 
          })
        }
      }
    } catch (err) {
      // Silently fail to avoid crashing the dashboard on first-load syncs
      set({ profile: { plan_tier: 'starter', full_name: 'Member' } })
    }
  },

  setLoading: (loading) => set({ loading }),
  
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  }
}))
