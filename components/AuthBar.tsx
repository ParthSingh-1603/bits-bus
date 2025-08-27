'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthBar() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUserEmail(session?.user?.email ?? null)
    }
    init()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const signIn = async () => {
    if (!email.trim()) return
    setLoading(true)
    setMessage(null)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined },
      })
      if (error) throw error
      setMessage('Check your email for the sign-in link')
    } catch (err: any) {
      setMessage(err?.message || 'Failed to send login link')
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  if (userEmail) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700">Signed in as {userEmail}</span>
        <button onClick={signOut} className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">Sign out</button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button onClick={signIn} disabled={loading} className="px-3 py-2 rounded bg-blue-600 text-white text-sm disabled:opacity-60">
        {loading ? 'Sending...' : 'Send login link'}
      </button>
      {message && <span className="text-xs text-gray-600 ml-2">{message}</span>}
    </div>
  )
}


