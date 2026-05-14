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
    <AuthLayout title="Welcome Back" subtitle="Authorized Access Protocol">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-3">
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Email Identifier</label>
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
          <div className="flex justify-between items-center px-1">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Access Key</label>
            <a href="#" className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest">Forgot?</a>
          </div>
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

        <button 
          disabled={loading}
          className="w-full bg-slate-900 hover:bg-indigo-600 disabled:opacity-50 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-slate-100 flex items-center justify-center gap-4 transition-all active:scale-95 uppercase text-[12px] tracking-[0.2em]"
        >
          {loading ? <Loader2 className="animate-spin" size={22} /> : (
            <>
              Enter Workspace Hub <ArrowRight size={20} strokeWidth={3} />
            </>
          )}
        </button>

        <div className="pt-6 text-center">
          <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest">
            No identity found?{' '}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 transition-colors">Initialize New Node</Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}

export default Login
