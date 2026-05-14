import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { ticketService } from '../services/ticketService'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../store/useAuthStore'
import { 
  Plus, Search, Filter, 
  Settings, User, MessageSquare,
  Loader2, Trash2, List, BarChart2, Globe,  
  Bug, ChevronRight, X, Bell,
  PieChart, Activity, Users, UserPlus, Shield, TrendingUp, BarChart,
  Layers, AlertTriangle, CheckCircle2, Circle, Mail, Copy, Send, UserMinus,
  Settings2, Hash, Sparkles, Command, Cpu, Box, Rocket, Terminal, Target,
  LayoutGrid, Layout, Calendar, Clock, Zap, Menu, ChevronLeft, MoreVertical, Edit3
} from 'lucide-react'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import TicketDetailModal from '../components/TicketDetailModal'
import ProjectChat from '../components/ProjectChat'
import CustomDropdown from '../components/CustomDropdown'
import Logo from '../components/Logo'

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-400', text: 'text-slate-600', glow: 'shadow-slate-500/10' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-indigo-600', text: 'text-indigo-600', glow: 'shadow-indigo-500/20' },
  { id: 'done', title: 'Done', color: 'bg-emerald-600', text: 'text-emerald-600', glow: 'shadow-emerald-500/20' }
]

const TYPE_ICONS = {
  task: <Box size={14} className="text-indigo-400" />,
  bug: <Bug size={14} className="text-rose-400" />,
  story: <Sparkles size={14} className="text-emerald-400" />
}

const ProjectDetail = () => {
  const { projectId } = useParams()
  const { user, profile, fetchProfile } = useAuthStore()
  const [project, setProject] = useState(null)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [view, setView] = useState('board')
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTicket, setNewTicket] = useState({ title: '', desc: '', priority: 'medium', status: 'todo', type: 'task', points: 0 })
  const [creating, setCreating] = useState(false)
  const [members, setMembers] = useState([])
  const [userRole, setUserRole] = useState('member')
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [isSendingInvite, setIsSendingInvite] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [filterPriority, setFilterPriority] = useState('all')
  const [showTaskActions, setShowTaskActions] = useState(null)
  
  const isSyncLocked = useRef(false)
  const syncChannel = useRef(null)

  useEffect(() => {
    if (user) {
      fetchProfile(user.id)
      fetchData()
      syncChannel.current = supabase.channel(`project-sync-${projectId}`)
      syncChannel.current
        .on('broadcast', { event: 'mission-update' }, ({ payload }) => {
          if (payload.userId !== user.id) {
            toast.info(`${payload.userName}: ${payload.message}`, { position: 'bottom-left' })
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
          if (!isSyncLocked.current) fetchTicketsSilently()
        })
        .subscribe()
      return () => { if (syncChannel.current) supabase.removeChannel(syncChannel.current) }
    }
  }, [projectId, user])

  const fetchData = async () => {
    try {
      const { data: proj } = await supabase.from('projects').select('*').eq('id', projectId).single()
      setProject(proj)
      await fetchTicketsSilently()
      await fetchMembers()
    } catch (err) { toast.error('Sync failure') } finally { setLoading(false) }
  }

  const fetchTicketsSilently = async () => {
    if (isSyncLocked.current) return
    try {
      const data = await ticketService.getTickets(projectId)
      setTickets(data || [])
    } catch (err) { console.error(err) }
  }

  const fetchMembers = async () => {
    try {
      const { data } = await supabase.from('project_members').select('*').eq('project_id', projectId)
      const memberList = data || []
      setMembers(memberList)
      const me = memberList.find(m => m.user_email?.toLowerCase() === user?.email?.toLowerCase())
      if (me) {
        setUserRole(me.role)
      }
    } catch (err) { console.error(err) }
  }

  const handleDragStart = () => {
    isSyncLocked.current = true
  }

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result
    
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      isSyncLocked.current = false
      return
    }

    const newStatus = destination.droppableId
    const oldTickets = [...tickets]
    setTickets(tickets.map(t => t.id === draggableId ? { ...t, status: newStatus } : t))

    try {
      await ticketService.updateStatus(draggableId, newStatus)
      if (syncChannel.current) {
        syncChannel.current.send({
          type: 'broadcast',
          event: 'mission-update',
          payload: { userId: user.id, userName: profile?.full_name || 'User', message: `Updated task to ${newStatus}` }
        })
      }
      setTimeout(() => { isSyncLocked.current = false }, 500)
    } catch (err) {
      setTickets(oldTickets)
      isSyncLocked.current = false
      toast.error('Sync failed')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    isSyncLocked.current = true
    try {
      await ticketService.createTicket({ ...newTicket, project_id: projectId, desc: newTicket.desc })
      toast.success('Task Created')
      setIsModalOpen(false)
      setTimeout(async () => { await fetchTicketsSilently(); isSyncLocked.current = false }, 500)
    } finally { setCreating(false) }
  }

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Erase this task node?')) return
    try {
      await ticketService.deleteTicket(id)
      toast.success('Node Erased')
      fetchTicketsSilently()
    } catch (err) { toast.error('Erasure failed') }
  }

  const filtered = tickets.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase())
    const matchesPriority = filterPriority === 'all' || t.priority === filterPriority
    return matchesSearch && matchesPriority
  })

  const completionRate = Math.round((tickets.filter(t => t.status === 'done').length / (tickets.length || 1)) * 100)
  const getUserInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'

  const renderPeople = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-6xl">
       <div className="bg-white border border-slate-200/60 rounded-[40px] p-6 md:p-12 shadow-premium relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 relative">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center border border-indigo-100 shadow-sm shrink-0"><Users size={28}/></div>
                <div>
                   <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-display">Team Intelligence</h2>
                   <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Authorized Project Collaborators</p>
                </div>
             </div>
             <button 
               onClick={() => setIsInviteModalOpen(true)}
               className="bg-slate-900 text-white px-8 py-4 rounded-[20px] text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-100 flex items-center justify-center gap-3 active:scale-95 whitespace-nowrap"
             >
                <UserPlus size={18} /> Induction Protocol
             </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
             {members.map(m => (
                <div key={m.id} className="p-6 md:p-8 bg-[#FBFBFE] border border-slate-200/60 hover:border-indigo-400 transition-all group rounded-[32px] flex items-center gap-5 shadow-sm hover:shadow-md">
                   <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 font-black border border-slate-200 shadow-sm text-lg group-hover:scale-110 transition-transform">
                     {m.user_email.charAt(0).toUpperCase()}
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-base font-black text-slate-900 truncate mb-1">{m.user_email.split('@')[0]}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{m.role} Tier Access</p>
                   </div>
                   <div className="p-2 text-slate-300 hover:text-indigo-600 transition-colors shrink-0">
                      <Shield size={18} />
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  )

  if (loading) return (
    <div className="min-h-screen bg-[#FBFBFE] flex flex-col items-center justify-center">
      <div className="relative w-20 h-20 mb-8">
         <div className="absolute inset-0 border-4 border-indigo-50 rounded-full"></div>
         <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Initializing Mission Area</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FBFBFE] text-slate-900 flex flex-col h-screen overflow-hidden font-sans">
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
          <div className="hidden lg:flex items-center gap-8">
             {['board', 'backlog', 'roadmap'].map(v => (
               <button key={v} onClick={() => setView(v)} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all relative py-2 ${view === v ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-950'}`}>
                 {v}
                 {view === v && <motion.div layoutId="nav-underline-detail" className="absolute -bottom-1 left-0 w-full h-1 bg-indigo-600 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.4)]" />}
               </button>
             ))}
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-6">
          <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 text-white px-5 md:px-7 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-3 shadow-xl shadow-slate-100 active:scale-95">
            <Plus size={18} strokeWidth={3} className="shrink-0" /> <span className="hidden xs:inline">New Task</span>
          </button>
          <div className="w-px h-8 bg-slate-200 mx-2 hidden sm:block" />
          <div className="flex items-center gap-2">
            <button onClick={() => setIsChatOpen(!isChatOpen)} className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all ${isChatOpen ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-inner' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'}`}>
              <MessageSquare size={22} />
            </button>
            <button className="hidden xs:flex w-11 h-11 items-center justify-center rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
              <Bell size={22} />
            </button>
          </div>
          <Link to="/profile" className="ml-2">
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-[20px] bg-indigo-600 text-white flex items-center justify-center text-sm font-black border-4 border-white shadow-xl hover:scale-105 transition-transform">
               {getUserInitials(profile?.full_name)}
            </div>
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
                <div className="flex-1 space-y-10">
                   <div className="space-y-3">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-4">Operations</p>
                      {[
                        { id: 'board', label: 'Mission Board', icon: <LayoutGrid size={20}/> },
                        { id: 'backlog', label: 'Tactical Backlog', icon: <List size={20}/> },
                        { id: 'roadmap', label: 'Strategic Roadmap', icon: <Calendar size={20}/> }
                      ].map(item => (
                        <button key={item.id} onClick={() => { setView(item.id); setIsMobileSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-[14px] font-bold transition-all ${view === item.id ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                          {item.icon} {item.label}
                        </button>
                      ))}
                   </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col p-8 hidden lg:flex z-50">
          <div className="flex-1 space-y-10">
            <div className="space-y-2">
               <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-4">Operations</p>
               {[
                 { id: 'board', label: 'Mission Board', icon: <LayoutGrid size={20}/> },
                 { id: 'backlog', label: 'Tactical Backlog', icon: <List size={20}/> },
                 { id: 'roadmap', label: 'Strategic Roadmap', icon: <Calendar size={20}/> }
               ].map(item => (
                 <button key={item.id} onClick={() => setView(item.id)} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-[14px] font-bold transition-all ${view === item.id ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                   {item.icon} {item.label}
                 </button>
               ))}
            </div>

            <div className="space-y-2">
               <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-4">Intelligence</p>
               {[
                 { id: 'reports', label: 'Data Analytics', icon: <Activity size={20}/> },
                 { id: 'people', label: 'Team Network', icon: <Users size={20}/>, adminOnly: true }
               ].map(item => {
                 if (item.adminOnly && userRole !== 'admin') return null;
                 return (
                   <button key={item.id} onClick={() => setView(item.id)} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-[14px] font-bold transition-all ${view === item.id ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
                     {item.icon} {item.label}
                   </button>
                 )
               })}
            </div>
          </div>
          
          <div className="p-6 bg-[#FBFBFE] rounded-[28px] border border-slate-200/60 shadow-inner-glow mt-auto">
             <div className="flex items-center gap-3 mb-3">
               <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm"><Target size={16} className="text-indigo-600"/></div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Objective</p>
             </div>
             <p className="text-[15px] font-black text-slate-900 truncate leading-tight">{project?.title}</p>
             <div className="mt-4 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${completionRate}%` }}></div>
             </div>
          </div>
        </aside>

        {/* Board Area */}
        <main className={`flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar bg-[#FBFBFE] transition-all duration-700 ${isChatOpen ? 'lg:mr-96' : ''}`}>
           <div className="max-w-[1500px] mx-auto h-full">
              <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-12">
                 <div>
                    <div className="flex items-center gap-3 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                       <Hash size={14} className="text-indigo-400" /> Workspace Induction
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight font-display mb-4">{project?.title || 'Loading...'}</h1>
                    <div className="flex flex-wrap items-center gap-4 md:gap-5">
                       <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 uppercase tracking-widest shadow-sm">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> SYNC ACTIVE
                       </div>
                       <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 uppercase tracking-widest shadow-sm">
                          <TrendingUp size={14} /> Completion Index: {completionRate}%
                       </div>
                    </div>
                 </div>
                 <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="w-56">
                       <CustomDropdown 
                         value={filterPriority} 
                         onChange={setFilterPriority}
                         options={[
                           { value: 'all', label: 'ALL PRIORITY' },
                           { value: 'high', label: 'CRITICAL NODES' },
                           { value: 'medium', label: 'STANDARD FLOW' },
                           { value: 'low', label: 'LOW WEIGHT' }
                         ]}
                         icon={Filter}
                       />
                    </div>
                    <div className="relative group min-w-[280px]">
                       <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                       <input className="w-full bg-white border border-slate-200/80 rounded-[20px] pl-14 pr-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-premium" placeholder="Filter intelligence..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                 </div>
              </div>

              {view === 'board' ? (
                 <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <div className="flex gap-6 md:gap-8 h-full overflow-x-auto pb-24 scrollbar-hide">
                       {COLUMNS.map(col => (
                         <div key={col.id} className="min-w-[320px] md:w-[360px] flex flex-col h-full rounded-[32px]">
                            <div className="px-6 py-4 flex items-center justify-between mb-6 bg-white/50 border border-slate-200/60 rounded-2xl backdrop-blur-md shadow-sm">
                               <div className="flex items-center gap-3">
                                  <div className={`w-3 h-3 rounded-full ${col.color} shadow-[0_0_8px_rgba(0,0,0,0.1)]`}></div>
                                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">{col.title}</h3>
                               </div>
                               <span className="text-[11px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200/60">{filtered.filter(t => t.status === col.id).length}</span>
                            </div>
                            <Droppable droppableId={col.id}>
                               {(provided, snapshot) => (
                                 <div {...provided.droppableProps} ref={provided.innerRef} className={`flex-1 min-h-[600px] p-3 space-y-5 rounded-[32px] transition-all duration-500 ${snapshot.isDraggingOver ? 'bg-indigo-50/40 ring-2 ring-indigo-500/20 ring-inset shadow-inner' : 'bg-transparent'}`}>
                                    {filtered.filter(t => t.status === col.id).map((ticket, index) => (
                                      <Draggable key={ticket.id} draggableId={ticket.id} index={index}>
                                        {(provided, snapshot) => (
                                          <div 
                                            ref={provided.innerRef} 
                                            {...provided.draggableProps} 
                                            {...provided.dragHandleProps} 
                                            onClick={() => { if(!snapshot.isDragging) { setSelectedTicket(ticket); setIsDetailOpen(true); } }}
                                            className={`bg-white rounded-3xl p-6 transition-all group relative border-2 ${snapshot.isDragging ? 'shadow-2xl border-indigo-500 -rotate-1 scale-105 z-[100]' : 'border-transparent hover:border-indigo-100 shadow-premium hover:shadow-indigo-500/10'}`}
                                            style={{ ...provided.draggableProps.style }}
                                          >
                                             <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2.5">
                                                   <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors border border-slate-100">
                                                      {TYPE_ICONS[ticket.type || 'task']}
                                                   </div>
                                                   <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.1em]">#{ticket.id.slice(0, 8).toUpperCase()}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                   <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${ticket.priority === 'high' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                                                     {ticket.priority}
                                                   </div>
                                                   <div className="relative">
                                                     <button 
                                                       onClick={(e) => { e.stopPropagation(); setShowTaskActions(showTaskActions === ticket.id ? null : ticket.id) }} 
                                                       className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-300 hover:text-slate-900"
                                                     >
                                                        <MoreVertical size={16} />
                                                     </button>
                                                     <AnimatePresence>
                                                        {showTaskActions === ticket.id && (
                                                          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute right-0 mt-2 w-36 bg-white border border-slate-200 rounded-xl shadow-2xl z-[110] p-1.5">
                                                             <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(ticket.id) }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 text-[10px] font-black uppercase tracking-widest transition-all">
                                                                <Trash2 size={14} /> Erase Node
                                                             </button>
                                                          </motion.div>
                                                        )}
                                                     </AnimatePresence>
                                                   </div>
                                                </div>
                                             </div>
                                             <h4 className="text-[15px] font-black text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors tracking-tight mb-6">{ticket.title}</h4>
                                             <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                                                <div className="flex -space-x-2">
                                                   <div className="w-8 h-8 rounded-xl bg-indigo-600 border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-sm">
                                                      {getUserInitials(profile?.full_name)}
                                                   </div>
                                                   <div className="w-8 h-8 rounded-xl bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm">
                                                      +3
                                                   </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                                  <Zap size={12} className="text-amber-500" /> {ticket.points || 0} PTS
                                                </div>
                                             </div>
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}
                                 </div>
                               )}
                            </Droppable>
                         </div>
                       ))}
                    </div>
                 </DragDropContext>
              ) : (
                 <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 h-full pb-20">
                    {view === 'roadmap' && (
                      <div className="bg-white border border-slate-200/60 p-6 md:p-12 rounded-[40px] shadow-premium relative overflow-hidden">
                         <div className="flex items-center gap-4 mb-12">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 shadow-sm"><Calendar size={24}/></div>
                            <div>
                               <h2 className="text-2xl font-black text-slate-900 tracking-tight font-display">Strategic Roadmap</h2>
                               <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Operational Timeline Tracking</p>
                            </div>
                         </div>
                         <div className="space-y-10 overflow-x-auto">
                            {filtered.map(t => (
                              <div key={t.id} className="flex items-center gap-6 md:gap-10 group min-w-[600px]">
                                 <div className="w-48 md:w-72 text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors truncate font-display tracking-tight">{t.title}</div>
                                 <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 shadow-inner">
                                    <motion.div initial={{ width: 0 }} animate={{ width: t.status === 'done' ? '100%' : t.status === 'in_progress' ? '50%' : '15%' }} className={`h-full rounded-full shadow-[0_0_15px_rgba(0,0,0,0.1)] ${t.status === 'done' ? 'bg-emerald-500 shadow-emerald-500/20' : t.status === 'in_progress' ? 'bg-indigo-600 shadow-indigo-600/20' : 'bg-slate-300 shadow-slate-300/20'}`} />
                                 </div>
                                 <div className={`w-24 md:w-32 text-right text-[10px] font-black uppercase tracking-widest ${t.status === 'done' ? 'text-emerald-600' : t.status === 'in_progress' ? 'text-indigo-600' : 'text-slate-400'}`}>{t.status.replace('_', ' ')}</div>
                              </div>
                            ))}
                         </div>
                      </div>
                    )}
                    {view === 'backlog' && (
                      <div className="grid grid-cols-1 gap-4">
                         {filtered.map(t => (
                           <div key={t.id} onClick={() => { setSelectedTicket(t); setIsDetailOpen(true); }} className="p-6 bg-white border border-slate-200/60 rounded-[28px] flex flex-col sm:flex-row sm:items-center justify-between gap-6 group hover:border-indigo-400 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:shadow-indigo-500/5">
                              <div className="flex items-center gap-6 md:gap-8">
                                 <div className="w-14 h-14 bg-[#FBFBFE] border border-slate-200/60 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all text-slate-400 shadow-inner-glow shrink-0">{TYPE_ICONS[t.type || 'task']}</div>
                                 <div>
                                    <span className="text-base md:text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors font-display tracking-tight block mb-1">{t.title}</span>
                                    <div className="flex items-center gap-3">
                                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">#{t.id.slice(0, 8).toUpperCase()}</span>
                                       <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.status.replace('_', ' ')}</span>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-6">
                                 <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                    <Zap size={14} className="text-amber-500" /> {t.points || 0} PTS
                                 </div>
                                 <div className={`text-[10px] font-black px-5 py-2 rounded-xl border tracking-widest uppercase shadow-sm ${t.priority === 'high' ? 'bg-rose-50 text-rose-600 border border-rose-100 shadow-rose-100' : 'bg-slate-50 text-slate-500 border-slate-200 shadow-slate-100'}`}>{t.priority}</div>
                              </div>
                           </div>
                         ))}
                      </div>
                    )}
                    {view === 'reports' && (
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 pb-20">
                          <div className="bg-white border border-slate-200/60 p-8 md:p-12 rounded-[40px] shadow-premium">
                             <div className="flex items-center gap-4 mb-12">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100"><BarChart size={24}/></div>
                                <div>
                                   <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-display">Induction Analytics</h2>
                                   <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Status Distribution Vector</p>
                                </div>
                             </div>
                             <div className="space-y-12">
                                {[
                                  { l: 'To Do', v: tickets.filter(t => t.status === 'todo').length, c: 'bg-slate-300' },
                                  { l: 'In Progress', v: tickets.filter(t => t.status === 'in_progress').length, c: 'bg-indigo-600 shadow-indigo-500/40' },
                                  { l: 'Done', v: tickets.filter(t => t.status === 'done').length, c: 'bg-emerald-500 shadow-emerald-500/40' }
                                ].map(s => (
                                  <div key={s.l}>
                                     <div className="flex justify-between font-black text-[11px] uppercase mb-5 tracking-[0.2em] text-slate-500">
                                       <span className="flex items-center gap-2">
                                          <div className={`w-2.5 h-2.5 rounded-full ${s.c}`}></div> {s.l}
                                       </span>
                                       <span>{Math.round((s.v / (tickets.length || 1)) * 100)}%</span>
                                     </div>
                                     <div className="h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner p-1">
                                        <div className={`h-full rounded-full ${s.c} transition-all duration-1000 shadow-lg`} style={{ width: `${(s.v/(tickets.length || 1))*100}%` }} />
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </div>
                          <div className="bg-slate-900 rounded-[40px] p-10 md:p-16 text-center flex flex-col justify-center relative shadow-2xl overflow-hidden group">
                             <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent pointer-events-none"></div>
                             <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px]"></div>
                             <p className="text-[12px] font-black uppercase tracking-[0.6em] text-indigo-400 mb-8 relative">Efficiency Index</p>
                             <div className="text-7xl md:text-[120px] font-black text-white tracking-tighter leading-none mb-6 group-hover:scale-110 transition-transform duration-1000 relative font-display">
                               {completionRate}<span className="text-2xl md:text-4xl text-indigo-500">%</span>
                             </div>
                             <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 relative mt-4">Operational Status</p>
                             <div className="mt-12 flex justify-center gap-8 relative">
                                <div className="text-center">
                                   <div className="text-xl md:text-2xl font-black text-white mb-1">{tickets.length}</div>
                                   <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Nodes</div>
                                </div>
                                <div className="w-px h-10 bg-white/10"></div>
                                <div className="text-center">
                                   <div className="text-xl md:text-2xl font-black text-emerald-400 mb-1">{tickets.filter(t => t.status === 'done').length}</div>
                                   <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Resolved</div>
                                </div>
                             </div>
                          </div>
                       </div>
                    )}
                    {view === 'people' && renderPeople()}
                 </div>
              )}
           </div>
        </main>

        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 bottom-0 w-full md:w-[420px] z-[100] bg-white border-l border-slate-200 shadow-[0_0_80px_rgba(0,0,0,0.15)]"
            >
               <div className="h-full relative overflow-hidden bg-white">
                  <div className="absolute top-8 right-8 z-[110]">
                     <button onClick={() => setIsChatOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                       <X size={20} />
                     </button>
                  </div>
                  <ProjectChat projectId={projectId} planTier={profile?.plan_tier} />
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <TicketDetailModal isOpen={isDetailOpen} ticket={selectedTicket} onClose={() => setIsDetailOpen(false)} />

      {/* Modal - Create Task */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 bg-slate-950/60 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 40 }} 
              className="bg-white rounded-[40px] md:rounded-[48px] w-full max-w-2xl shadow-[0_80px_160px_-40px_rgba(0,0,0,0.5)] border border-slate-200/60 overflow-y-auto max-h-[90vh] md:overflow-hidden relative"
            >
              <div className="px-8 md:px-14 py-10 md:py-10 border-b border-slate-100 flex items-center justify-between bg-[#FBFBFE]">
                <div className="flex items-center gap-6">
                   <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-900 text-white rounded-[20px] md:rounded-[24px] flex items-center justify-center shadow-2xl shadow-slate-200"><Rocket size={30} strokeWidth={2.5}/></div>
                   <div>
                      <h2 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight font-display">Forge New Node</h2>
                      <p className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Operational Task Creation</p>
                   </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"><X size={24} /></button>
              </div>
              <form onSubmit={handleCreate} className="p-8 md:p-14 space-y-8 md:space-y-10">
                <div className="space-y-3">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Objective Directive</label>
                   <input required className="w-full bg-[#FBFBFE] border border-slate-200 rounded-[24px] md:rounded-[28px] px-6 md:px-8 py-4 md:py-5 text-base md:text-[17px] font-black text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-inner-glow placeholder:font-medium placeholder:text-slate-300" placeholder="Define the task objective..." value={newTicket.title} onChange={e => setNewTicket({ ...newTicket, title: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Asset Class</label>
                     <CustomDropdown value={newTicket.type} onChange={val => setNewTicket({ ...newTicket, type: val })} options={[{ value: 'task', label: 'STANDARD TASK' }, { value: 'bug', label: 'BUG REPORT' }, { value: 'story', label: 'USER STORY' }]} />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Urgency Node</label>
                     <CustomDropdown value={newTicket.priority} onChange={val => setNewTicket({ ...newTicket, priority: val })} options={[{ value: 'low', label: 'LOW PRIORITY' }, { value: 'medium', label: 'MEDIUM WEIGHT' }, { value: 'high', label: 'CRITICAL NODE' }]} />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 md:pt-10 border-t border-slate-100">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] hover:text-rose-500 transition-colors">Abort Mission</button>
                   <button type="submit" className="w-full md:w-auto bg-slate-900 text-white px-10 md:px-12 py-5 rounded-[24px] md:rounded-3xl font-black text-[12px] uppercase tracking-[0.3em] hover:bg-indigo-600 shadow-2xl shadow-slate-100 active:scale-95 transition-all flex items-center justify-center gap-3">
                      Initialize Node <ChevronRight size={18} strokeWidth={3} />
                   </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 bg-slate-950/60 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="bg-white rounded-[40px] p-8 md:p-12 w-full max-w-lg shadow-[0_80px_160px_-40px_rgba(0,0,0,0.4)] relative border border-slate-200/60 overflow-hidden"
            >
               <button 
                 onClick={() => {
                   setIsInviteModalOpen(false)
                   setInviteSent(false)
                   setIsSendingInvite(false)
                 }} 
                 className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-900 transition-all z-10"
               >
                 <X size={20} />
               </button>
               
               <AnimatePresence mode="wait">
                 {!inviteSent ? (
                    <motion.div key="invite-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                       <div className="flex items-center gap-5 mb-10">
                          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 flex items-center justify-center shadow-sm">
                             <Mail size={24} />
                          </div>
                          <div>
                             <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-display">Personnel Induction</h2>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Authorized expansion</p>
                          </div>
                       </div>

                       <form onSubmit={async (e) => {
                         e.preventDefault()
                         setIsSendingInvite(true)
                         
                         try {
                            const response = await fetch("https://api.web3forms.com/submit", {
                               method: "POST",
                               headers: {
                                 "Content-Type": "application/json",
                                 Accept: "application/json",
                               },
                               body: JSON.stringify({
                                 access_key: import.meta.env.VITE_WEB3FORMS_KEY,
                                 subject: `Collaboration Invitation: ${project?.title}`,
                                 from_name: "TaskForge Agent",
                                 email: inviteEmail,
                                 message: `Hello team! You have been invited to collaborate on the "${project?.title}" workspace on TaskForge. Click the link below to join and start managing your tasks.

Join here: ${window.location.origin}/register?invite=${projectId}

Sent via TaskForge Professional AI System.`,
                               }),
                            });

                            const result = await response.json();
                            if (result.success) {
                               setInviteSent(true);
                               toast.success(`Invitation dispatched to ${inviteEmail}`);
                            } else {
                               throw new Error(result.message || 'Dispatch failure');
                            }
                         } catch (err) {
                            console.error(err);
                            toast.error('Automated dispatch failed. Please verify API configuration.');
                         } finally {
                            setIsSendingInvite(false)
                         }
                       }} className="space-y-8">
                          <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Recipient Email</label>
                            <input 
                              required
                              disabled={isSendingInvite}
                              type="email" 
                              placeholder="colleague@company.com"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              className="w-full bg-[#FBFBFE] border border-slate-200 rounded-[24px] py-5 px-8 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-base font-bold shadow-inner-glow disabled:opacity-50"
                            />
                          </div>

                          <button 
                            type="submit"
                            disabled={isSendingInvite}
                            className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-100 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                          >
                            {isSendingInvite ? (
                              <>
                                <Loader2 size={18} className="animate-spin" />
                                INDUCTING...
                              </>
                            ) : (
                              <>
                                EXECUTE DISPATCH <Send size={16} />
                              </>
                            )}
                          </button>
                          <div className="flex items-center justify-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] pt-4">
                             <Shield size={12} className="text-emerald-500" /> SECURE DISPATCH PROTOCOL
                          </div>
                       </form>
                    </motion.div>
                 ) : (
                    <motion.div 
                      key="success-state" 
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      className="text-center py-8"
                    >
                      <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-emerald-100 shadow-xl shadow-emerald-50 relative">
                         <CheckCircle2 size={48} />
                         <div className="absolute -top-2 -right-2 bg-white rounded-full p-1.5 border border-emerald-100 shadow-sm">
                           <Sparkles size={16} className="text-amber-500" />
                         </div>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-3 font-display">Induction Dispatched</h3>
                      <p className="text-sm md:text-base font-medium text-slate-500 mb-12 px-6">
                        Mission invitation has been successfully routed to **{inviteEmail}**.
                      </p>
                      <button 
                        onClick={() => {
                          setIsInviteModalOpen(false)
                          setInviteSent(false)
                          setInviteEmail('')
                        }}
                        className="w-full bg-slate-900 hover:bg-emerald-600 text-white py-5 rounded-[24px] font-black text-sm uppercase tracking-widest transition-all shadow-2xl active:scale-95"
                      >
                        Acknowledge & Close
                      </button>
                    </motion.div>
                 )}
               </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProjectDetail
