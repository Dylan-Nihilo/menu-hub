import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useAuthStore } from '../stores/authStore'
import { ToastProvider } from '../components/ui'
import { stackScreenOptions, modalScreenOptions } from '../lib/navigation'

export default function RootLayout() {
  const loadUser = useAuthStore((state) => state.loadUser)

  useEffect(() => {
    loadUser()
  }, [loadUser])

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={stackScreenOptions}>
          <Stack.Screen name="index" options={{ animation: 'fade' }} />
          <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="pair" />
          <Stack.Screen name="select" options={modalScreenOptions} />
          <Stack.Screen name="recipes" />
          <Stack.Screen name="settings" />
        </Stack>
      </ToastProvider>
    </SafeAreaProvider>
  )
}
