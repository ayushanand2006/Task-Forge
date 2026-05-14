import React from 'react'
import { motion } from 'framer-motion'
import Logo from './Logo'

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen w-full bg-[#FBFBFE] text-slate-900 font-sans flex items-center justify-center p-6 relative overflow-hidden">
      {/* Refined mesh gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-50/50 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50/30 blur-[100px] rounded-full -ml-48 -mb-48 pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl z-10"
      >
        <div className="text-center mb-10">
          <div className="flex justify-center mb-8">
            <Logo className="scale-110" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2 font-display">{title}</h1>
          <p className="text-slate-500 font-bold text-[12px] uppercase tracking-widest">{subtitle}</p>
        </div>

        <div className="bg-white rounded-[40px] p-10 md:p-14 shadow-premium border border-slate-200/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          {children}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-[11px] font-bold uppercase text-slate-300 tracking-[0.4em] mb-2">Professional Project Management Forge</p>
          <p className="text-[10px] font-bold uppercase text-slate-200 tracking-[0.2em]">&copy; 2026 Innovix Tech Labs &bull; v2.0.4</p>
        </div>
      </motion.div>
    </div>
  )
}

export default AuthLayout
