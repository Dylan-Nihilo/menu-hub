import { create } from 'zustand'

interface User {
  id: string
  email: string
  nickname: string
  coupleId?: string | null
  createdAt?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  loadUser: () => void
}

const isBrowser = typeof window !== 'undefined'

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => {
    if (isBrowser) {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      } else {
        localStorage.removeItem('user')
      }
    }
    set({ user })
  },
  setLoading: (isLoading) => set({ isLoading }),
  loadUser: () => {
    if (isBrowser) {
      try {
        const stored = localStorage.getItem('user')
        set({ user: stored ? JSON.parse(stored) : null, isLoading: false })
      } catch {
        localStorage.removeItem('user')
        set({ user: null, isLoading: false })
      }
    } else {
      set({ isLoading: false })
    }
  },
}))
