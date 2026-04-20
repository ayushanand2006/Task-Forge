import React from 'react'
import { Link } from 'react-router-dom'

const Logo = ({ className = "", dark = false }) => {
  return (
    <div className={`flex items-center gap-2.5 group ${className}`}>
      <div className="w-9 h-9 flex items-center justify-center transition-all duration-500 group-hover:scale-105">
        <img src="/logo.png" alt="TaskForge Logo" className="w-full h-full object-contain" />
      </div>
      <span className={`text-xl font-extrabold tracking-tight ${dark ? 'text-white' : 'text-slate-900'} transition-colors`}>
        TaskForge
      </span>
    </div>
  )
}

export default Logo

