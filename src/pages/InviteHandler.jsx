import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../store/useAuthStore'
import { Loader2, Zap, CheckCircle2, UserPlus, ArrowRight, AlertCircle, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'

const InviteHandler = () => {
  const { projectId } = useParams()
  const [searchParams] = useSearchParams()
  const { user, profile, fetchProfile } = useAuthStore()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAccepting, setIsAccepting] = useState(false)
  const [expiryError, setExpiryError] = useState(false)

  const exp = searchParams.get('exp')

  useEffect(() => {
    validateInduction()
  }, [projectId, exp])

  const validateInduction = async () => {
    try {
      // 1. Check Temporal Integrity (60 min expiry)
      if (exp && Date.now() > parseInt(exp)) {
         setExpiryError(true)
         setLoading(false)
         return
      }

      // 2. Resolve Project Identity
      const { data, error } = await supabase.from('projects').select('*').eq('id', projectId).single()
      if (error) throw error
      setProject(data)
    } catch (err) {
      toast.error('Invitation link invalid or project decommissioned.')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!user) {
      // Preserve invitation context and redirect to registration
      navigate(`/register?invite=${projectId}&exp=${exp}`)
      return
    }

    setIsAccepting(true)
    try {
      // Check if already a member
      const { data: existing } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_email', user.email)
        .single()

      if (existing) {
        toast.info('You are already an authorized node in this project.')
        navigate(`/project/${projectId}`)
        return
      }

      const { error } = await supabase.from('project_members').insert([{
        project_id: projectId,
        user_email: user.email,
        role: 'member'
      }])

      if (error) throw error

      toast.success('Project Induction Complete')
      navigate(`/project/${projectId}`)
    } catch (err) {
      toast.error('Induction Failed: Authorization denied.')
    } finally {
      setIsAccepting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
      <div className="text-center">
         <Loader2 className="animate-spin text-[#0052CC] mx-auto mb-4" size={48} />
         <p className="text-[10px] font-black text-[#6B778C] uppercase tracking-widest">Validating Auth Token...</p>
      </div>
    </div>
  )

  if (expiryError) return (
    <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center p-6 text-center">
       <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[56px] p-16 w-full max-w-xl shadow-2xl border border-red-100">
          <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[40px] flex items-center justify-center mx-auto mb-10 shadow-xl shadow-red-100/50">
             <Clock size={40} />
          </div>
          <h1 className="text-4xl font-black text-[#172B4D] tracking-tighter uppercase mb-6 leading-tight">Link Expired</h1>
          <p className="text-sm text-[#6B778C] font-medium leading-relaxed mb-10">This tactical induction node was only valid for 60 minutes. Please request a new authorization link from the mission commander.</p>
          <button onClick={() => navigate('/dashboard')} className="bg-[#172B4D] text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">Return to Hub</button>
       </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[56px] p-16 w-full max-w-2xl shadow-2xl border border-[#EBECF0] text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-10 opacity-5">
           <Zap size={200} className="text-[#0052CC]" />
        </div>

        <div className="relative z-10">
          <div className="w-24 h-24 bg-[#0052CC] rounded-[40px] flex items-center justify-center text-white mx-auto mb-10 shadow-2xl shadow-blue-600/20">
             <UserPlus size={40} />
          </div>
          
          <p className="text-[10px] font-black text-[#0052CC] uppercase tracking-[0.4em] mb-4">Tactical Invitation</p>
          <h1 className="text-4xl font-black text-[#172B4D] tracking-tighter uppercase mb-6 leading-tight">
             Join the <span className="underline decoration-[#0052CC] decoration-8 underline-offset-8">{project?.title}</span> Node
          </h1>
          <p className="text-sm text-[#42526E] font-medium leading-relaxed max-w-sm mx-auto mb-16">
             You have been authorized to collaborate. This link is monitored and will expire after its 60-minute lifecycle.
          </p>

          <div className="flex flex-col gap-4 max-w-xs mx-auto">
             <button 
               onClick={handleAccept}
               disabled={isAccepting}
               className="bg-[#0052CC] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-[#0747A6] active:scale-95 transition-all flex items-center justify-center gap-3"
             >
                {isAccepting ? <Loader2 className="animate-spin" /> : 'Accept Induction'}
                <ArrowRight size={18} />
             </button>
             <button onClick={() => navigate('/dashboard')} className="text-[10px] font-black text-[#6B778C] hover:text-[#DE350B] uppercase tracking-widest transition-colors py-2">Decline Invitation</button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default InviteHandler
