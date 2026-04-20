import React, { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, User, MessageSquare, Loader2, Calendar, Layout, Info, Bookmark, Bug, Zap, Clock, ChevronRight } from 'lucide-react'

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
            className="fixed inset-0 z-[150] bg-slate-900/30 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-white z-[160] shadow-2xl flex flex-col border-l border-slate-200"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 <Layout size={14} />
                 <span>Project</span>
                 <ChevronRight size={10} />
                 <span className="text-indigo-600">{getStatusLabel(ticket.status)}</span>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-10 custom-scrollbar">
               <div>
                  <div className="flex items-center gap-2 mb-4">
                    {TYPE_ICONS[ticket.type || 'task']}
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Task - {ticket.id.slice(0, 4)}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug mb-8">
                    {ticket.title}
                  </h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Priority</p>
                       <div className={`text-xs font-bold uppercase flex items-center gap-1.5 ${ticket.priority === 'high' ? 'text-rose-600' : 'text-indigo-600'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${ticket.priority === 'high' ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>
                          {ticket.priority}
                       </div>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Points</p>
                       <div className="text-xs font-bold text-slate-900">
                          {ticket.points || 0} Story Points
                       </div>
                    </div>
                  </div>
               </div>

               <section>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Info size={14} /> Description
                  </h3>
                  <div className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                    {ticket.description || 'No detailed description provided.'}
                  </div>
               </section>

               <section className="space-y-6">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <MessageSquare size={14} /> Activity ({comments.length})
                  </h3>
                  
                  <div className="space-y-6">
                    {loading ? (
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Loader2 size={16} className="animate-spin"/> Syncing...</div>
                    ) : comments.map(c => (
                      <div key={c.id} className="flex gap-4">
                         <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-[10px] font-bold">
                            {c.user_id.slice(0, 1).toUpperCase()}
                         </div>
                         <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                               <span className="text-xs font-bold text-slate-900">Member</span>
                               <span className="text-[10px] text-slate-400 font-medium"> {new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl rounded-tl-none border border-slate-100">{c.text}</p>
                         </div>
                      </div>
                    ))}
                  </div>
               </section>
            </div>

            <div className="p-6 bg-white border-t border-slate-100">
              <form onSubmit={handleSend} className="flex gap-3">
                <input 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
                  placeholder="Leave a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button 
                  disabled={sending || !newComment.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl disabled:opacity-30 transition-all active:scale-95 shadow-md shadow-indigo-600/20"
                >
                   {sending ? <Loader2 className="animate-spin"/> : <Send size={20}/>}
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
