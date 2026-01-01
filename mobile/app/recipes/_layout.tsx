import { Stack } from 'expo-router'

export default function RecipesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[id]" />
      <Stack.Screen name="new" />
    </Stack>
  )
}
