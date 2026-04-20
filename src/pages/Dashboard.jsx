import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { projectService } from '../services/projectService'
import { useAuthStore } from '../store/useAuthStore'
import { 
  Plus, Search, LayoutGrid, LogOut, Loader2, 
  Bell, ChevronRight, Clock, Briefcase, Zap, X, 
  Terminal, Box, Target, Activity, Shield, Rocket, User, Settings
} from 'lucide-react'
import { toast } from 'react-toastify'
import Logo from '../components/Logo'

const Dashboard = () => {
  const { user, profile, fetchProfile, signOut } = useAuthStore()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [newProj, setNewProj] = useState({ title: '', desc: '' })
  const [creating, setCreating] = useState(false)
  
  useEffect(() => {
    if (user) {
      fetchProfile(user.id)
      fetchProjects()
    }
  }, [user])

  const fetchProjects = async () => {
    try {
      const data = await projectService.getProjects()
      setProjects(data || [])
    } catch (err) {
      toast.error('Sync failed')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await projectService.createProject(newProj.title, newProj.desc)
      toast.success('Project created')
      setShowModal(false)
      setNewProj({ title: '', desc: '' })
      fetchProjects()
    } catch (err) {
      toast.error('Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  const filtered = projects.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  const getUserInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col h-screen overflow-hidden">
      {/* Refined Pro Navbar */}
      <nav className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between z-50 shrink-0">
        <div className="flex items-center gap-10">
          <Link to="/dashboard">
            <Logo />
          </Link>
          <div className="hidden md:flex items-center gap-6">
             {['Projects', 'Team', 'Activity'].map(v => (
               <button key={v} className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                 {v}
               </button>
             ))}
          </div>
        </div>
        <div className="flex items-center gap-5">
          <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm">
            <Plus size={16} /> New Project
          </button>
          <div className="w-px h-6 bg-slate-200 mx-2" />
          <button className="text-slate-400 hover:text-slate-900 transition-colors"><Bell size={20} /></button>
          <button className="text-slate-400 hover:text-slate-900 transition-colors"><Settings size={20} /></button>
          <Link to="/profile" className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-indigo-600 text-xs font-black border border-slate-200 hover:bg-indigo-50 transition-colors">
             {getUserInitials(profile?.full_name)}
          </Link>
          <button onClick={() => signOut()} className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><LogOut size={20} /></button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Compact Pro Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-6 hidden lg:flex">
          <div className="flex-1 space-y-8">
            <div className="space-y-1">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Workspace</p>
               {[
                 { id: 'projects', label: 'Projects', icon: <LayoutGrid size={18}/> },
                 { id: 'activity', label: 'Activity', icon: <Activity size={18}/> },
                 { id: 'tasks', label: 'Tasks', icon: <Target size={18}/> }
               ].map(item => (
                 <button key={item.id} className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${item.id === 'projects' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                   {item.icon} {item.label}
                 </button>
               ))}
            </div>

            <div className="space-y-1">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Team</p>
               {[
                 { id: 'people', label: 'Members', icon: <User size={18}/> },
                 { id: 'security', label: 'Security', icon: <Shield size={18}/> }
               ].map(item => (
                 <button key={item.id} className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                   {item.icon} {item.label}
                 </button>
               ))}
            </div>
          </div>
          
          <div className="mt-auto p-4 bg-slate-50 rounded-2xl border border-slate-100">
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Plan</p>
             <p className="text-xs font-bold text-indigo-600 uppercase">{profile?.plan_tier || 'STARTER'} TIER</p>
          </div>
        </aside>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50">
           <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-10">
                 <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Projects</h1>
                    <p className="text-sm text-slate-500 font-medium">Manage and track your active project workspace.</p>
                 </div>
                 <div className="relative group">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input className="bg-white border border-slate-200 rounded-xl px-11 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none w-72 transition-all shadow-sm" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} />
                 </div>
              </div>

              {/* Grid Layout for Projects */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
                 {loading ? (
                    <div className="col-span-full flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
                 ) : filtered.length > 0 ? (
                    filtered.map(proj => (
                       <Link 
                         key={proj.id}
                         to={`/project/${proj.id}`}
                         className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 relative"
                       >
                          <div className="flex items-center justify-between mb-6">
                            <div className="w-11 h-11 bg-slate-100 text-indigo-600 rounded-xl flex items-center justify-center text-lg font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all">
                               {proj.title.charAt(0).toUpperCase()}
                            </div>
                            <ChevronRight className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" size={20} />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mb-1 truncate tracking-tight">{proj.title}</h3>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Active Project</p>
                          <div className="mt-6 flex items-center gap-2">
                             <div className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center text-[10px] font-black text-white">
                                {getUserInitials(profile?.full_name)}
                             </div>
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Managed by you</span>
                          </div>
                       </Link>
                    ))
                 ) : (
                    <div className="col-span-full bg-white border-2 border-dashed border-slate-200 rounded-3xl p-24 text-center">
                       <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No projects found in your workspace</p>
                       <button onClick={() => setShowModal(true)} className="mt-4 text-indigo-600 font-bold text-sm hover:underline">Create your first project</button>
                    </div>
                 )}
              </div>
           </div>
        </main>
      </div>

      {/* Simplified Pro Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white"><Plus size={20}/></div>
                   <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create New Project</h2>
                </div>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
              </div>
              
              <form onSubmit={handleCreate} className="p-8 space-y-6">
                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Project Name</label>
                   <input required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="e.g. Marketing Campaign 2026" value={newProj.title} onChange={e => setNewProj({ ...newProj, title: e.target.value })} />
                </div>
                <div className="pt-4 flex justify-end gap-4">
                  <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
                  <button type="submit" disabled={creating} className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 active:scale-95">
                     {creating ? <Loader2 className="animate-spin" size={18} /> : 'Create Project'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Dashboard

