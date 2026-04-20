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
  LayoutGrid, Layout, Calendar
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

  const filtered = tickets.filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
  const completionRate = Math.round((tickets.filter(t => t.status === 'done').length / (tickets.length || 1)) * 100)
  const getUserInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'

  const renderPeople = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-5xl">
       <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100"><Users size={24}/></div>
                <div>
                   <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Team Members</h2>
                   <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Project Access Registry</p>
                </div>
             </div>
             <button 
               onClick={() => setIsInviteModalOpen(true)}
               className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2"
             >
                <Mail size={16} /> Send Invitation
             </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {members.map(m => (
                <div key={m.id} className="p-6 bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all group rounded-2xl flex items-center gap-4">
                   <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-indigo-600 font-bold border border-slate-200 shadow-sm">{m.user_email.charAt(0).toUpperCase()}</div>
                   <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate mb-0.5">{m.user_email}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.role}</p>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  )

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Mission</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col h-screen overflow-hidden font-sans">
      {/* Refined Pro Navbar */}
      <nav className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between z-50 shrink-0">
        <div className="flex items-center gap-10">
          <Link to="/dashboard">
            <Logo />
          </Link>
          <div className="hidden md:flex items-center gap-6">
             {['board', 'backlog', 'roadmap'].map(v => (
               <button key={v} onClick={() => setView(v)} className={`text-xs font-bold uppercase tracking-widest transition-all relative ${view === v ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-950'}`}>
                 {v}
                 {view === v && <motion.div layoutId="nav-underline-detail" className="absolute -bottom-1 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />}
               </button>
             ))}
          </div>
        </div>
        <div className="flex items-center gap-5">
          <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm">
            <Plus size={16} /> New Task
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1" />
          <button onClick={() => setIsChatOpen(!isChatOpen)} className={`p-2 transition-all ${isChatOpen ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-900'}`}><MessageSquare size={20} /></button>
          <Link to="/profile" className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-indigo-600 text-xs font-black border border-slate-200 hover:bg-indigo-100 transition-colors">
             {getUserInitials(profile?.full_name)}
          </Link>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Compact Pro Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-6 hidden lg:flex">
          <div className="flex-1 space-y-8">
            <div className="space-y-1">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">View</p>
               {[
                 { id: 'board', label: 'Task Board', icon: <LayoutGrid size={18}/> },
                 { id: 'backlog', label: 'Backlog', icon: <List size={18}/> },
                 { id: 'roadmap', label: 'Roadmap', icon: <Calendar size={18}/> }
               ].map(item => (
                 <button key={item.id} onClick={() => setView(item.id)} className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${view === item.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                   {item.icon} {item.label}
                 </button>
               ))}
            </div>

            <div className="space-y-1">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Project Control</p>
               {[
                 { id: 'reports', label: 'Analytics', icon: <Activity size={18}/> },
                 { id: 'people', label: 'Members', icon: <Users size={18}/>, adminOnly: true }
               ].map(item => {
                 if (item.adminOnly && userRole !== 'admin') return null;
                 return (
                   <button key={item.id} onClick={() => setView(item.id)} className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${view === item.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                     {item.icon} {item.label}
                   </button>
                 )
               })}
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Project</p>
             <p className="text-xs font-bold text-slate-900 truncate">{project?.title}</p>
          </div>
        </aside>

        {/* Board Area */}
        <main className={`flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50 transition-all duration-500 ${isChatOpen ? 'mr-96' : ''}`}>
           <div className="max-w-[1600px] mx-auto h-full">
              <div className="flex items-center justify-between mb-10">
                 <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">{project?.title || 'Loading...'}</h1>
                    <div className="flex items-center gap-4">
                       <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 uppercase tracking-widest">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Live Sync
                       </span>
                       <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 uppercase tracking-widest">Progress: {completionRate}%</span>
                    </div>
                 </div>
                 <div className="relative group">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input className="bg-white border border-slate-200 rounded-xl px-11 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none w-72 transition-all shadow-sm" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
                 </div>
              </div>

              {view === 'board' ? (
                 <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <div className="flex gap-6 h-full min-w-max pb-20">
                       {COLUMNS.map(col => (
                         <div key={col.id} className="w-80 flex flex-col h-full rounded-2xl">
                            <div className="px-4 py-3 flex items-center justify-between mb-4 bg-white/50 border border-slate-200 rounded-xl backdrop-blur-sm">
                               <div className="flex items-center gap-2.5">
                                  <div className={`w-2.5 h-2.5 rounded-full ${col.color}`}></div>
                                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">{col.title}</h3>
                               </div>
                               <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{filtered.filter(t => t.status === col.id).length}</span>
                            </div>
                            <Droppable droppableId={col.id}>
                               {(provided, snapshot) => (
                                 <div {...provided.droppableProps} ref={provided.innerRef} className={`flex-1 min-h-[500px] p-2 space-y-3 rounded-2xl transition-colors duration-300 ${snapshot.isDraggingOver ? 'bg-indigo-50/50' : ''}`}>
                                    {filtered.filter(t => t.status === col.id).map((ticket, index) => (
                                      <Draggable key={ticket.id} draggableId={ticket.id} index={index}>
                                        {(provided, snapshot) => (
                                          <div 
                                            ref={provided.innerRef} 
                                            {...provided.draggableProps} 
                                            {...provided.dragHandleProps} 
                                            onClick={() => { if(!snapshot.isDragging) { setSelectedTicket(ticket); setIsDetailOpen(true); } }}
                                            className={`bg-white rounded-xl p-4 transition-all group relative border ${snapshot.isDragging ? 'shadow-2xl border-indigo-500 rotate-1 scale-105 z-50' : 'border-slate-200 hover:border-indigo-400 hover:shadow-md'}`}
                                            style={{ ...provided.draggableProps.style, transition: snapshot.isDragging ? 'none' : 'border 0.2s, box-shadow 0.2s, transform 0.2s' }}
                                          >
                                             <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                   {TYPE_ICONS[ticket.priority === 'high' ? 'bug' : 'task']}
                                                   <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">#{ticket.id.slice(0, 4)}</span>
                                                </div>
                                                <div className={`w-2 h-2 rounded-full ${ticket.priority === 'high' ? 'bg-rose-500' : 'bg-slate-300'}`}></div>
                                             </div>
                                             <h4 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors tracking-tight mb-4">{ticket.title}</h4>
                                             <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                                <div className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center text-[9px] font-black text-white">
                                                   {getUserInitials(profile?.full_name)}
                                                </div>
                                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{ticket.points || 0} PTS</div>
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
                 <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 h-full">
                    {view === 'roadmap' && (
                      <div className="bg-white border border-slate-200 p-10 rounded-3xl shadow-sm relative overflow-hidden">
                         <div className="space-y-8">
                            {filtered.map(t => (
                              <div key={t.id} className="flex items-center gap-8 group">
                                 <div className="w-64 text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors truncate">{t.title}</div>
                                 <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: t.status === 'done' ? '100%' : t.status === 'in_progress' ? '50%' : '10%' }} className={`h-full rounded-full ${t.status === 'done' ? 'bg-emerald-500' : t.status === 'in_progress' ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                                 </div>
                                 <div className="w-24 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.status.replace('_', ' ')}</div>
                              </div>
                            ))}
                         </div>
                      </div>
                    )}
                    {view === 'backlog' && (
                      <div className="grid grid-cols-1 gap-3">
                         {filtered.map(t => (
                           <div key={t.id} onClick={() => { setSelectedTicket(t); setIsDetailOpen(true); }} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between group hover:border-indigo-400 transition-all cursor-pointer">
                              <div className="flex items-center gap-6">
                                 <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all text-slate-400">{TYPE_ICONS[t.type || 'task']}</div>
                                 <span className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{t.title}</span>
                              </div>
                              <div className={`text-[10px] font-bold px-4 py-1.5 rounded-lg border tracking-widest uppercase ${t.priority === 'high' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>{t.priority}</div>
                           </div>
                         ))}
                      </div>
                    )}
                    {view === 'reports' && (
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
                          <div className="bg-white border border-slate-200 p-10 rounded-3xl shadow-sm">
                             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mb-10">Status Distribution</h3>
                             <div className="space-y-10">
                                {[
                                  { l: 'To Do', v: tickets.filter(t => t.status === 'todo').length, c: 'bg-slate-300' },
                                  { l: 'In Progress', v: tickets.filter(t => t.status === 'in_progress').length, c: 'bg-indigo-600' },
                                  { l: 'Done', v: tickets.filter(t => t.status === 'done').length, c: 'bg-emerald-500' }
                                ].map(s => (
                                  <div key={s.l}>
                                     <div className="flex justify-between font-bold text-[10px] uppercase mb-4 tracking-widest text-slate-500"><span>{s.l}</span><span>{Math.round((s.v / (tickets.length || 1)) * 100)}%</span></div>
                                     <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${s.c} transition-all duration-1000`} style={{ width: `${(s.v/(tickets.length || 1))*100}%` }} />
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </div>
                          <div className="bg-slate-900 rounded-3xl p-10 text-center flex flex-col justify-center relative shadow-xl overflow-hidden group">
                             <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent"></div>
                             <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-indigo-400 mb-6 relative">Project Health</p>
                             <div className="text-8xl font-black text-white tracking-tighter leading-none mb-4 group-hover:scale-110 transition-transform duration-700 relative">{completionRate}%</div>
                             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 relative">Completion Status</p>
                          </div>
                       </div>
                    )}
                    {view === 'people' && renderPeople()}
                 </div>
              )}
           </div>
        </main>

        <div className={`fixed top-0 right-0 bottom-0 w-96 z-50 transform transition-all duration-500 ease-in-out ${isChatOpen ? 'translate-x-0 bg-white border-l border-slate-200 shadow-2xl' : 'translate-x-full'}`}>
           <div className="h-full relative overflow-hidden">
              {isChatOpen && <ProjectChat projectId={projectId} planTier={profile?.plan_tier} />}
           </div>
        </div>
      </div>

      <TicketDetailModal isOpen={isDetailOpen} ticket={selectedTicket} onClose={() => setIsDetailOpen(false)} />

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 bg-gray-950/40 backdrop-blur-3xl">
            <motion.div initial={{ scale: 0.8, opacity: 0, rotateX: 20 }} animate={{ scale: 1, opacity: 1, rotateX: 0 }} exit={{ scale: 0.8, opacity: 0, rotateX: -20 }} transition={{ type: 'spring', damping: 20 }} className="bg-white rounded-[64px] w-full max-w-3xl shadow-[0_60px_120px_-20px_rgba(0,0,0,0.4)] border border-white/60 overflow-hidden relative">
              <div className="px-20 py-12 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-6">
                   <div className="w-14 h-14 bg-indigo-600 rounded-[20px] flex items-center justify-center text-white shadow-glow"><Cpu size={32}/></div>
                   <h2 className="text-4xl font-black text-gray-950 tracking-tighter uppercase leading-none">Create Task</h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-rose-500 p-4 hover:bg-rose-50 rounded-[24px] transition-all"><X size={32} /></button>
              </div>
              <form onSubmit={handleCreate} className="p-20 space-y-16">
                <div className="space-y-6">
                   <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.5em] px-4">Task Title</p>
                   <input required className="w-full bg-gray-50 border border-gray-100 rounded-[32px] px-12 py-7 text-lg font-black focus:bg-white outline-none transition-all shadow-inner focus:ring-1 focus:ring-indigo-100 placeholder:font-normal placeholder:text-gray-300" placeholder="Enter task title..." value={newTicket.title} onChange={e => setNewTicket({ ...newTicket, title: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-12">
                  <CustomDropdown label="Asset Protocol" value={newTicket.type} onChange={val => setNewTicket({ ...newTicket, type: val })} options={[{ value: 'task', label: 'TASK' }, { value: 'bug', label: 'BUG' }, { value: 'story', label: 'STORY' }]} />
                  <CustomDropdown label="Urgency Weight" value={newTicket.priority} onChange={val => setNewTicket({ ...newTicket, priority: val })} options={[{ value: 'low', label: 'LOW' }, { value: 'medium', label: 'STANDARD' }, { value: 'high', label: 'CRITICAL' }]} />
                </div>
                <div className="flex justify-end gap-12 pt-12">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="text-[12px] font-black text-gray-400 uppercase tracking-[0.6em] hover:text-rose-500 transition-colors">Discard</button>
                  <button type="submit" className="bg-indigo-600 text-white px-16 py-7 rounded-[32px] font-black text-[11px] uppercase tracking-[0.6em] hover:scale-105 shadow-glow active:scale-95 transition-all">Create Task</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl relative border border-slate-200 overflow-hidden"
            >
               <button 
                 onClick={() => {
                   setIsInviteModalOpen(false)
                   setInviteSent(false)
                   setIsSendingInvite(false)
                 }} 
                 className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-all z-10"
               >
                 <X size={20} />
               </button>
               
               <AnimatePresence mode="wait">
                 {!inviteSent ? (
                   <motion.div key="invite-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="flex items-center gap-3 mb-8">
                         <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                           <Mail size={20} />
                         </div>
                         <div>
                           <h2 className="text-xl font-bold text-slate-900 tracking-tight">Email Invitation</h2>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Automatic Delivery System</p>
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
                      }} className="space-y-6">
                         <div className="space-y-1.5">
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Recipient Email</label>
                           <input 
                             required
                             disabled={isSendingInvite}
                             type="email" 
                             placeholder="colleague@company.com"
                             value={inviteEmail}
                             onChange={(e) => setInviteEmail(e.target.value)}
                             className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-semibold shadow-sm disabled:opacity-50"
                           />
                         </div>

                         <button 
                           type="submit"
                           disabled={isSendingInvite}
                           className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                         >
                           {isSendingInvite ? (
                             <>
                               <Loader2 size={16} className="animate-spin" />
                               Processing Delivery...
                             </>
                           ) : (
                             <>
                               <Send size={14} /> Send Automatic Invite
                             </>
                           )}
                         </button>
                         <p className="text-[10px] text-center font-bold text-slate-300 uppercase tracking-widest">Powered by TaskForge Mail Infrastructure</p>
                      </form>
                   </motion.div>
                 ) : (
                   <motion.div 
                     key="success-state" 
                     initial={{ opacity: 0, scale: 0.9 }} 
                     animate={{ opacity: 1, scale: 1 }} 
                     className="text-center py-6"
                   >
                     <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-sm">
                        <CheckCircle2 size={40} />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 mb-2">Invite Dispatched</h3>
                     <p className="text-sm font-medium text-slate-500 mb-8 px-4">
                       The collaboration request has been sent to **{inviteEmail}**. They will be able to join via your project link.
                     </p>
                     <button 
                       onClick={() => {
                         setIsInviteModalOpen(false)
                         setInviteSent(false)
                         setInviteEmail('')
                       }}
                       className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                     >
                       Close Panel
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

