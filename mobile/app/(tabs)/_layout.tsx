import { Tabs } from 'expo-router'
import { AnimatedTabBar } from '../../components/animated'

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: 'shift',
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="recipes" />
      <Tabs.Screen name="shopping" />
      <Tabs.Screen name="profile" />
    </Tabs>
  )
}
