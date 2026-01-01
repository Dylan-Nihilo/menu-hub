import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useAuthStore } from '../../stores/authStore'
import { AnimatedPressable } from '../../components/animated'

export default function ProfileSettingsScreen() {
  const { user } = useAuthStore()
  const router = useRouter()

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <AnimatedPressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color="#0a0a0a" />
        </AnimatedPressable>
        <Text style={styles.title}>个人资料</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.item}>
          <Text style={styles.label}>昵称</Text>
          <Text style={styles.value}>{user?.nickname}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>邮箱</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 17, fontWeight: '600', color: '#0a0a0a' },
  content: { padding: 24 },
  item: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  label: { fontSize: 13, color: '#a3a3a3' },
  value: { fontSize: 15, color: '#0a0a0a', marginTop: 4 },
})
