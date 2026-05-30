import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, ALLOWED_EMAILS } from './firebase/config'
import Login from './components/Login'
import Header from './components/Header'
import Dashboard from './components/Dashboard'

export default function App() {
  const [user, setUser]       = useState(undefined) // undefined = loading
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, u => {
      setUser(u)
      setAllowed(u ? ALLOWED_EMAILS.includes(u.email) : false)
    })
  }, [])

  if (user === undefined) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100dvh' }}>
        <span style={{ color:'#64748b', fontSize:'1rem' }}>Loading…</span>
      </div>
    )
  }

  if (!user) return <Login />

  if (!allowed) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100dvh', padding:'24px' }}>
        <div style={{ textAlign:'center' }}>
          <p style={{ color:'#dc2626', fontWeight:700, marginBottom:8 }}>Access denied</p>
          <p style={{ color:'#64748b', fontSize:'.9rem', marginBottom:16 }}>
            {user.email} is not authorised to use this app.
          </p>
          <button onClick={() => signOut(auth)} style={{ cursor:'pointer', padding:'8px 16px', borderRadius:'8px', border:'1px solid #e2e8f0' }}>
            Sign out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Header user={user} onSignOut={() => signOut(auth)} />
      <main className="main">
        <Dashboard user={user} />
      </main>
    </div>
  )
}
