import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, LayoutGrid, User } from 'lucide-react'

const MobileNav = () => {
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] z-[1000] cyber-glass border border-white/60 rounded-[32px] h-20 px-10 flex items-center justify-around shadow-premium">
      <Link to="/" className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive('/') ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-indigo-400'}`}>
        <Home size={24} strokeWidth={isActive('/') ? 3 : 2} />
        <span className="text-[10px] font-black uppercase tracking-widest">Home</span>
      </Link>
      <Link to="/dashboard" className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive('/dashboard') ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-indigo-400'}`}>
        <LayoutGrid size={24} strokeWidth={isActive('/dashboard') ? 3 : 2} />
        <span className="text-[10px] font-black uppercase tracking-widest">Forge</span>
      </Link>
      <Link to="/profile" className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive('/profile') ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-indigo-400'}`}>
        <User size={24} strokeWidth={isActive('/profile') ? 3 : 2} />
        <span className="text-[10px] font-black uppercase tracking-widest">Profile</span>
      </Link>
    </div>
  )
}

export default MobileNav

