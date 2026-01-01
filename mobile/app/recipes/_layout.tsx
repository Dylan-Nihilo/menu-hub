import { Stack } from 'expo-router'
import { stackScreenOptions, modalScreenOptions } from '../../lib/navigation'

export default function RecipesLayout() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name="[id]" />
      <Stack.Screen name="new" options={modalScreenOptions} />
    </Stack>
  )
}
