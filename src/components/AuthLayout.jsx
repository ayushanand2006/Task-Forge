import React from 'react'
import { motion } from 'framer-motion'
import Logo from './Logo'

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 font-sans flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full -mr-64 -mt-64"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg z-10"
      >
        <div className="text-center mb-10">
          <div className="flex justify-center mb-10">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">{title}</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{subtitle}</p>
        </div>

        <div className="bg-white rounded-3xl p-10 md:p-12 shadow-xl border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          {children}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-[10px] font-bold uppercase text-slate-300 tracking-[0.4em] mb-2">Professional Project Management</p>
          <p className="text-[9px] font-bold uppercase text-slate-200 tracking-[0.2em]">&copy; 2026 Innovix Tech Labs</p>
        </div>
      </motion.div>
    </div>
  )
}

export default AuthLayout

