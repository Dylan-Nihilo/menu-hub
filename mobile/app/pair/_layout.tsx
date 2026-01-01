import { Stack } from 'expo-router'

export default function PairLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="create" />
      <Stack.Screen name="join" />
    </Stack>
  )
}
