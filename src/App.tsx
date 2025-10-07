// src/App.tsx
import { Outlet, Link } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { useEffect, useState } from 'react'

type AuthTab = 'password' | 'otp'

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
  const [tab, setTab] = useState<AuthTab>('password')
  return (
    <div className="card">
      <h2>Sign in</h2>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setTab('password')}
          className={tab==='password' ? 'bg-sky-500' : ''}
        >
          Email + Password
        </button>
        <button
          type="button"
          onClick={() => setTab('otp')}
          className={tab==='otp' ? 'bg-sky-500' : ''}
        >
          Email OTP
        </button>
      </div>

      <div className="mt-4">
        {tab === 'password' ? <EmailPasswordForm /> : <EmailOtpForm />}
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
        else alert('Check your email to confirm the account (if confirmations are enabled).')
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

function EmailOtpForm() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  const sendOtp = async (e:any) => {
    e.preventDefault()
    setBusy(true)
    try {
      // שולח קוד אימות למייל (לא לינק)
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true }  // יוצר משתמש אם אינו קיים
      })
      if (error) alert(error.message)
      else setSent(true)
    } finally { setBusy(false) }
  }

  const verifyOtp = async (e:any) => {
    e.preventDefault()
    setBusy(true)
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email'  // סוג OTP עבור אימייל
      })
      if (error) alert(error.message)
    } finally { setBusy(false) }
  }

  return (
    <div className="space-y-3">
      {!sent ? (
        <form onSubmit={sendOtp} className="space-y-3">
          <div>
            <label>Email</label>
            <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <button disabled={busy} type="submit">Send code</button>
          <small>We’ll email you a 6-digit code.</small>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="space-y-3">
          <div>
            <label>Enter code from email</label>
            <input inputMode="numeric" pattern="[0-9]*" required value={code} onChange={e=>setCode(e.target.value)} />
          </div>
          <button disabled={busy} type="submit">Verify & Sign in</button>
          <button type="button" onClick={()=>setSent(false)}>Resend / Change email</button>
        </form>
      )}
    </div>
  )
}
