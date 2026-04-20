import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '../services/authService'
import { supabase } from '../services/supabase'
import { UserPlus, Mail, Lock, User, Loader2, ArrowRight, ShieldCheck, Zap } from 'lucide-react'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
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
    <AuthLayout title="Identity Forge" subtitle="Establish authorized credentials">
      <form onSubmit={handleRegister} className="space-y-8">
        <div className="flex justify-center mb-4">
          {invitationId ? (
            <div className="bg-emerald-50 text-emerald-600 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-3 animate-pulse shadow-sm">
               <ShieldCheck size={14} strokeWidth={3}/> Authorized Invitation Active
            </div>
          ) : (
            <div className="bg-indigo-50 text-indigo-600 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-100 flex items-center gap-3 shadow-sm">
               <Zap size={14} strokeWidth={3}/> Standard Identity Protocol
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] ml-4">Full Identity Handle</label>
            <div className="relative group">
              <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} strokeWidth={2.5}/>
              <input 
                type="text" 
                required 
                className="w-full bg-slate-50 border border-slate-100 rounded-[24px] py-5 pl-16 pr-6 focus:bg-white focus:shadow-xl focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 text-gray-950 font-black text-sm uppercase tracking-tight"
                placeholder="MISSION COMMANDER NAME"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] ml-4">Authority Email</label>
            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} strokeWidth={2.5}/>
              <input 
                type="email" 
                required 
                className="w-full bg-slate-50 border border-slate-100 rounded-[24px] py-5 pl-16 pr-6 focus:bg-white focus:shadow-xl focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 text-gray-950 font-black text-sm uppercase tracking-tight"
                placeholder="TERMINAL@COMPANY.COM"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] ml-4">Protocol Key</label>
            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} strokeWidth={2.5}/>
              <input 
                type="password" 
                required 
                className="w-full bg-slate-50 border border-slate-100 rounded-[24px] py-5 pl-16 pr-6 focus:bg-white focus:shadow-xl focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 text-gray-950 font-black text-sm uppercase tracking-tight"
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
          className="w-full bg-indigo-600 text-white py-6 rounded-[24px] font-black text-[11px] uppercase tracking-[0.4em] shadow-glow hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-4 mt-4"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : (
            <>
              FORGE IDENTITY <ArrowRight size={20} strokeWidth={3}/>
            </>
          )}
        </button>

        <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-widest mt-6">
          ALREADY AUTHORIZED?{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700 transition-colors underline decoration-indigo-600/30 underline-offset-8">Return to Portal</Link>
        </p>
      </form>
    </AuthLayout>
  )
}

export default Register
