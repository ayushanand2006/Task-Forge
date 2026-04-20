import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CreditCard, ShieldCheck, Loader2, CheckCircle2, 
  ArrowRight, X, Lock, CreditCardIcon
} from 'lucide-react'

const PaymentModal = ({ isOpen, plan, onClose, onFinish }) => {
  const [step, setStep] = useState('checkout') // checkout, processing, success
  
  const handlePayment = (e) => {
    e.preventDefault()
    setStep('processing')
    setTimeout(() => {
      setStep('success')
    }, 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative border border-slate-200"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={20} />
        </button>

        <div className="p-10">
          <AnimatePresence mode="wait">
            {step === 'checkout' && (
              <motion.div 
                key="checkout"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Checkout</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upgrade to {plan.name}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl mb-8 border border-slate-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-slate-700">{plan.name} Sub</span>
                    <span className="text-lg font-bold text-slate-900">₹{plan.price}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Monthly Billing</span>
                    <span className="text-emerald-600">Tax Included</span>
                  </div>
                </div>

                <form onSubmit={handlePayment} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Card Details</label>
                    <div className="relative">
                       <CreditCardIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                       <input 
                         required
                         type="text" 
                         placeholder="4242 4242 4242 4242"
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-mono text-sm font-semibold"
                       />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      required
                      type="text" 
                      placeholder="MM/YY"
                      className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-mono text-sm font-semibold text-center"
                    />
                    <input 
                      required
                      type="text" 
                      placeholder="CVC"
                      className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-mono text-sm font-semibold text-center"
                    />
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      Process Payment <ArrowRight size={18} />
                    </button>
                    <div className="flex items-center justify-center gap-2 mt-6 text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                       <Lock size={12} className="text-emerald-500" /> Secure Encryption Active
                    </div>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div 
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center"
              >
                <div className="relative w-16 h-16 mb-6">
                   <div className="absolute inset-0 border-[3px] border-indigo-100 rounded-full"></div>
                   <div className="absolute inset-0 border-[3px] border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="text-indigo-600" size={24} />
                   </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Processing Transaction...</h3>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Securely connecting to bank</p>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center"
              >
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-100 shadow-sm">
                   <CheckCircle2 size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Upgrade Successful</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed mb-10 px-4">
                  Welcome to the **PRO** tier. All premium workspace management features are now active.
                </p>
                <button 
                  onClick={() => {
                    onFinish()
                    onClose()
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95"
                >
                  Continue to Workspace
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
