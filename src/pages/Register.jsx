import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '../services/authService'
import { supabase } from '../services/supabase'
import { UserPlus, Mail, Lock, User, Loader2, ArrowRight, ShieldCheck, Zap } from 'lucide-react'
import { toast } from 'react-toastify'
import AuthLayout from '../components/AuthLayout'

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const invitationId = searchParams.get('invite')

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { user, error } = await authService.signUp(email, password, fullName)
      if (error) throw error
      
      toast.success('Identity Forged Successfully')

      if (invitationId) {
        toast.info('Processing Tactical Induction...')
        const { error: memberError } = await supabase.from('project_members').insert([{
           project_id: invitationId,
           user_email: email,
           role: 'member'
        }])
        if (memberError) console.error('Auto-induction failure:', memberError)
        else toast.success('Induction Complete')
        
        navigate(`/project/${invitationId}`)
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Forge Account" subtitle="Join the Mission Control">
      <form onSubmit={handleRegister} className="space-y-6">
        <div className="flex justify-center mb-6">
          {invitationId ? (
            <div className="bg-emerald-50 text-emerald-600 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100 flex items-center gap-2 animate-pulse">
               <ShieldCheck size={14} /> Authorized Invite
            </div>
          ) : (
            <div className="bg-indigo-50 text-indigo-600 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-100 flex items-center gap-2">
               <Zap size={14} /> Protocol Initialization
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Full Identity</label>
            <div className="relative group">
              <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
              <input 
                type="text" 
                required 
                className="w-full bg-[#FBFBFE] border border-slate-200 rounded-[24px] py-5 pl-16 pr-6 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-200 text-slate-900 font-black text-[16px] shadow-inner-glow"
                placeholder="Mission Commander"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Email Node</label>
            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
              <input 
                type="email" 
                required 
                className="w-full bg-[#FBFBFE] border border-slate-200 rounded-[24px] py-5 pl-16 pr-6 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-200 text-slate-900 font-black text-[16px] shadow-inner-glow"
                placeholder="terminal@taskforge.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Security Key</label>
            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
              <input 
                type="password" 
                required 
                className="w-full bg-[#FBFBFE] border border-slate-200 rounded-[24px] py-5 pl-16 pr-6 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-200 text-slate-900 font-black text-[16px] shadow-inner-glow"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-5 rounded-[24px] font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl shadow-slate-100 transition-all active:scale-95 flex items-center justify-center gap-4 mt-8"
        >
          {loading ? <Loader2 className="animate-spin" size={22} /> : (
            <>
              Forge Identity <ArrowRight size={20} strokeWidth={3} />
            </>
          )}
        </button>

        <div className="pt-6 text-center">
          <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest">
            Already authorized?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 transition-colors">Return to Portal</Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}

export default Register
