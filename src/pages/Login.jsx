import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/useAuthStore'
import AuthLayout from '../components/AuthLayout'
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'react-toastify'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setUser = useAuthStore(state => state.setUser)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await authService.signIn(email, password)
      if (data.user) {
        setUser(data.user)
        toast.success('Welcome back, Commander')
        navigate('/dashboard')
      }
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Forge Portal" subtitle="Initialize authorized session">
      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="space-y-4">
          <label className="block text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] ml-4">Authorized Email</label>
          <div className="relative group">
            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} strokeWidth={2.5}/>
            <input 
              type="email" 
              required
              className="w-full bg-slate-50 border border-slate-100 rounded-[24px] py-6 pl-16 pr-6 focus:bg-white focus:shadow-xl focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 text-gray-950 font-black text-sm uppercase tracking-tight"
              placeholder="TERMINAL@TASKFORGE.COM"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] ml-4">Access Key</label>
          <div className="relative group">
            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} strokeWidth={2.5}/>
            <input 
              type="password" 
              required
              className="w-full bg-slate-50 border border-slate-100 rounded-[24px] py-6 pl-16 pr-6 focus:bg-white focus:shadow-xl focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 text-gray-950 font-black text-sm uppercase tracking-tight"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button 
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black py-6 rounded-[24px] shadow-glow flex items-center justify-center gap-4 transition-all active:scale-95 uppercase text-[11px] tracking-[0.3em]"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : (
            <>
              INITIALIZE SESSION <ArrowRight size={20} strokeWidth={3}/>
            </>
          )}
        </button>

        <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
          No identity found?{' '}
          <Link to="/register" className="text-indigo-600 hover:text-indigo-700 transition-colors underline decoration-indigo-600/30 underline-offset-8">Forge New Identity</Link>
        </p>
      </form>
    </AuthLayout>
  )
}

export default Login

