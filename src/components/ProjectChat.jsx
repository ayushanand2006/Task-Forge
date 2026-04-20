import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../store/useAuthStore'
import { Send, Loader2, MessageSquare, Lock, X, Zap } from 'lucide-react'
import { toast } from 'react-toastify'

const ProjectChat = ({ projectId, planTier }) => {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const scrollRef = useRef()

  const CHAT_LIMIT = planTier === 'starter' ? 20 : Infinity
  const isLimitReached = messages.length >= CHAT_LIMIT && planTier === 'starter'

  useEffect(() => {
    fetchMessages()
    const channel = supabase
      .channel(`chat-${projectId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `project_id=eq.${projectId}` }, (payload) => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [projectId])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchMessages = async () => {
    try {
      const { data } = await supabase.from('messages').select('*').eq('project_id', projectId).order('created_at', { ascending: true })
      setMessages(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMsg.trim()) return
    if (isLimitReached) {
      toast.warning('Message limit reached for Starter plan.')
      return
    }

    setSending(true)
    try {
      await supabase.from('messages').insert([{
        project_id: projectId,
        user_id: user.id,
        text: newMsg
      }])
      setNewMsg('')
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
         <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
               <MessageSquare size={18} />
            </div>
            <div>
               <h3 className="text-sm font-bold text-slate-900 tracking-tight">Team Chat</h3>
               {planTier === 'starter' && (
                  <p className="text-[9px] font-bold text-orange-500 uppercase tracking-widest mt-0.5">
                     {messages.length} / {CHAT_LIMIT} messages
                  </p>
               )}
            </div>
         </div>
         <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Live</span>
         </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/10">
         {messages.length > 0 ? messages.map((m, i) => (
            <div key={m.id} className={`flex flex-col ${m.user_id === user.id ? 'items-end' : 'items-start'}`}>
               <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed border shadow-sm ${m.user_id === user.id ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none' : 'bg-white text-slate-700 border-slate-200 rounded-tl-none'}`}>
                  {m.text}
               </div>
               <span className="text-[9px] text-slate-400 font-bold uppercase mt-2 px-1">
                  {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </span>
            </div>
         )) : (
            <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200 m-4">
               <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest italic leading-tight">No messages yet</p>
            </div>
         )}
         <div ref={scrollRef}></div>
      </div>

      {/* Footer / Input */}
      <div className="p-6 border-t border-slate-100 bg-white">
         {isLimitReached ? (
            <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-100">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-white text-orange-600 rounded-full text-[9px] font-bold uppercase tracking-widest border border-orange-100 mb-2">
                  <Lock size={10} /> Plan Limit
               </div>
               <p className="text-[11px] text-slate-600 font-medium mb-4">
                  Reached the limit for Starter plan projects.
               </p>
               <button className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20">
                  <Zap size={14} fill="currentColor" /> Upgrade Workspace
               </button>
            </div>
         ) : (
            <form onSubmit={handleSend} className="relative">
               <input 
                 className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-medium shadow-sm"
                 placeholder="Type a message..."
                 value={newMsg}
                 onChange={(e) => setNewMsg(e.target.value)}
               />
               <button 
                 disabled={sending || !newMsg.trim()}
                 className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white rounded-lg transition-all shadow-md active:scale-95 shadow-indigo-600/10"
               >
                 {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
               </button>
            </form>
         )}
      </div>
    </div>
  )
}

export default ProjectChat
