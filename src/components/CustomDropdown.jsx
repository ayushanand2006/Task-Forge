import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const CustomDropdown = ({ label, options, value, onChange, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(opt => opt.value === value) || options[0]

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      {label && <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#FBFBFE] border border-slate-200 rounded-2xl px-6 py-4 flex items-center justify-between text-base font-bold hover:bg-white hover:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none group shadow-inner-glow"
      >
        <div className="flex items-center gap-4">
          {Icon && <Icon size={18} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />}
          {selectedOption.icon && <span className="text-indigo-600">{selectedOption.icon}</span>}
          <span className="text-slate-900">{selectedOption.label}</span>
        </div>
        <ChevronDown size={18} className={`text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-[400] top-full mt-3 w-full bg-white border border-slate-200 rounded-[24px] shadow-2xl overflow-hidden p-2 backdrop-blur-xl"
          >
            {options.map((opt) => (
               <button
                 key={opt.value}
                 type="button"
                 onClick={() => {
                   onChange(opt.value)
                   setIsOpen(false)
                 }}
                 className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[13px] font-black transition-all ${value === opt.value ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
               >
                 {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                 <span className="flex-1 text-left uppercase tracking-widest">{opt.label}</span>
                 {value === opt.value && <div className="w-5 h-5 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm"><Check size={12} strokeWidth={4} /></div>}
               </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CustomDropdown
