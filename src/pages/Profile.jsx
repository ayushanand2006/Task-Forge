import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { supabase } from '../services/supabase'
import { 
  User, Mail, Shield, Zap, Check, 
  ChevronLeft, Camera, Bell, Lock, CreditCard,
  Settings, Globe, Loader2, Sparkles, X, CheckCircle2,
  Rocket, Box, Target, Activity, ChevronRight, Layout, Key, Menu, ShieldCheck
} from 'lucide-react'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from '../components/Logo'

const PLANS = [
  { 
    id: "starter", 
    name: "Starter", 
    price: "0", 
    features: ["1 Project", "2 Team Members", "Standard Sync"],
    description: "Ideal for individual forge."
  },
  { 
    id: "pro", 
    name: "Professional", 
    price: "1,499", 
    features: ["10 Projects", "Unlimited Members", "Real-time Sync", "10GB Storage"],
    description: "For active professional teams.",
    highlight: true
  },
  { 
    id: "enterprise", 
    name: "Enterprise", 
    price: "Custom", 
    features: ["Unlimited Projects", "Custom Security", "Dedicated Support"],
    description: "Maximum scale for global orgs."
  }
]

const Profile = () => {
  const { profile, user, fetchProfile } = useAuthStore()
  const [updating, setUpdating] = useState(false)
  const [name, setName] = useState(profile?.full_name || '')
  const [activeTab, setActiveTab] = useState('profile')
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const handleUpdate = async (e) => {
    e.preventDefault()
    setUpdating(true)
    try {
      const { error } = await supabase.from('profiles').update({ full_name: name }).eq('id', user.id)
      if (error) throw error
      toast.success('Identity Record Updated')
      fetchProfile(user.id)
    } catch (err) {
      toast.error('Update failed')
    } finally {
      setUpdating(false)
    }
  }

  const handleUpgrade = async (tierId) => {
    if (tierId === 'enterprise') {
        window.location.href = 'mailto:solutions@taskforge.com'
        return
    }
    setIsUpgrading(true)
    try {
      await new Promise(r => setTimeout(r, 1000))
      const { error } = await supabase.from('profiles').update({ plan_tier: tierId }).eq('id', user.id)
      if (error) throw error
      toast.success(`Plan updated to ${tierId.toUpperCase()}`)
      setIsUpgradeModalOpen(false)
      fetchProfile(user.id)
    } catch (err) {
      toast.error('Upgrade failed')
    } finally {
      setIsUpgrading(false)
    }
  }

  const getUserInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'

  return (
    <div className="min-h-screen bg-[#FBFBFE] text-slate-900 font-sans flex flex-col h-screen overflow-hidden">
      {/* High-End Luxe Navbar */}
      <nav className="h-20 bg-white border-b border-slate-200 px-6 md:px-10 flex items-center justify-between z-[60] shrink-0">
        <div className="flex items-center gap-4 md:gap-12">
          <button 
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl"
          >
            <Menu size={24} />
          </button>
          <Link to="/dashboard" className="hover:scale-105 transition-transform shrink-0">
            <Logo />
          </Link>
          <div className="hidden lg:flex items-center gap-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
             <ChevronRight size={14} className="text-slate-300" />
             <span>Command Center</span>
             <ChevronRight size={14} className="text-slate-300" />
             <span className="text-indigo-600">Personnel Config</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-2 text-[11px] font-black text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-widest">
            <ChevronLeft size={18} /> <span className="hidden xs:inline">Return to Mission</span>
          </Link>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileSidebarOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] lg:hidden"
              />
              <motion.aside 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                className="fixed inset-y-0 left-0 w-80 bg-white z-[80] lg:hidden flex flex-col p-8 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-12">
                   <Logo />
                   <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-xl">
                      <X size={20} />
                   </button>
                </div>
                <div className="flex-1 space-y-2">
                   <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-6">Configuration</p>
                   {[
                     { id: 'profile', label: 'Identity Profile', icon: <User size={20} /> },
                     { id: 'security', label: 'Security Protocols', icon: <Shield size={20} /> },
                     { id: 'billing', label: 'Billing Infrastructure', icon: <CreditCard size={20} /> }
                   ].map(tab => (
                      <button 
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setIsMobileSidebarOpen(false); }}
                        className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-[14px] font-bold transition-all ${activeTab === tab.id ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                      >
                        {tab.icon} {tab.label}
                      </button>
                   ))}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col p-8 hidden lg:flex z-50">
          <div className="flex-1 space-y-2">
             <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-6">Configuration</p>
             {[
               { id: 'profile', label: 'Identity Profile', icon: <User size={20} /> },
               { id: 'security', label: 'Security Protocols', icon: <Shield size={20} /> },
               { id: 'billing', label: 'Billing Infrastructure', icon: <CreditCard size={20} /> }
             ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-[14px] font-bold transition-all ${activeTab === tab.id ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  {tab.icon} {tab.label}
                </button>
             ))}
          </div>
          
          <div className="p-6 bg-[#FBFBFE] rounded-[28px] border border-slate-200/60 shadow-inner-glow mt-auto">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Tier Authorization</p>
             <p className="text-[15px] font-black text-indigo-600 truncate uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={16} /> {profile?.plan_tier || 'STARTER'}
             </p>
          </div>
        </aside>

        {/* Profile Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar bg-[#FBFBFE]">
           <div className="max-w-4xl mx-auto pb-24">
              <AnimatePresence mode="wait">
                 {activeTab === 'profile' && (
                    <motion.section key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 md:space-y-10">
                       <div className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-12 border border-slate-200/60 shadow-premium relative overflow-hidden">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 relative">
                             <div>
                                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-display">Personnel Identity</h1>
                                <p className="text-sm font-medium text-slate-500 mt-1">Manage your public handle and metadata.</p>
                             </div>
                             <div className={`w-fit px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] border-2 ${profile?.plan_tier === 'pro' ? 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                {profile?.plan_tier || 'Starter'} Protocol
                             </div>
                          </div>

                          <form onSubmit={handleUpdate} className="space-y-10 md:space-y-12">
                             <div className="flex flex-col sm:flex-row items-center gap-8 md:gap-10">
                                <div className="w-24 h-24 md:w-28 md:h-28 bg-slate-900 rounded-[32px] flex items-center justify-center text-white text-3xl md:text-4xl font-black relative group overflow-hidden shadow-2xl shadow-slate-200 shrink-0">
                                   {getUserInitials(profile?.full_name)}
                                   <div className="absolute inset-0 bg-indigo-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm"><Camera size={32}/></div>
                                </div>
                                <div className="space-y-2 text-center sm:text-left overflow-hidden">
                                   <p className="text-xl md:text-2xl font-black text-slate-900 font-display tracking-tight truncate">{profile?.full_name}</p>
                                   <p className="text-sm font-bold text-slate-400 flex items-center justify-center sm:justify-start gap-2 truncate">
                                      <Mail size={14} className="shrink-0" /> {user?.email}
                                   </p>
                                </div>
                             </div>

                             <div className="grid grid-cols-1 gap-8 max-w-xl">
                                <div className="space-y-3">
                                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Display Handle</label>
                                   <input className="w-full bg-[#FBFBFE] border border-slate-200 rounded-2xl px-6 py-4 text-base font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-inner-glow placeholder:text-slate-300" value={name} onChange={e => setName(e.target.value)} placeholder="Personnel Name" />
                                </div>
                             </div>
                             
                             <button disabled={updating} className="w-full sm:w-auto bg-slate-900 text-white px-10 py-4.5 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-3">
                                {updating ? <Loader2 className="animate-spin" size={18}/> : <Target size={18}/>}
                                Commit Changes
                             </button>
                          </form>
                       </div>

                       <div className="bg-slate-900 rounded-[32px] md:rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl group">
                          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/30 to-transparent pointer-events-none"></div>
                          <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px]"></div>
                          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                             <div className="max-w-lg">
                                <div className="flex items-center gap-3 text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">
                                   <Sparkles size={16} /> Advanced Induction
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black mb-3 font-display tracking-tight leading-tight">Elevate your operational capacity</h3>
                                <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed">Unlock advanced multi-project synchronization and unlimited team nodes.</p>
                             </div>
                             <button onClick={() => setIsUpgradeModalOpen(true)} className="w-full md:w-auto bg-white text-slate-900 px-10 py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-xl whitespace-nowrap">View Tier Matrix</button>
                          </div>
                       </div>
                    </motion.section>
                 )}

                 {activeTab === 'security' && (
                    <motion.section key="security" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-12 border border-slate-200/60 shadow-premium">
                       <div className="flex items-center gap-4 mb-12">
                          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 shadow-sm"><Lock size={24}/></div>
                          <div>
                             <h2 className="text-2xl font-black text-slate-900 tracking-tight font-display">Security Protocols</h2>
                             <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Personnel Access Shielding</p>
                          </div>
                       </div>
                       
                       <div className="space-y-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 md:p-8 bg-[#FBFBFE] rounded-3xl border border-slate-200/60 group hover:border-indigo-400 transition-all shadow-sm gap-6">
                             <div className="flex items-center gap-6 md:gap-8">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform shrink-0"><Key size={24} /></div>
                                <div>
                                   <p className="text-base md:text-[17px] font-black text-slate-900 tracking-tight">Two-Factor Authentication</p>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-300"></div> DEACTIVATED</p>
                                </div>
                             </div>
                             <button className="w-full sm:w-auto text-[11px] font-black text-indigo-600 px-6 py-3 bg-white border border-slate-200 rounded-xl hover:bg-indigo-50 transition-all uppercase tracking-widest">Activate</button>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 md:p-8 bg-[#FBFBFE] rounded-3xl border border-slate-200/60 group hover:border-indigo-400 transition-all shadow-sm gap-6">
                             <div className="flex items-center gap-6 md:gap-8">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform shrink-0"><Shield size={24} /></div>
                                <div>
                                   <p className="text-base md:text-[17px] font-black text-slate-900 tracking-tight">Encryption Session</p>
                                   <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-1 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> LINK ESTABLISHED</p>
                                </div>
                             </div>
                             <button className="w-full sm:w-auto text-[11px] font-black text-slate-400 px-6 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest">Details</button>
                          </div>
                       </div>
                    </motion.section>
                 )}

                 {activeTab === 'billing' && (
                    <motion.section key="billing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-12 border border-slate-200/60 shadow-premium">
                       <div className="flex items-center gap-4 mb-12">
                          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 shadow-sm"><CreditCard size={24}/></div>
                          <div>
                             <h2 className="text-2xl font-black text-slate-900 tracking-tight font-display">Billing Infrastructure</h2>
                             <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Financial Node Management</p>
                          </div>
                       </div>

                       <div className="p-8 md:p-12 bg-slate-900 rounded-[32px] mb-12 text-center shadow-2xl relative overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
                          <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-6 relative">Current Operational Tier</p>
                          <p className="text-4xl md:text-5xl font-black text-white mb-10 relative uppercase font-display tracking-tight group-hover:scale-105 transition-transform duration-700">{profile?.plan_tier || 'STARTER'}</p>
                          <button onClick={() => setIsUpgradeModalOpen(true)} className="relative inline-block px-10 py-4 bg-white text-slate-900 hover:bg-indigo-50 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-black/20">Upgrade Protocol</button>
                       </div>
                       
                       <div className="space-y-6">
                          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">Historical Data</p>
                          <div className="text-center py-20 bg-[#FBFBFE] rounded-[32px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                             <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 border border-slate-100 mb-6 shadow-sm"><Box size={24}/></div>
                             <p className="text-[13px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">No transactional data recorded.</p>
                          </div>
                       </div>
                    </motion.section>
                 )}
              </AnimatePresence>
           </div>
        </main>
      </div>

      {/* Modern High-End Upgrade Modal */}
      <AnimatePresence>
         {isUpgradeModalOpen && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 bg-slate-950/70 backdrop-blur-xl overflow-y-auto">
               <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="bg-white rounded-[40px] md:rounded-[48px] p-8 md:p-16 w-full max-w-5xl shadow-[0_80px_160px_-40px_rgba(0,0,0,0.5)] border border-slate-200/60 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
                  <button onClick={() => setIsUpgradeModalOpen(false)} className="absolute top-8 right-8 md:top-10 md:right-10 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-900 transition-all z-10"><X size={24} /></button>
                  
                  <div className="text-center mb-12 md:mb-16">
                     <div className="inline-block px-5 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] border border-indigo-100 mb-6">Forge Scaling Protocol</div>
                     <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 font-display tracking-tight">Operational Capacity</h3>
                     <p className="text-sm md:text-base font-medium text-slate-500 uppercase tracking-widest">Current: <span className="text-indigo-600 font-black">{profile?.plan_tier || 'starter'}</span></p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
                     {PLANS.map(plan => (
                        <div key={plan.id} className={`p-8 md:p-10 border-2 rounded-[32px] md:rounded-[40px] flex flex-col transition-all relative group ${plan.highlight ? 'border-indigo-600 bg-indigo-50/20 shadow-2xl shadow-indigo-100' : 'border-slate-100 bg-white hover:border-indigo-200 shadow-sm'}`}>
                           {plan.highlight && (
                              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl">Most Popular</div>
                           )}
                           <div className="flex-1">
                              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">{plan.name} Node</h4>
                              <div className="flex items-baseline gap-2 mb-8">
                                 <span className="text-3xl md:text-4xl font-black text-slate-900 font-display">₹{plan.price}</span>
                                 {plan.price !== 'Custom' && <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">/mo</span>}
                              </div>
                              <ul className="space-y-4 md:space-y-5 mb-10">
                                 {plan.features.map((f, idx) => (
                                    <li key={idx} className="flex items-center gap-3">
                                       <div className="p-1 bg-emerald-50 text-emerald-500 rounded-lg border border-emerald-100 shadow-sm shrink-0"><Check size={12} strokeWidth={4} /></div>
                                       <span className="text-[13px] font-bold text-slate-600">{f}</span>
                                    </li>
                                 ))}
                              </ul>
                           </div>
                           <button 
                             disabled={isUpgrading || profile?.plan_tier === plan.id}
                             onClick={() => handleUpgrade(plan.id)}
                             className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-xl ${plan.highlight ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-slate-100'} disabled:opacity-30`}
                           >
                              {isUpgrading ? <Loader2 className="animate-spin" size={18} /> : (profile?.plan_tier === plan.id ? 'Active' : 'Select Protocol')}
                           </button>
                        </div>
                     ))}
                  </div>
                  <div className="flex items-center justify-center gap-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] pt-4">
                     <ShieldCheck size={16} className="text-emerald-500 shrink-0" /> SECURE INFRASTRUCTURE &bull; AES-256
                  </div>
               </motion.div>
            </div>
         )}
       </AnimatePresence>
    </div>
  )
}

export default Profile
