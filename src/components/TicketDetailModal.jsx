import React, { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, User, MessageSquare, Loader2, Calendar, Layout, Info, Bookmark, Bug, Zap, Clock, ChevronRight, Hash } from 'lucide-react'

const TYPE_ICONS = {
  task: <Bookmark size={14} className="text-indigo-600" />,
  bug: <Bug size={14} className="text-rose-500" />,
  story: <Zap size={14} className="text-emerald-500" />
}

const TicketDetailModal = ({ ticket, isOpen, onClose }) => {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (isOpen && ticket) {
      fetchComments()
      const channel = supabase
        .channel(`ticket-${ticket.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: `ticket_id=eq.${ticket.id}` }, (payload) => {
          setComments(prev => [...prev, payload.new])
        })
        .subscribe()
      return () => supabase.removeChannel(channel)
    }
  }, [isOpen, ticket])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from('comments').select('*').eq('ticket_id', ticket.id).order('created_at', { ascending: true })
      setComments(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setSending(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('comments').insert([{
        ticket_id: ticket.id,
        user_id: user.id,
        text: newComment
      }])
      setNewComment('')
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const getStatusLabel = (status) => {
    switch(status) {
      case 'todo': return 'To Do';
      case 'in_progress': return 'In Progress';
      case 'done': return 'Done';
      default: return status.replace('_', ' ');
    }
  }

  return (
    <AnimatePresence>
      {isOpen && ticket && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[150] bg-slate-950/60 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full md:max-w-xl bg-white z-[160] shadow-2xl flex flex-col border-l border-slate-200"
          >
            <div className="px-6 md:px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-[#FBFBFE]">
              <div className="flex items-center gap-2 md:gap-2.5 text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                 <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                   <Layout size={14} className="text-slate-400" />
                 </div>
                 <span className="hidden xs:inline">Workspace</span>
                 <ChevronRight size={12} className="hidden xs:inline" />
                 <span className="text-indigo-600">{getStatusLabel(ticket.status)}</span>
              </div>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-2xl text-slate-400 hover:text-slate-950 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200 active:scale-90">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 space-y-10 md:space-y-12 custom-scrollbar">
               <div>
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-black text-slate-400 flex items-center gap-1.5 border border-slate-200">
                       <Hash size={12} strokeWidth={3} /> {ticket.id.slice(0, 8).toUpperCase()}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                       {TYPE_ICONS[ticket.type || 'task']}
                       {ticket.type || 'Task'}
                    </div>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight leading-tight mb-8 font-display">
                    {ticket.title}
                  </h2>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 bg-[#FBFBFE] border border-slate-200/60 rounded-[20px] shadow-inner-glow">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Priority</p>
                       <div className={`text-[11px] font-black uppercase flex items-center gap-2 ${ticket.priority === 'high' ? 'text-rose-600' : 'text-indigo-600'}`}>
                          <div className={`w-2 h-2 rounded-full ${ticket.priority === 'high' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]' : 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]'}`}></div>
                          {ticket.priority || 'Medium'}
                       </div>
                    </div>
                    <div className="p-4 bg-[#FBFBFE] border border-slate-200/60 rounded-[20px] shadow-inner-glow">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Estimate</p>
                       <div className="text-[11px] font-black text-slate-900 flex items-center gap-2">
                          <Zap size={14} className="text-amber-500" />
                          {ticket.points || 0} Points
                       </div>
                    </div>
                    <div className="p-4 bg-[#FBFBFE] border border-slate-200/60 rounded-[20px] shadow-inner-glow">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Assignee</p>
                       <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[9px] font-black uppercase">
                            M
                          </div>
                          <span className="text-[11px] font-bold text-slate-900">Member</span>
                       </div>
                    </div>
                    <div className="p-4 bg-[#FBFBFE] border border-slate-200/60 rounded-[20px] shadow-inner-glow">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Timeline</p>
                       <div className="text-[11px] font-bold text-slate-900 flex items-center gap-2">
                          <Clock size={14} className="text-slate-300" />
                          Just now
                       </div>
                    </div>
                  </div>
               </div>

               <section>
                  <h3 className="text-[10px] font-black text-slate-950 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                    <Info size={16} className="text-indigo-600" /> Mission Brief
                  </h3>
                  <div className="text-[15px] text-slate-600 leading-relaxed bg-[#FBFBFE] p-6 rounded-2xl border border-slate-200/60 font-medium shadow-inner-glow">
                    {ticket.description || 'No operational briefing provided for this node.'}
                  </div>
               </section>

               <section className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h3 className="text-[10px] font-black text-slate-950 uppercase tracking-[0.3em] flex items-center gap-3">
                      <MessageSquare size={16} className="text-indigo-600" /> Intelligence Stream ({comments.length})
                    </h3>
                  </div>
                  
                  <div className="space-y-8 pb-10">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <div className="w-8 h-8 border-3 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Synchronizing Activity...</p>
                      </div>
                    ) : comments.length > 0 ? (
                      comments.map(c => (
                        <div key={c.id} className="flex gap-4 group">
                           <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black uppercase shrink-0 shadow-lg shadow-slate-100">
                              {c.user_id.slice(0, 1).toUpperCase()}
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                 <span className="text-[13px] font-black text-slate-950">Team Personnel</span>
                                 <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                                 <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider"> {new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                              <div className="text-[14px] text-slate-600 bg-white p-5 rounded-[24px] border border-slate-200/60 shadow-premium font-medium leading-relaxed">
                                {c.text}
                              </div>
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-20 text-center bg-[#FBFBFE] rounded-[32px] border-2 border-dashed border-slate-200">
                        <MessageSquare size={32} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em]">Zero intelligence gathered</p>
                      </div>
                    )}
                  </div>
               </section>
            </div>

            <div className="p-6 md:p-8 bg-white border-t border-slate-100">
              <form onSubmit={handleSend} className="flex gap-4">
                <div className="flex-1 relative">
                  <input 
                    className="w-full bg-[#FBFBFE] border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-inner-glow placeholder:text-slate-300"
                    placeholder="Broadcast intelligence..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={sending || !newComment.trim()}
                  className="bg-slate-900 hover:bg-indigo-600 text-white px-6 rounded-2xl disabled:opacity-30 transition-all active:scale-95 shadow-xl shadow-slate-100 flex items-center justify-center shrink-0"
                >
                   {sending ? <Loader2 className="animate-spin" size={20}/> : <Send size={20} strokeWidth={3} />}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default TicketDetailModal
