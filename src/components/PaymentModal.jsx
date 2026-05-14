import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CreditCard, ShieldCheck, Loader2, CheckCircle2, 
  ArrowRight, X, Lock, CreditCardIcon, Sparkles, Zap
} from 'lucide-react'

const PaymentModal = ({ isOpen, plan, onClose, onFinish }) => {
  const [step, setStep] = useState('checkout') // checkout, processing, success
  
  const handlePayment = (e) => {
    e.preventDefault()
    setStep('processing')
    setTimeout(() => {
      setStep('success')
    }, 2500)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4 md:p-6 bg-slate-950/70 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-[40px] shadow-[0_80px_160px_-40px_rgba(0,0,0,0.5)] overflow-hidden relative border border-slate-200/60"
      >
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-950 transition-all z-10 p-2 hover:bg-slate-50 rounded-xl">
          <X size={24} />
        </button>

        <div className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            {step === 'checkout' && (
              <motion.div 
                key="checkout"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center gap-5 mb-10">
                  <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200 shrink-0">
                    <CreditCard size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-950 tracking-tight font-display">Finalize Upgrade</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{plan.name} Protocol Activation</p>
                  </div>
                </div>

                <div className="bg-[#FBFBFE] p-6 md:p-8 rounded-[32px] mb-10 border border-slate-200/60 shadow-inner-glow relative overflow-hidden">
                  <div className="relative z-10 flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <Sparkles size={18} className="text-indigo-600" />
                      <span className="text-base md:text-lg font-black text-slate-900 uppercase tracking-tight">{plan.name} Plan</span>
                    </div>
                    <span className="text-2xl md:text-3xl font-black text-slate-950">₹{plan.price}</span>
                  </div>
                  <div className="relative z-10 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">
                    <span>Industrial Tier Node</span>
                    <span className="text-emerald-600 flex items-center gap-2 font-black"><ShieldCheck size={14} /> SECURE</span>
                  </div>
                </div>

                <form onSubmit={handlePayment} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Card Infrastructure</label>
                    <div className="relative">
                       <CreditCardIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                       <input 
                         required
                         type="text" 
                         placeholder="4242 4242 4242 4242"
                         className="w-full bg-[#FBFBFE] border border-slate-200 rounded-[24px] py-5 pl-16 pr-6 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-mono text-base font-bold tracking-[0.1em] shadow-inner-glow placeholder:text-slate-200"
                       />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Expiry</label>
                       <input required type="text" placeholder="MM/YY" className="w-full bg-[#FBFBFE] border border-slate-200 rounded-[24px] py-5 px-6 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-mono text-base font-bold text-center shadow-inner-glow placeholder:text-slate-200" />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">CVC Node</label>
                       <input required type="text" placeholder="•••" className="w-full bg-[#FBFBFE] border border-slate-200 rounded-[24px] py-5 px-6 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-mono text-base font-bold text-center shadow-inner-glow placeholder:text-slate-200" />
                    </div>
                  </div>

                  <div className="pt-8">
                    <button 
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-6 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-100 transition-all active:scale-95 flex items-center justify-center gap-4"
                    >
                      Authorize Payment <ArrowRight size={20} strokeWidth={3} />
                    </button>
                    <div className="flex items-center justify-center gap-3 mt-10 text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">
                       <Lock size={14} className="text-emerald-500" /> AES-256 BIT ENCRYPTION
                    </div>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div 
                key="processing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-20 flex flex-col items-center justify-center text-center"
              >
                <div className="relative w-28 h-28 mb-12">
                   <div className="absolute inset-0 border-[6px] border-indigo-50 rounded-full"></div>
                   <div className="absolute inset-0 border-[6px] border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Zap className="text-indigo-600 animate-pulse" size={40} strokeWidth={2.5} />
                   </div>
                </div>
                <h3 className="text-3xl font-black text-slate-950 mb-3 font-display tracking-tight">Synchronizing Funds</h3>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Executing secure financial handshake</p>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center"
              >
                <div className="w-28 h-28 bg-emerald-50 text-emerald-500 rounded-[40px] flex items-center justify-center mx-auto mb-10 border border-emerald-100 shadow-xl shadow-emerald-50 relative">
                   <CheckCircle2 size={56} strokeWidth={2.5} />
                   <div className="absolute -top-3 -right-3 bg-white rounded-full p-2 border border-emerald-100 shadow-sm">
                     <Sparkles size={20} className="text-amber-500" />
                   </div>
                </div>
                <h3 className="text-4xl font-black text-slate-950 mb-4 font-display tracking-tight">Forge Upgraded</h3>
                <p className="text-base md:text-lg font-medium text-slate-500 leading-relaxed mb-12 px-6">
                  System protocol successful. Your workspace has been initialized with <span className="text-indigo-600 font-black">**{plan.name.toUpperCase()}**</span> capabilities.
                </p>
                <button 
                  onClick={() => {
                    onFinish()
                    onClose()
                  }}
                  className="w-full bg-slate-900 hover:bg-emerald-600 text-white py-6 rounded-[24px] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-slate-100 transition-all active:scale-95"
                >
                  Enter Workspace Hub
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

export default PaymentModal
