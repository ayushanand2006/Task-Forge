import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Layout, Zap, Shield, Globe, Users, 
  MessageSquare, Layers, CheckCircle, 
  ArrowRight, Rocket, Monitor, BarChart,
  Cpu, Lock, Search, Filter, Smartphone,
  BarChart3, Settings, Play, Cloud, Activity, 
  MousePointer2, GitBranch, Target, TrendingUp, 
  CheckCircle2, ChevronRight, Box, Compass, Terminal, ShieldCheck
} from 'lucide-react'
import { toast } from 'react-toastify'
import MobileNav from '../components/MobileNav'
import PaymentModal from '../components/PaymentModal'
import Logo from '../components/Logo'

const Landing = () => {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)

  const plans = [
    { 
      name: "Starter", 
      price: "0", 
      id: "free",
      features: [
        { t: "1 Unified Workspace", d: "Core project management node." },
        { t: "Unlimited Unit Intake", d: "Standard tasking and forging." },
        { t: "2 Integrated Members", d: "Small team collaboration." },
        { t: "Standard Cloud Sync", d: "Cross-platform data persistence." }
      ],
      btn: "Start Free",
      color: "bg-white",
      textColor: "text-gray-950"
    },
    { 
      name: "Standard Pro", 
      price: "1,499", 
      id: "pro",
      features: [
        { t: "10 Advanced Workspaces", d: "Departmental scaling capability." },
        { t: "Velocity Analytics", d: "Industrial reporting and forecasting." },
        { t: "Priority Engineering", d: "Direct technical response unit." },
        { t: "10GB Object Storage", d: "Enterprise asset management." },
        { t: "Pro Sync Engine", d: "Sub-12ms global synchronization." }
      ],
      btn: "Upgrade Now",
      color: "bg-indigo-600",
      textColor: "text-white",
      highlight: true
    },
    { 
      name: "Enterprise", 
      price: "Custom", 
      id: "enterprise",
      features: [
        { t: "Infinite Infrastructure", d: "No limits on boards or team size." },
        { t: "Security RLS Nodes", d: "Bank-grade data isolation." },
        { t: "Full API Access", d: "Custom integration and automation." },
        { t: "Solutions Architect", d: "Dedicated implementation support." }
      ],
      btn: "Contact Us",
      color: "bg-white",
      textColor: "text-gray-950"
    }
  ]

  const openPayment = (plan) => {
    if (plan.id === 'free') return window.location.href = '/register'
    if (plan.id === 'enterprise') return window.location.href = 'mailto:solutions@taskforge.com'
    setSelectedPlan(plan)
    setIsPaymentOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#F4F7FE] text-gray-950 font-sans selection:bg-indigo-100 scroll-smooth overflow-x-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_70%_20%,rgba(99,102,241,0.05)_0%,rgba(0,0,0,0)_50%)] pointer-events-none"></div>

      {/* Cyber-Floating Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-7xl z-[1000] cyber-glass border border-white/60 rounded-[32px] h-20 px-10 flex items-center justify-between shadow-premium transition-all duration-500">
        <div className="flex items-center gap-20">
          <Link to="/">
            <Logo />
          </Link>
          <div className="hidden lg:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">
            <a href="#features" className="hover:text-indigo-600 transition-all hover:tracking-[0.6em]">Features</a>
            <a href="#workflow" className="hover:text-indigo-600 transition-all hover:tracking-[0.6em]">Workflow</a>
            <a href="#pricing" className="hover:text-indigo-600 transition-all hover:tracking-[0.6em]">Pricing</a>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <Link to="/login" className="text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-indigo-600 transition-colors">Log in</Link>
          <Link to="/register" className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[11px] hover:bg-indigo-700 shadow-glow active:scale-95 transition-all uppercase tracking-[0.2em]">
            Initialize Forge
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-64 pb-32 px-10">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-3 bg-white border border-white p-1 pr-6 rounded-full shadow-premium mb-12">
             <span className="bg-indigo-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">v2.0 PROTOCOL</span>
             <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Enhanced Stability Engine Active</span>
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-7xl md:text-[110px] font-black tracking-tighter mb-10 leading-[0.85] uppercase italic font-display">
            Forge Your <br /><span className="text-indigo-600">Tactical Edge.</span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-xl text-gray-400 max-w-2xl mx-auto mb-16 font-semibold leading-relaxed tracking-tight">
            The dependable project engine for elite engineering teams. Manage mission-critical tasks in real-time with industrial-grade precision.
          </motion.p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-8">
             <Link to="/register" className="bg-indigo-600 text-white px-12 py-6 rounded-[32px] font-black text-[11px] hover:bg-indigo-700 shadow-glow hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.3em] flex items-center justify-center gap-4">
                Initialize System <ArrowRight size={20} strokeWidth={3}/>
             </Link>
             <a href="#workflow" className="cyber-glass border border-white/60 text-gray-950 px-12 py-6 rounded-[32px] font-black text-[11px] hover:bg-white hover:shadow-premium transition-all uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                <Play size={20} fill="currentColor" /> Watch Deployment
             </a>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      </header>

      {/* Features Grid */}
      <section id="features" className="py-48 px-10 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-12">
             <div className="max-w-xl">
                <p className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.5em] mb-6">Core Modules</p>
                <h2 className="text-6xl font-black tracking-tighter uppercase leading-none italic">Industrial Capability.</h2>
             </div>
             <p className="text-gray-400 font-bold max-w-md text-lg leading-relaxed">Engineered for scale, TaskForge provides the infrastructure needed to maintain velocity across complex mission clusters.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Compass size={32} />, title: "Agile Navigation", desc: "Industry-standard Kanban and Backlog tracking for total task visibility." },
              { icon: <Activity size={32} />, title: "Velocity Analytics", desc: "Monitor your team's output with precision points and status distribution." },
              { icon: <Users size={32} />, title: "Cluster Sync", desc: "Integrated real-time chat and member management for synchronized missions." },
              { icon: <ShieldCheck size={32} />, title: "Bank-Grade Security", desc: "Enterprise RLS protocols ensuring your data layer is permanently isolated." },
              { icon: <Terminal size={32} />, title: "Pro Sync Engine", desc: "Ultra-low latency data propagation across all regional nodes." },
              { icon: <Box size={32} />, title: "Custom Metadata", desc: "Define your own priorities, issue types, and agile metadata Forge-wide." }
            ].map((f, i) => (
              <motion.div key={i} whileHover={{ y: -10 }} className="bg-white rounded-[48px] p-12 shadow-premium hover:shadow-glow transition-all duration-500 group">
                <div className="w-20 h-20 bg-slate-50 text-indigo-600 rounded-[32px] flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 mb-10 shadow-inner">{f.icon}</div>
                <h3 className="text-2xl font-black text-gray-950 uppercase tracking-tighter mb-6 group-hover:text-indigo-600 transition-colors">{f.title}</h3>
                <p className="text-gray-400 font-bold leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Matrix */}
      <section id="pricing" className="py-48 px-10 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_10%_90%,rgba(99,102,241,0.03)_0%,rgba(0,0,0,0)_50%)] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center mb-32">
          <p className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.5em] mb-8">Investment Matrix</p>
          <h2 className="text-7xl md:text-[100px] font-black mb-8 tracking-tighter uppercase italic leading-none">Infinite Scaling.</h2>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          {plans.map((plan, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -15 }}
              className={`bg-white rounded-[64px] p-16 flex flex-col relative group transition-all duration-700 border ${plan.highlight ? 'border-indigo-600 shadow-glow' : 'border-slate-100 shadow-premium'}`}
            >
              {plan.highlight && (
                 <div className="absolute top-10 right-10">
                   <Zap size={24} className="text-indigo-600 animate-pulse" fill="currentColor" />
                 </div>
              )}
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-12">{plan.name} Protocol</h3>
              <div className="mb-16 flex items-baseline gap-2">
                 {plan.price !== 'Custom' && <span className="text-3xl font-black text-gray-950 italic">₹</span>}
                 <span className="text-8xl font-black text-gray-950 tracking-tighter leading-none">{plan.price}</span>
                 {plan.price !== 'Custom' && <span className="text-sm font-black text-slate-300 uppercase ml-4 tracking-[0.2em]">/mo</span>}
              </div>
              <div className="space-y-8 mb-20 flex-1">
                {plan.features.map((f, j) => (
                  <div key={j} className="flex gap-5 items-start">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 mt-1">
                      <CheckCircle2 size={16} strokeWidth={3} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-gray-950 uppercase tracking-widest mb-1">{f.t}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase italic tracking-wider opacity-80">{f.d}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => openPayment(plan)}
                className={`w-full py-6 rounded-[28px] font-black text-[11px] uppercase tracking-[0.4em] transition-all active:scale-95 shadow-xl ${
                  plan.highlight 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-glow' 
                  : 'bg-slate-50 text-gray-950 hover:bg-white hover:border-indigo-600 border border-transparent transition-all duration-500'
                }`}
              >
                {plan.btn}
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 bg-gray-950 text-white px-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_50%_150%,rgba(99,102,241,0.1)_0%,rgba(0,0,0,0)_50%)] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="mb-16">
            <Logo dark />
          </div>
          <div className="text-[11px] font-black text-indigo-500 uppercase tracking-[1em] mb-12 ml-[1em]">Industrial Optimized Intelligence</div>
          <div className="flex gap-12 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-20">
             <a href="#" className="hover:text-white transition-colors">Documentation</a>
             <a href="#" className="hover:text-white transition-colors">System Status</a>
             <a href="#" className="hover:text-white transition-colors">Privacy Node</a>
          </div>
          <p className="text-[10px] font-black uppercase text-slate-700 tracking-[0.4em]">&copy; 2026 Innovix Tech Labs &bull; Mumbai Hub Terminal</p>
        </div>
      </footer>

      <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} plan={selectedPlan || {}} onFinish={() => toast.success('SYSTEM UPGRADED')} />
      <MobileNav />
    </div>
  )
}

export default Landing
