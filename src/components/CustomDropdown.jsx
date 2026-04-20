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
    <div className="space-y-1.5 relative" ref={dropdownRef}>
      {label && <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-sm font-semibold hover:bg-white hover:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none group shadow-sm"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />}
          {selectedOption.icon && <span className="text-indigo-600">{selectedOption.icon}</span>}
          <span className="text-slate-700">{selectedOption.label}</span>
        </div>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            className="absolute z-[300] top-full mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden p-1.5"
          >
            {options.map((opt) => (
               <button
                 key={opt.value}
                 type="button"
                 onClick={() => {
                   onChange(opt.value)
                   setIsOpen(false)
                 }}
                 className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all ${value === opt.value ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
               >
                 {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                 <span className="flex-1 text-left">{opt.label}</span>
                 {value === opt.value && <Check size={14} className="text-indigo-600" />}
               </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CustomDropdown
