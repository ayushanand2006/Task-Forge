import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore'
import { supabase } from './services/supabase'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProjectDetail from './pages/ProjectDetail'
import Profile from './pages/Profile'
import InviteHandler from './pages/InviteHandler'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuthStore()
  // Only block the render if we are genuinely in the initial handshake
  if (loading) return null
  return user ? children : <Navigate to="/login" />
}

function App() {
  const { setUser, setLoading, fetchProfile } = useAuthStore()

  useEffect(() => {
    // 1. Initial Handshake: Check if session already exists
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user)
        fetchProfile(session.user.id)
      }
      setLoading(false) // Release the UI lock
    })

    // 2. Continuous Sync: Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Smart Invitation Hub */}
        <Route path="/invite/:projectId" element={<InviteHandler />} />

        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/project/:projectId" element={<PrivateRoute><ProjectDetail /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>
  )
}

export default App
