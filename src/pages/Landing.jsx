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
  CheckCircle2, ChevronRight, Box, Compass, Terminal, ShieldCheck,
  Star, Command, Sparkles, Menu, X, LayoutGrid, Check
} from 'lucide-react'
import { toast } from 'react-toastify'
import PaymentModal from '../components/PaymentModal'
import Logo from '../components/Logo'

const Landing = () => {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const plans = [
    { 
      name: "Starter", 
      price: "0", 
      id: "free",
      features: [
        "1 Unified Workspace",
        "Unlimited Task Intake",
        "2 Team Members",
        "Basic Analytics"
      ],
      btn: "Start Free",
      highlight: false
    },
    { 
      name: "Pro", 
      price: "1,499", 
      id: "pro",
      features: [
        "Unlimited Workspaces",
        "Advanced Analytics",
        "Priority Engineering",
        "10GB Object Storage",
        "Custom Workflow Nodes"
      ],
      btn: "Upgrade to Pro",
      highlight: true
    },
    { 
      name: "Enterprise", 
      price: "Custom", 
      id: "enterprise",
      features: [
        "Infinite Infrastructure",
        "Bank-grade Security",
        "Dedicated Architect",
        "SSO & Audit Logs"
      ],
      btn: "Contact Sales",
      highlight: false
    }
  ]

  const openPayment = (plan) => {
    if (plan.id === 'free') return window.location.href = '/register'
    if (plan.id === 'enterprise') return window.location.href = 'mailto:solutions@taskforge.com'
    setSelectedPlan(plan)
    setIsPaymentOpen(true)
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 scroll-smooth overflow-x-hidden">
      {/* Mesh Gradient Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-50/50 blur-[120px]"></div>
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-blue-50/50 blur-[100px]"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-slate-50/50 blur-[140px]"></div>
      </div>

      {/* Modern Floating Navbar */}
      <nav className="fixed top-0 left-0 w-full z-[1000] px-6 py-4 md:py-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[28px] h-16 md:h-20 px-6 md:px-10 flex items-center justify-between shadow-premium">
            <div className="flex items-center gap-12">
              <Link to="/" className="shrink-0">
                <Logo />
              </Link>
              <div className="hidden lg:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
                <a href="#workflow" className="hover:text-indigo-600 transition-colors">Solutions</a>
                <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/login" className="hidden sm:block text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-indigo-600 transition-colors px-4">Log in</Link>
              <Link to="/register" className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95">
                Join Forge
              </Link>
              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-all">
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[1100]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-y-0 right-0 w-full max-w-sm bg-white z-[1200] p-10 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between mb-12">
                <Logo />
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-all">
                  <X size={24} />
                </button>
              </div>
              <div className="flex flex-col gap-8 mb-auto">
                {['Features', 'Solutions', 'Pricing'].map(item => (
                  <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-slate-900 tracking-tight font-display hover:text-indigo-600 transition-all">{item}</a>
                ))}
              </div>
              <div className="flex flex-col gap-4 pt-10 border-t border-slate-100">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-5 rounded-2xl border-2 border-slate-100 text-center font-black text-xs uppercase tracking-widest text-slate-600 hover:border-indigo-100 transition-all">Log in</Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-5 rounded-2xl bg-slate-900 text-white text-center font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-100">Get Started</Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <header className="relative pt-40 md:pt-56 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 bg-indigo-50 border border-indigo-100 px-5 py-2 rounded-full mb-10 shadow-sm"
          >
            <Sparkles size={16} className="text-indigo-600" />
            <span className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em]">Introducing TaskForge v2.0 Professional</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[1.05] font-display text-slate-950"
          >
            Engineering Flow <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">Without Friction.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-14 font-medium leading-relaxed"
          >
            The mission-critical project engine for elite engineering teams. 
            Standardize your workflow, increase velocity, and ship with total confidence.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-5 mb-24 px-4"
          >
             <Link to="/register" className="bg-slate-900 text-white px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 shadow-2xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                Start Forging <ArrowRight size={18} strokeWidth={3} />
             </Link>
             <button className="bg-white border-2 border-slate-100 text-slate-900 px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-95">
                <Play size={18} fill="currentColor" className="text-indigo-600" /> Watch Mission
             </button>
          </motion.div>

          {/* Hero Image Mockup */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative mx-auto max-w-6xl px-4"
          >
            <div className="relative rounded-[40px] overflow-hidden border-4 border-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] bg-slate-50">
              <img 
                src="/taskforge_dashboard_mockup_1778792751133.png" 
                alt="TaskForge Dashboard Mockup" 
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 to-transparent pointer-events-none"></div>
            </div>
            
            {/* Decorative Floating Elements */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-indigo-600/10 blur-3xl rounded-full"></div>
          </motion.div>
        </div>
      </header>

      {/* Trusted By Section */}
      <section className="py-24 border-y border-slate-100 bg-[#FBFBFE]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em] mb-16">Authorized by the world's most innovative forge labs</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale contrast-150">
             {['Innovix', 'TechLabs', 'CyberDyne', 'Quantum', 'Aether'].map((brand) => (
               <span key={brand} className="text-2xl md:text-3xl font-black tracking-tighter text-slate-950 italic">{brand}</span>
             ))}
          </div>
        </div>
      </section>

      {/* Features - Bento Grid */}
      <section id="features" className="py-32 md:py-48 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <div className="inline-block px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.4em] mb-6">Core Infrastructure</div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6 font-display text-slate-950">Industrial Capability.</h2>
            <p className="text-slate-500 font-medium text-lg md:text-xl max-w-2xl mx-auto">High-performance tooling designed for mission-critical engineering workflows.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {/* Large Feature Card */}
            <div className="md:col-span-2 bg-[#FBFBFE] rounded-[48px] p-10 md:p-14 border border-slate-200/60 flex flex-col justify-between overflow-hidden group shadow-premium relative">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-10 shadow-2xl shadow-slate-200">
                  <LayoutGrid size={28} />
                </div>
                <h3 className="text-3xl md:text-4xl font-black mb-6 tracking-tight text-slate-950 font-display">Tactical Dashboard</h3>
                <p className="text-slate-500 font-medium text-lg max-w-md leading-relaxed">Absolute visibility over your project landscape. Real-time sync, custom filters, and multi-tier Kanban interfaces.</p>
              </div>
              <div className="mt-14 -mb-20 -mr-20 translate-x-12 translate-y-12 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-1000 ease-out">
                 <div className="bg-white rounded-tl-[40px] shadow-[0_-20px_80px_rgba(0,0,0,0.05)] border-t border-l border-slate-200 p-10 h-80 w-full relative">
                    <div className="space-y-6">
                       {[1,2,3].map(i => (
                         <div key={i} className="flex gap-6 items-center">
                            <div className={`w-10 h-10 rounded-xl ${i === 1 ? 'bg-indigo-600' : 'bg-slate-100'}`}></div>
                            <div className="h-4 bg-slate-100 rounded-full w-2/3"></div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            </div>

            {/* Feature Card */}
            <div className="bg-indigo-600 rounded-[48px] p-10 md:p-14 text-white border border-indigo-500 relative overflow-hidden flex flex-col justify-between shadow-premium">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md text-white rounded-2xl flex items-center justify-center mb-10 border border-white/20 shadow-inner">
                  <Zap size={28} strokeWidth={2.5} />
                </div>
                <h3 className="text-3xl font-black mb-6 tracking-tight font-display">Velocity Sync</h3>
                <p className="text-indigo-100 text-lg font-medium leading-relaxed">Sub-12ms global synchronization keeps your team perfectly aligned across every node.</p>
              </div>
              <div className="absolute -bottom-10 -right-10 opacity-20 group-hover:scale-110 transition-transform duration-700">
                <Cloud size={200} />
              </div>
            </div>

            {/* Grid Items */}
            <div className="bg-white rounded-[40px] p-10 border border-slate-200/60 shadow-premium hover:border-indigo-400 transition-all group">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 border border-emerald-100 shadow-sm group-hover:scale-110 transition-transform">
                <ShieldCheck size={28} />
              </div>
              <h4 className="text-2xl font-black mb-4 tracking-tight text-slate-950 font-display">Secure by Protocol</h4>
              <p className="text-slate-500 text-base font-medium leading-relaxed">Bank-grade RLS architecture ensuring permanent data isolation and protection.</p>
            </div>

            <div className="bg-white rounded-[40px] p-10 border border-slate-200/60 shadow-premium hover:border-indigo-400 transition-all group">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 border border-indigo-100 shadow-sm group-hover:scale-110 transition-transform">
                <BarChart3 size={28} />
              </div>
              <h4 className="text-2xl font-black mb-4 tracking-tight text-slate-950 font-display">Deep Analytics</h4>
              <p className="text-slate-500 text-base font-medium leading-relaxed">Monitor production with precision velocity metrics and automated status distribution.</p>
            </div>

            <div className="bg-white rounded-[40px] p-10 border border-slate-200/60 shadow-premium hover:border-indigo-400 transition-all group">
              <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-slate-100 group-hover:scale-110 transition-transform">
                <Terminal size={28} />
              </div>
              <h4 className="text-2xl font-black mb-4 tracking-tight text-slate-950 font-display">API Framework</h4>
              <p className="text-slate-500 text-base font-medium leading-relaxed">Full programmatic interface for custom CI/CD integrations and workflow automation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 md:py-48 px-6 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <p className="text-indigo-600 font-black text-[11px] uppercase tracking-[0.6em] mb-6">Tier Matrix</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6 font-display text-slate-950">Transparent Scaling.</h2>
            <p className="text-slate-500 font-medium text-lg md:text-xl">Authorization tiers designed for every level of operational growth.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -12 }}
                className={`bg-white rounded-[48px] p-10 md:p-14 flex flex-col border transition-all duration-500 relative ${plan.highlight ? 'border-indigo-600 shadow-[0_40px_100px_-20px_rgba(79,70,229,0.15)] ring-4 ring-indigo-50' : 'border-slate-200 shadow-premium'}`}
              >
                {plan.highlight && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-xl">
                    Most Popular
                  </div>
                )}
                <div className="mb-10">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4">{plan.name} Node</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-slate-950 font-display tracking-tight">₹{plan.price}</span>
                    {plan.price !== 'Custom' && <span className="text-slate-400 font-black text-xs uppercase tracking-widest">/mo</span>}
                  </div>
                </div>
                
                <div className="space-y-6 mb-14 flex-1">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex gap-4 items-center text-[15px] font-bold text-slate-600">
                      <div className="w-5 h-5 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center border border-emerald-100 shadow-sm shrink-0">
                         <Check size={12} strokeWidth={4} />
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => openPayment(plan)}
                  className={`w-full py-5 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl ${
                    plan.highlight 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100' 
                    : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-slate-100'
                  }`}
                >
                  {plan.btn}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 md:py-48 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-slate-950 rounded-[64px] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.25)_0%,rgba(0,0,0,0)_70%)]"></div>
            <div className="relative z-10">
              <div className="inline-block px-5 py-2 bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.5em] mb-10 border border-white/10 backdrop-blur-sm">Final Activation</div>
              <h2 className="text-4xl md:text-7xl font-black text-white tracking-tight mb-10 font-display leading-[1.1]">Ready to Forge the Future?</h2>
              <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-16 leading-relaxed">
                Join thousands of engineering teams who have optimized their delivery engine with TaskForge Industrial.
              </p>
              <Link to="/register" className="inline-flex items-center gap-4 bg-white text-slate-900 px-12 py-6 rounded-[24px] font-black text-sm uppercase tracking-[0.2em] hover:bg-indigo-50 transition-all shadow-2xl active:scale-95">
                Initialize Free Tier <Rocket size={20} strokeWidth={2.5} className="text-indigo-600" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-slate-100 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-24">
            <div className="max-w-sm">
              <Logo className="mb-8" />
              <p className="text-slate-500 font-medium text-base leading-relaxed">
                The industrial-grade project management engine built for modern high-performance engineering teams.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 md:gap-20">
              <div>
                <h4 className="font-black text-slate-950 mb-8 uppercase text-[11px] tracking-[0.3em]">Infrastructure</h4>
                <ul className="space-y-4 text-[14px] font-bold text-slate-400">
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">Tactical Features</a></li>
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">Security Protocol</a></li>
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">Mission Roadmap</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-black text-slate-950 mb-8 uppercase text-[11px] tracking-[0.3em]">Network</h4>
                <ul className="space-y-4 text-[14px] font-bold text-slate-400">
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">About Forge</a></li>
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">Intelligence Blog</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-black text-slate-950 mb-8 uppercase text-[11px] tracking-[0.3em]">Intelligence</h4>
                <ul className="space-y-4 text-[14px] font-bold text-slate-400">
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">API Mainframe</a></li>
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">System Status</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[12px] font-black text-slate-300 uppercase tracking-[0.4em]">&copy; 2026 Innovix Tech Labs &bull; Professional Edition</p>
            <div className="flex gap-10 text-[11px] font-black text-slate-400 uppercase tracking-widest">
              <a href="#" className="hover:text-indigo-600 transition-all">Privacy Node</a>
              <a href="#" className="hover:text-indigo-600 transition-all">Terms of Mission</a>
            </div>
          </div>
        </div>
      </footer>

      <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} plan={selectedPlan || {}} onFinish={() => toast.success('SYSTEM UPGRADED')} />
    </div>
  )
}

export default Landing
