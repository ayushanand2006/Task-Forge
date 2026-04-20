import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { supabase } from '../services/supabase'
import { 
  User, Mail, Shield, Zap, Check, 
  ChevronLeft, Camera, Bell, Lock, CreditCard,
  Settings, Globe, Loader2, Sparkles, X, CheckCircle2,
  Rocket, Box, Target, Activity, ChevronRight, Layout
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
    description: "Ideal for individuals."
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

  const handleUpdate = async (e) => {
    e.preventDefault()
    setUpdating(true)
    try {
      const { error } = await supabase.from('profiles').update({ full_name: name }).eq('id', user.id)
      if (error) throw error
      toast.success('Profile Updated')
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

  const upgradePaths = PLANS.filter(p => p.id !== profile?.plan_tier)
  const getUserInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col h-screen overflow-hidden">
      {/* Refined Pro Navbar */}
      <nav className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between z-50 shrink-0">
        <div className="flex items-center gap-10">
          <Link to="/dashboard">
            <Logo />
          </Link>
          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
             <ChevronRight size={14} />
             <span>Settings</span>
             <ChevronRight size={14} />
             <span className="text-indigo-600">{activeTab}</span>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <Link to="/dashboard" className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">
            <ChevronLeft size={16} /> Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Compact Pro Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-6 hidden lg:flex">
          <div className="flex-1 space-y-1">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Account</p>
             {[
               { id: 'profile', label: 'Profile', icon: <User size={18} /> },
               { id: 'security', label: 'Security', icon: <Shield size={18} /> },
               { id: 'billing', label: 'Billing', icon: <CreditCard size={18} /> }
             ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {tab.icon} {tab.label}
                </button>
             ))}
          </div>
          
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Plan</p>
             <p className="text-xs font-bold text-indigo-600 truncate uppercase">{profile?.plan_tier || 'STARTER'}</p>
          </div>
        </aside>

        {/* Profile Content Area */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50">
           <div className="max-w-4xl mx-auto">
              <AnimatePresence mode="wait">
                 {activeTab === 'profile' && (
                    <motion.section key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                       <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-sm relative overflow-hidden">
                          <div className="flex items-center justify-between mb-10">
                             <div>
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Public Profile</h1>
                                <p className="text-sm text-slate-500 font-medium">Manage how you appear to your team.</p>
                             </div>
                             <div className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${profile?.plan_tier === 'pro' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                {profile?.plan_tier || 'Starter'} active
                             </div>
                          </div>

                          <form onSubmit={handleUpdate} className="space-y-8">
                             <div className="flex items-center gap-8">
                                <div className="w-24 h-24 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold relative group overflow-hidden">
                                   {getUserInitials(profile?.full_name)}
                                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm"><Camera size={24}/></div>
                                </div>
                                <div className="space-y-1">
                                   <p className="text-lg font-bold text-slate-900">{profile?.full_name}</p>
                                   <p className="text-xs font-medium text-slate-400">{user?.email}</p>
                                </div>
                             </div>

                             <div className="grid grid-cols-1 gap-6 max-w-md">
                                <div className="space-y-2">
                                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                   <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" />
                                </div>
                             </div>
                             
                             <button disabled={updating} className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md active:scale-95">
                                {updating ? <Loader2 className="animate-spin inline-block mr-2" size={16}/> : null}
                                Update Profile
                             </button>
                          </form>
                       </div>

                       <div className="bg-slate-900 rounded-2xl p-10 text-white relative overflow-hidden shadow-xl">
                          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent"></div>
                          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                             <div className="max-w-md">
                                <h3 className="text-xl font-bold mb-2">Upgrade your workspace</h3>
                                <p className="text-slate-400 text-sm font-medium leading-relaxed">Unlock advanced collaboration features, unlimited projects, and priority support.</p>
                             </div>
                             <button onClick={() => setIsUpgradeModalOpen(true)} className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold text-xs hover:bg-slate-100 transition-all active:scale-95 shadow-lg whitespace-nowrap">View Plans</button>
                          </div>
                       </div>
                    </motion.section>
                 )}

                 {activeTab === 'security' && (
                    <motion.section key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-2xl p-10 border border-slate-200 shadow-sm">
                       <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-8">Security Settings</h2>
                       <div className="space-y-4">
                          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-xl border border-slate-100 group">
                             <div className="flex items-center gap-6">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100"><Lock size={20} /></div>
                                <div>
                                   <p className="text-sm font-bold text-slate-900">Two-Factor Authentication</p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status: Disabled</p>
                                </div>
                             </div>
                             <button className="text-xs font-bold text-indigo-600 px-4 py-2 hover:bg-white rounded-lg transition-all">Enable</button>
                          </div>
                          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-xl border border-slate-100 group">
                             <div className="flex items-center gap-6">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100"><Shield size={20} /></div>
                                <div>
                                   <p className="text-sm font-bold text-slate-900">Current Session</p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status: Active</p>
                                </div>
                             </div>
                             <button className="text-xs font-bold text-slate-400 px-4 py-2 hover:bg-white rounded-lg transition-all">Details</button>
                          </div>
                       </div>
                    </motion.section>
                 )}

                 {activeTab === 'billing' && (
                    <motion.section key="billing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-2xl p-10 border border-slate-200 shadow-sm">
                       <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-8">Billing & Subscription</h2>
                       <div className="p-10 bg-indigo-600 rounded-2xl mb-8 text-center shadow-lg relative overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
                          <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-[0.3em] mb-4 relative">Active Plan</p>
                          <p className="text-4xl font-black text-white mb-6 relative uppercase">{profile?.plan_tier || 'STARTER'}</p>
                          <button onClick={() => setIsUpgradeModalOpen(true)} className="relative inline-block px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-md text-[10px] font-bold uppercase tracking-widest transition-all">Change Plan</button>
                       </div>
                       <div className="space-y-4">
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Transaction History</p>
                          <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-tight">No payment history found.</p>
                          </div>
                       </div>
                    </motion.section>
                 )}
              </AnimatePresence>
           </div>
        </main>
      </div>

      {/* Modern Upgrade Modal */}
      <AnimatePresence>
         {isUpgradeModalOpen && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
               <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-3xl p-10 w-full max-w-4xl shadow-2xl relative">
                  <button onClick={() => setIsUpgradeModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-all"><X size={24} /></button>
                  
                  <div className="text-center mb-10">
                     <h3 className="text-2xl font-bold text-slate-900 mb-2">Choose your plan</h3>
                     <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Current: <span className="text-indigo-600">{profile?.plan_tier || 'starter'}</span></p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                     {PLANS.map(plan => (
                        <div key={plan.id} className={`p-8 border rounded-2xl flex flex-col transition-all ${plan.highlight ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-200 bg-white'}`}>
                           <div className="flex-1">
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">{plan.name}</h4>
                              <div className="flex items-baseline gap-1 mb-6">
                                 <span className="text-3xl font-bold text-slate-900">₹{plan.price}</span>
                                 {plan.price !== 'Custom' && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/mo</span>}
                              </div>
                              <ul className="space-y-4 mb-8">
                                 {plan.features.map((f, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                       <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                       <span className="text-xs font-semibold text-slate-600">{f}</span>
                                    </li>
                                 ))}
                              </ul>
                           </div>
                           <button 
                             disabled={isUpgrading || profile?.plan_tier === plan.id}
                             onClick={() => handleUpgrade(plan.id)}
                             className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 ${plan.highlight ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} disabled:opacity-30`}
                           >
                              {isUpgrading ? <Loader2 className="animate-spin inline-block mr-2" size={14} /> : null}
                              {profile?.plan_tier === plan.id ? 'Current Plan' : plan.price === 'Custom' ? 'Contact Sales' : 'Switch Plan'}
                           </button>
                        </div>
                     ))}
                  </div>
                  <p className="text-center text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">Secure Checkout • 256-bit Encryption Active</p>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  )
}

export default Profile

