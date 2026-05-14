import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../store/useAuthStore'
import { Loader2, Zap, CheckCircle2, UserPlus, ArrowRight, AlertCircle, Clock, ShieldCheck, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import Logo from '../components/Logo'

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
      if (exp && Date.now() > parseInt(exp)) {
         setExpiryError(true)
         setLoading(false)
         return
      }

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
      navigate(`/register?invite=${projectId}&exp=${exp}`)
      return
    }

    setIsAccepting(true)
    try {
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
    <div className="min-h-screen bg-[#FBFBFE] flex items-center justify-center">
      <div className="text-center">
         <div className="relative w-16 h-16 mb-6 mx-auto">
            <div className="absolute inset-0 border-4 border-indigo-50 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
         </div>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Validating Induction Protocol...</p>
      </div>
    </div>
  )

  if (expiryError) return (
    <div className="min-h-screen bg-[#FBFBFE] flex items-center justify-center p-6 text-center">
       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[48px] p-16 w-full max-w-xl shadow-premium border border-slate-200/60">
          <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-xl shadow-rose-100">
             <Clock size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display mb-6">Induction Link Expired</h1>
          <p className="text-base text-slate-500 font-medium leading-relaxed mb-12">This tactical induction node was only valid for a limited window. Please request a new authorization link from the mission commander.</p>
          <button onClick={() => navigate('/dashboard')} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-100 active:scale-95">Return to Command Center</button>
       </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FBFBFE] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[56px] p-16 w-full max-w-2xl shadow-premium border border-slate-200/60 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <Zap size={240} className="text-indigo-600" />
        </div>

        <div className="relative z-10">
          <div className="flex justify-center mb-10">
            <Logo />
          </div>

          <div className="w-24 h-24 bg-slate-900 rounded-[32px] flex items-center justify-center text-white mx-auto mb-10 shadow-2xl shadow-slate-200">
             <UserPlus size={40} strokeWidth={2.5} />
          </div>
          
          <div className="flex items-center justify-center gap-3 text-[11px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-6">
             <Sparkles size={16} /> COLLABORATION PROTOCOL
          </div>
          
          <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display mb-8 leading-tight">
             Join the <span className="text-indigo-600">"{project?.title}"</span> Workspace
          </h1>
          
          <p className="text-base text-slate-500 font-medium leading-relaxed max-w-sm mx-auto mb-16">
             You have been authorized for project induction. This link is monitored and requires immediate verification.
          </p>

          <div className="flex flex-col gap-5 max-w-sm mx-auto">
             <button 
               onClick={handleAccept}
               disabled={isAccepting}
               className="bg-slate-900 text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-indigo-600 active:scale-95 transition-all flex items-center justify-center gap-4"
             >
                {isAccepting ? <Loader2 className="animate-spin" /> : (
                  <>
                    Initialize Induction <ArrowRight size={18} />
                  </>
                )}
             </button>
             <button onClick={() => navigate('/dashboard')} className="text-[11px] font-black text-slate-400 hover:text-rose-600 uppercase tracking-widest transition-colors py-4">Decline Authorization</button>
          </div>
          
          <div className="flex items-center justify-center gap-3 text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] pt-8">
             <ShieldCheck size={14} className="text-emerald-500" /> SECURE HANDSHAKE ACTIVE
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default InviteHandler
