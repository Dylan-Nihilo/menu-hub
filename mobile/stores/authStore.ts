import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface User {
  id: string
  email: string
  nickname: string
  coupleId?: string | null
}

interface AuthState {
  user: User | null
  isLoading: boolean
  menuRefreshKey: number
  recipeRefreshKey: number
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  loadUser: () => Promise<void>
  triggerMenuRefresh: () => void
  triggerRecipeRefresh: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  menuRefreshKey: 0,
  recipeRefreshKey: 0,
  triggerMenuRefresh: () => set((state) => ({ menuRefreshKey: state.menuRefreshKey + 1 })),
  triggerRecipeRefresh: () => set((state) => ({ recipeRefreshKey: state.recipeRefreshKey + 1 })),
  setUser: async (user) => {
    if (user) {
      await AsyncStorage.setItem('user', JSON.stringify(user))
    } else {
      await AsyncStorage.removeItem('user')
    }
    set({ user })
  },
  setLoading: (isLoading) => set({ isLoading }),
  loadUser: async () => {
    try {
      const stored = await AsyncStorage.getItem('user')
      set({ user: stored ? JSON.parse(stored) : null, isLoading: false })
    } catch {
      await AsyncStorage.removeItem('user')
      set({ user: null, isLoading: false })
    }
  },
}))
