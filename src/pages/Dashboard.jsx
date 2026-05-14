import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { projectService } from '../services/projectService'
import { ticketService } from '../services/ticketService'
import { useAuthStore } from '../store/useAuthStore'
import { supabase } from '../services/supabase'
import { 
  Plus, Search, LayoutGrid, LogOut, Loader2, 
  Bell, ChevronRight, Clock, Briefcase, Zap, X, 
  Terminal, Box, Target, Activity, Shield, Rocket, User, Settings,
  Filter, MoreVertical, Calendar, CheckCircle2, TrendingUp, Menu, 
  ChevronLeft, Trash2, Edit3, Mail, Info, MessageSquare, Cpu,
  Users, ShieldCheck
} from 'lucide-react'
import { toast } from 'react-toastify'
import Logo from '../components/Logo'
import CustomDropdown from '../components/CustomDropdown'

const Dashboard = () => {
  const { user, profile, fetchProfile, signOut } = useAuthStore()
  const [projects, setProjects] = useState([])
  const [allTasks, setAllTasks] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [newProj, setNewProj] = useState({ title: '', desc: '' })
  const [creating, setCreating] = useState(false)
  const [activeTab, setActiveTab] = useState('projects')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [filterPriority, setFilterPriority] = useState('all')
  const [showProjectActions, setShowProjectActions] = useState(null)
  const [allMembers, setAllMembers] = useState([])
  const [updatingSettings, setUpdatingSettings] = useState(false)
  const [settingsForm, setSettingsForm] = useState({ fullName: '', planTier: '' })
  
  useEffect(() => {
    if (user) {
      fetchProfile(user.id)
      fetchAllData()
    }
  }, [user])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const projData = await projectService.getProjects()
      setProjects(projData || [])
      
      // Fetch all tasks for "My Tasks"
      const { data: tasks } = await supabase.from('tickets').select('*, projects(title)').order('created_at', { ascending: false })
      setAllTasks(tasks || [])

      // Fetch recent messages for "Activity"
      const { data: activity } = await supabase.from('messages').select('*, projects(title)').order('created_at', { ascending: false }).limit(10)
      setRecentActivity(activity || [])

      // Fetch all team members across projects
      const projectIds = projData.map(p => p.id)
      if (projectIds.length > 0) {
        const { data: members } = await supabase.from('project_members').select('*').in('project_id', projectIds)
        // Filter unique members by email
        const uniqueMembers = Array.from(new Set(members?.map(m => m.user_email))).map(email => {
          return members.find(m => m.user_email === email)
        })
        setAllMembers(uniqueMembers || [])
      }

      setSettingsForm({
        fullName: profile?.full_name || '',
        planTier: profile?.plan_tier || 'Starter'
      })

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
      fetchAllData()
    } catch (err) {
      toast.error('Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure? This will delete all tasks and members.')) return
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) throw error
      toast.success('Project decommissioned')
      fetchAllData()
    } catch (err) {
      toast.error('Deletion failed')
    }
  }

  const handleUpdateSettings = async (e) => {
    e.preventDefault()
    setUpdatingSettings(true)
    try {
      const { error } = await supabase.from('profiles').update({ full_name: settingsForm.fullName }).eq('id', user.id)
      if (error) throw error
      toast.success('System parameters updated')
      fetchProfile(user.id)
    } catch (err) {
      toast.error('Settings update failed')
    } finally {
      setUpdatingSettings(false)
    }
  }

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  const getUserInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'

  const stats = [
    { label: 'Active Projects', value: projects.length, icon: <Briefcase size={16} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Tasks', value: allTasks.length, icon: <CheckCircle2 size={16} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Team Velocity', value: '84%', icon: <TrendingUp size={16} />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ]

  const menuItems = [
    { id: 'projects', label: 'Projects', icon: <LayoutGrid size={18}/> },
    { id: 'activity', label: 'Recent Activity', icon: <Activity size={18}/> },
    { id: 'calendar', label: 'Schedule', icon: <Calendar size={18}/> },
    { id: 'tasks', label: 'My Tasks', icon: <Target size={18}/> }
  ]

  const adminItems = [
    { id: 'team', label: 'Team Members', icon: <User size={18}/> },
    { id: 'settings', label: 'System Settings', icon: <Settings size={18}/> }
  ]

  return (
    <div className="min-h-screen bg-[#FBFBFE] text-slate-900 font-sans flex flex-col h-screen overflow-hidden">
      {/* Top Navigation */}
      <header className="h-20 bg-white border-b border-slate-200/60 px-6 md:px-10 flex items-center justify-between z-[60] shrink-0">
        <div className="flex items-center gap-4 md:gap-12">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link to="/dashboard" className="hover:scale-105 transition-transform shrink-0">
            <Logo />
          </Link>
          <div className="hidden lg:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
             <button onClick={() => setActiveTab('projects')} className={`${activeTab === 'projects' ? 'text-indigo-600' : 'hover:text-slate-900'} transition-colors`}>Overview</button>
             <button onClick={() => setActiveTab('team')} className={`${activeTab === 'team' ? 'text-indigo-600' : 'hover:text-slate-900'} transition-colors`}>Team Hub</button>
             <button onClick={() => setActiveTab('settings')} className={`${activeTab === 'settings' ? 'text-indigo-600' : 'hover:text-slate-900'} transition-colors`}>Resource Node</button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-6">
          <div className="hidden sm:flex items-center bg-slate-50 rounded-2xl px-4 py-2 border border-slate-200/60 shadow-inner-glow group focus-within:border-indigo-400 transition-all">
             <Search size={16} className="text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
             <input 
               type="text" 
               placeholder="Search nodes..." 
               className="bg-transparent border-none outline-none text-[13px] font-bold w-24 md:w-40 ml-3 placeholder:text-slate-300"
               value={search}
               onChange={e => setSearch(e.target.value)}
             />
          </div>

          <button className="w-11 h-11 flex items-center justify-center rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all relative">
            <Bell size={20} />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-indigo-600 rounded-full border-2 border-white shadow-sm"></span>
          </button>
          
          <div className="w-px h-8 bg-slate-200 mx-1 hidden xs:block"></div>
          
          <div className="flex items-center gap-4 pl-1">
            <div className="text-right hidden md:block">
              <p className="text-[13px] font-black text-slate-900 leading-tight tracking-tight">{profile?.full_name || 'User'}</p>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.1em]">{profile?.plan_tier || 'Starter'} PROTOCOL</p>
            </div>
            <Link to="/profile" className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-sm font-black border-4 border-white shadow-premium hover:scale-105 transition-transform">
               {getUserInitials(profile?.full_name)}
            </Link>
          </div>
          
          <button onClick={() => signOut()} className="p-2 text-slate-300 hover:text-rose-600 transition-all active:scale-90"><LogOut size={20} /></button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-slate-200/60 flex flex-col hidden lg:flex z-50">
          <div className="p-8">
            <button 
              onClick={() => setShowModal(true)}
              className="w-full bg-slate-900 text-white py-4 rounded-[20px] font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl shadow-slate-100 active:scale-95"
            >
              <Plus size={18} strokeWidth={3} /> Initialize Project
            </button>
          </div>

          <nav className="flex-1 px-6 space-y-2 overflow-y-auto custom-scrollbar">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] px-4 mb-4 mt-2">Operations</p>
            {menuItems.map(item => (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-[14px] font-bold transition-all ${activeTab === item.id ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                {item.icon} {item.label}
              </button>
            ))}

            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] px-4 mb-4 mt-10">Administrative</p>
            {adminItems.map(item => (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-[14px] font-bold transition-all ${activeTab === item.id ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
          
          <div className="p-8 mt-auto">
             <div className="p-6 bg-indigo-50 rounded-[32px] border border-indigo-100 relative overflow-hidden group">
               <div className="relative z-10">
                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Infrastructure</p>
                 <p className="text-base font-black text-indigo-700 mb-4">Sync Reliability</p>
                 <div className="w-full h-2 bg-indigo-200/50 rounded-full overflow-hidden mb-2">
                    <div className="w-[98%] h-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.4)]"></div>
                 </div>
                 <p className="text-[10px] font-black text-indigo-400 text-right uppercase tracking-widest">98% Uptime</p>
               </div>
               <Zap className="absolute -bottom-4 -right-4 text-indigo-100/50 group-hover:scale-125 transition-transform duration-700" size={80} />
             </div>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] lg:hidden"
              />
              <motion.aside 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                className="fixed inset-y-0 left-0 w-80 bg-white z-[80] lg:hidden flex flex-col p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-10 px-2">
                  <Logo />
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-xl">
                    <X size={20} />
                  </button>
                </div>
                <button 
                  onClick={() => { setShowModal(true); setIsMobileMenuOpen(false); }}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 mb-10 shadow-xl shadow-slate-100"
                >
                  <Plus size={18} strokeWidth={3} /> Initialize Project
                </button>
                <nav className="flex-1 space-y-2 overflow-y-auto">
                  {menuItems.concat(adminItems).map(item => (
                    <button 
                      key={item.id} 
                      onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-[14px] font-bold transition-all ${activeTab === item.id ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                      {item.icon} {item.label}
                    </button>
                  ))}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 bg-[#FBFBFE]">
           <div className="max-w-6xl mx-auto pb-24">
              <AnimatePresence mode="wait">
                {activeTab === 'projects' && (
                  <motion.div key="projects" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
                       <div>
                          <div className="flex items-center gap-3 text-indigo-600 font-black text-[11px] uppercase tracking-[0.4em] mb-4">
                             <Rocket size={18} /> Mission Control Hub
                          </div>
                          <h1 className="text-4xl font-black text-slate-900 tracking-tight font-display">Workspace Dashboard</h1>
                       </div>
                       <div className="flex items-center gap-4 relative">
                          <div className="w-56">
                            <CustomDropdown 
                              value={filterPriority} 
                              onChange={setFilterPriority}
                              options={[
                                { value: 'all', label: 'ALL PRIORITY' },
                                { value: 'high', label: 'CRITICAL NODES' },
                                { value: 'medium', label: 'STANDARD FLOW' }
                              ]}
                              icon={Filter}
                            />
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                       {stats.map((stat, i) => (
                         <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-premium flex items-center gap-6 group hover:border-indigo-400 hover:shadow-indigo-500/10 transition-all">
                            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner-glow`}>
                               {stat.icon}
                            </div>
                            <div>
                               <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                               <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                            </div>
                         </div>
                       ))}
                    </div>

                    <div className="flex items-center justify-between mb-8">
                       <h2 className="text-2xl font-black text-slate-900 tracking-tight font-display">Active Mission Nodes</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                       {loading ? (
                          <div className="col-span-full py-20 flex flex-col items-center">
                             <Loader2 size={40} className="animate-spin text-indigo-600 mb-4" />
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Synchronizing...</p>
                          </div>
                       ) : filteredProjects.length > 0 ? (
                          filteredProjects.map(proj => (
                            <div key={proj.id} className="group relative">
                              <Link 
                                to={`/project/${proj.id}`}
                                className="block bg-white rounded-[40px] p-10 border border-slate-200/60 hover:border-indigo-400 hover:shadow-premium transition-all duration-500 relative flex flex-col h-72 shadow-sm"
                              >
                                 <div className="flex items-start justify-between mb-auto">
                                   <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[24px] flex items-center justify-center text-2xl font-black group-hover:bg-indigo-600 group-hover:text-white transition-all duration-700 shadow-inner-glow">
                                      {proj.title.charAt(0).toUpperCase()}
                                   </div>
                                 </div>
                                 <div className="mt-10">
                                   <h3 className="text-2xl font-black text-slate-900 mb-2 truncate group-hover:text-indigo-600 transition-colors font-display tracking-tight">{proj.title}</h3>
                                   <div className="flex items-center gap-6 text-slate-400">
                                      <div className="flex items-center gap-2">
                                         <Clock size={16} className="text-slate-300" />
                                         <span className="text-[11px] font-black uppercase tracking-widest">Active</span>
                                      </div>
                                   </div>
                                 </div>
                              </Link>
                              <div className="absolute top-8 right-8">
                                <button 
                                  onClick={(e) => { e.preventDefault(); setShowProjectActions(showProjectActions === proj.id ? null : proj.id) }} 
                                  className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-all text-slate-400 hover:text-slate-900"
                                >
                                  <MoreVertical size={20} />
                                </button>
                                <AnimatePresence>
                                  {showProjectActions === proj.id && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[70] p-2">
                                      <button onClick={() => handleDeleteProject(proj.id)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 text-[12px] font-black uppercase tracking-widest transition-all">
                                        <Trash2 size={16} /> Delete Node
                                      </button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          ))
                       ) : (
                          <div className="col-span-full text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-[48px]">
                             <Box size={48} className="mx-auto text-slate-200 mb-6" />
                             <h3 className="text-2xl font-black text-slate-900 mb-2">No Projects Found</h3>
                             <p className="text-slate-400 font-medium">Initialize a new node to begin operations.</p>
                          </div>
                       )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'activity' && (
                  <motion.div key="activity" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h2 className="text-3xl font-black text-slate-900 mb-10 font-display">Intelligence Stream</h2>
                    <div className="space-y-6">
                      {recentActivity.length > 0 ? recentActivity.map(act => (
                        <div key={act.id} className="bg-white p-6 rounded-[32px] border border-slate-200/60 shadow-premium flex items-start gap-6">
                           <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner-glow"><MessageSquare size={22} /></div>
                           <div>
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-[13px] font-black text-slate-900">Collaboration Event</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(act.created_at).toLocaleDateString()}</span>
                              </div>
                              <p className="text-[15px] font-medium text-slate-600 leading-relaxed mb-3">
                                New intelligence broadcasted within <span className="text-slate-900 font-black">[{act.projects?.title || 'Unknown Node'}]</span>
                              </p>
                              <div className="bg-[#FBFBFE] p-4 rounded-2xl border border-slate-100 text-sm font-bold text-slate-500 italic">"{act.text}"</div>
                           </div>
                        </div>
                      )) : (
                        <div className="text-center py-40">
                           <Activity size={48} className="mx-auto text-slate-200 mb-6" />
                           <p className="text-slate-400 font-black uppercase tracking-widest">No recent intelligence activity</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'tasks' && (
                  <motion.div key="tasks" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h2 className="text-3xl font-black text-slate-900 mb-10 font-display">Assigned Objectives</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {allTasks.length > 0 ? allTasks.map(task => (
                        <Link key={task.id} to={`/project/${task.project_id}`} className="bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-premium hover:border-indigo-400 transition-all group">
                           <div className="flex justify-between items-start mb-6">
                              <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${task.status === 'done' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                {task.status.replace('_', ' ')}
                              </div>
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.projects?.title}</div>
                           </div>
                           <h3 className="text-xl font-black text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors font-display tracking-tight">{task.title}</h3>
                           <div className="flex items-center gap-4 text-slate-400">
                              <div className="flex items-center gap-2">
                                 <Zap size={14} className="text-amber-500" />
                                 <span className="text-[11px] font-black uppercase tracking-widest">{task.points} PTS</span>
                              </div>
                              <div className="flex items-center gap-2">
                                 <Info size={14} />
                                 <span className="text-[11px] font-black uppercase tracking-widest capitalize">{task.priority} Priority</span>
                              </div>
                           </div>
                        </Link>
                      )) : (
                        <div className="col-span-full text-center py-40">
                           <Target size={48} className="mx-auto text-slate-200 mb-6" />
                           <p className="text-slate-400 font-black uppercase tracking-widest">Zero assigned objectives</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'calendar' && (
                  <motion.div key="calendar" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h2 className="text-3xl font-black text-slate-900 mb-10 font-display">Mission Schedule</h2>
                    <div className="bg-white rounded-[40px] border border-slate-200/60 overflow-hidden shadow-premium">
                       <div className="p-8 border-b border-slate-100 bg-[#FBFBFE] flex items-center justify-between">
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Temporal Node Sequence</p>
                          <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                             <Clock size={12} /> Real-time Sync
                          </div>
                       </div>
                       <div className="divide-y divide-slate-50">
                          {allTasks.length > 0 ? allTasks.map(task => (
                            <div key={task.id} className="p-8 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                               <div className="flex items-center gap-6">
                                  <div className="text-[11px] font-black text-slate-400 w-24">
                                     {new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                                  <div>
                                     <p className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{task.title}</p>
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Node ID: {task.id.slice(0, 8)}</p>
                                  </div>
                               </div>
                               <ChevronRight size={18} className="text-slate-200 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                            </div>
                          )) : (
                            <div className="p-20 text-center text-slate-400 font-black uppercase tracking-widest">No scheduled nodes</div>
                          )}
                       </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'team' && (
                  <motion.div key="team" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center justify-between mb-10">
                       <h2 className="text-3xl font-black text-slate-900 font-display tracking-tight">Personnel Intelligence</h2>
                       <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                          <Users size={14} /> {allMembers.length} ACTIVE NODES
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                       {allMembers.length > 0 ? allMembers.map((member, i) => (
                         <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-200/60 shadow-premium group hover:border-indigo-400 transition-all flex flex-col">
                            <div className="flex items-center gap-6 mb-8">
                               <div className="w-16 h-16 bg-slate-50 text-indigo-600 rounded-[24px] flex items-center justify-center text-xl font-black border border-slate-100 shadow-inner-glow group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                  {member.user_email.charAt(0).toUpperCase()}
                               </div>
                               <div>
                                  <p className="text-lg font-black text-slate-900 mb-1">{member.user_email.split('@')[0]}</p>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{member.role} AUTHORITY</p>
                               </div>
                            </div>
                            <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                               <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  <Mail size={14} /> {member.user_email.length > 20 ? member.user_email.slice(0, 17) + '...' : member.user_email}
                                </div>
                                <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><Shield size={18} /></button>
                            </div>
                         </div>
                       )) : (
                         <div className="col-span-full text-center py-40">
                            <Users size={48} className="mx-auto text-slate-200 mb-6" />
                            <p className="text-slate-400 font-black uppercase tracking-widest">No collaborators detected</p>
                         </div>
                       )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'settings' && (
                  <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h2 className="text-3xl font-black text-slate-900 mb-10 font-display tracking-tight">System Parameters</h2>
                    <div className="bg-white rounded-[48px] border border-slate-200/60 shadow-premium overflow-hidden max-w-2xl">
                       <div className="p-10 border-b border-slate-100 bg-[#FBFBFE]">
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Workspace Identity</p>
                          <h3 className="text-xl font-black text-slate-900">Profile Configuration</h3>
                       </div>
                       <form onSubmit={handleUpdateSettings} className="p-10 space-y-8">
                          <div className="space-y-3">
                             <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Display Identity</label>
                             <input 
                               className="w-full bg-[#FBFBFE] border border-slate-200 rounded-2xl px-6 py-4 text-base font-black text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all shadow-inner-glow" 
                               value={settingsForm.fullName} 
                               onChange={e => setSettingsForm({ ...settingsForm, fullName: e.target.value })} 
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Current Tier Access</label>
                             <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-black text-indigo-600 uppercase tracking-widest opacity-70">
                                {settingsForm.planTier} PROTOCOL
                             </div>
                          </div>
                          <div className="pt-6">
                             <button 
                               type="submit" 
                               disabled={updatingSettings}
                               className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3"
                             >
                                {updatingSettings ? <Loader2 size={18} className="animate-spin" /> : <><ShieldCheck size={18} /> Sync System Updates</>}
                             </button>
                          </div>
                       </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </main>
      </div>

      {/* New Project Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/70 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="bg-white rounded-[48px] w-full max-w-xl shadow-2xl border border-slate-200/60 overflow-hidden">
              <div className="px-12 py-10 border-b border-slate-100 flex items-center justify-between bg-[#FBFBFE]">
                <div>
                   <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-2">Protocol 4-A</p>
                   <h2 className="text-3xl font-black text-slate-950 font-display">Initialize Node</h2>
                </div>
                <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-100 transition-all"><X size={24} /></button>
              </div>
              <form onSubmit={handleCreate} className="p-12 space-y-8">
                <div className="space-y-3">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Mission Identifier</label>
                   <input required className="w-full bg-[#FBFBFE] border border-slate-200 rounded-3xl px-8 py-5 text-lg font-black text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all shadow-inner-glow" placeholder="e.g. Project Apollo" value={newProj.title} onChange={e => setNewProj({ ...newProj, title: e.target.value })} />
                </div>
                <div className="space-y-3">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Mission Briefing</label>
                   <textarea rows={3} className="w-full bg-[#FBFBFE] border border-slate-200 rounded-[32px] px-8 py-6 text-[15px] font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all shadow-inner-glow resize-none" placeholder="Primary objectives..." value={newProj.desc} onChange={e => setNewProj({ ...newProj, desc: e.target.value })} />
                </div>
                <button type="submit" disabled={creating} className="w-full bg-slate-900 text-white py-6 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4">
                   {creating ? <Loader2 className="animate-spin" size={24} /> : <><Rocket size={20} /> INITIALIZE MISSION</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Dashboard
