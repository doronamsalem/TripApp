import { Outlet, Link } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { useEffect, useState } from 'react'

export default function App() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null))
    return () => { sub?.subscription.unsubscribe() }
  }, [])

  const sendMagic = async (e:any) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })
    alert(error ? error.message : 'Check your email for the magic link.')
  }

  const signOut = async () => { await supabase.auth.signOut() }

  return (
    <div>
      <div className="container">
        <header className="flex items-center justify-between mb-4">
          <h1>Trip Manager</h1>
          {user ? <button onClick={signOut}>Sign out</button> : null}
        </header>

        {!user ? (
          <div className="card">
            <h2>Sign in</h2>
            <p className="mt-2">Enter your email to receive a magic link.</p>
            <form onSubmit={sendMagic} className="mt-3 space-y-2">
              <input type="email" required placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
              <button type="submit">Send magic link</button>
            </form>
          </div>
        ) : (
          <Outlet />
        )}
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
