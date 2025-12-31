'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

export function useAuth() {
  const router = useRouter()
  const { user, isLoading, setUser, loadUser } = useAuthStore()

  useEffect(() => {
    loadUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signIn = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    setUser(data)
    router.push(data.coupleId ? '/home' : '/pair/create')
  }

  const signUp = async (email: string, password: string, nickname: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, nickname }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    setUser(data)
    router.push('/pair/create')
  }

  const signOut = () => {
    setUser(null)
    router.push('/')
  }

  return { user, isLoading, signIn, signUp, signOut }
}
