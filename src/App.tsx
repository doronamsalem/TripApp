// src/App.tsx
import { Outlet, Link } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { useEffect, useState } from 'react'

export default function App() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => { sub?.subscription.unsubscribe() }
  }, [])

  const signOut = async () => { await supabase.auth.signOut() }

  return (
    <div>
      <div className="container">
        <header className="flex items-center justify-between mb-4">
          <h1>Trip Manager</h1>
          {user ? <button onClick={signOut}>Sign out</button> : null}
        </header>

        {!user ? <AuthPanel /> : <Outlet />}
      </div>

      <nav className="tabbar">
        <Link to="/">Home</Link>
        <Link to="/expenses">Expenses</Link>
        <Link to="/itinerary">Itinerary</Link>
        <Link to="/links">Links</Link>
      </nav>
    </div>
  )
}

function AuthPanel() {
  return (
    <div className="card">
      <h2>Sign in</h2>
      <div className="mt-4">
        <EmailPasswordForm />
      </div>
    </div>
  )
}

function EmailPasswordForm() {
  const [mode, setMode] = useState<'signin'|'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e:any) => {
    e.preventDefault()
    setBusy(true)
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) alert(error.message)
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) alert(error.message)
        else alert('Account created. You can sign in now.')
      }
    } finally { setBusy(false) }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label>Email</label>
        <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} />
      </div>
      <div>
        <label>Password</label>
        <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <button disabled={busy} type="submit">{mode==='signin' ? 'Sign in' : 'Sign up'}</button>
        <button type="button" onClick={()=>setMode(mode==='signin'?'signup':'signin')}>
          {mode==='signin' ? 'Create account' : 'I have an account'}
        </button>
      </div>
    </form>
  )
}
