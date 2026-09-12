import { Tabs } from 'expo-router'

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: () => '🏠',
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: () => '📊',
        }}
      />
      <Tabs.Screen
        name="clinical-summary"
        options={{
          title: 'Clinical Summary',
          tabBarIcon: () => '🩺',
        }}
      />
    </Tabs>
  )
}
