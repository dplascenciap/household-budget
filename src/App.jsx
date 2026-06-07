import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut, getRedirectResult } from 'firebase/auth'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { auth, ALLOWED_EMAILS } from './firebase/config'
import Login from './components/Login'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import Dashboard from './components/Dashboard'
import CategoryDetail from './components/CategoryDetail'
import WeeklyCheck from './components/WeeklyCheck'

export default function App() {
  const [user, setUser]       = useState(undefined)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    getRedirectResult(auth).catch(() => {})
    return onAuthStateChanged(auth, u => {
      setUser(u)
      setAllowed(u ? ALLOWED_EMAILS.includes(u.email) : false)
    })
  }, [])

  if (user === undefined) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100dvh'}}>
        <span style={{color:'#64748b'}}>Loading…</span>
      </div>
    )
  }

  if (!user) return <Login />

  if (!allowed) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100dvh',padding:24}}>
        <div style={{textAlign:'center'}}>
          <p style={{color:'#dc2626',fontWeight:700,marginBottom:8}}>Access denied</p>
          <p style={{color:'#64748b',fontSize:'.9rem',marginBottom:16}}>{user.email} is not authorised.</p>
          <button onClick={() => signOut(auth)} style={{cursor:'pointer',padding:'8px 16px',borderRadius:8,border:'1px solid #e2e8f0'}}>Sign out</button>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Header user={user} onSignOut={() => signOut(auth)} />
        <main className="main">
          <Routes>
            <Route path="/"                element={<Dashboard user={user} />} />
            <Route path="/category/:name"  element={<CategoryDetail />} />
            <Route path="/weekly"          element={<WeeklyCheck />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
