import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useAuthStore } from '../../stores/authStore'
import { colors, typography, spacing, borderRadius } from '../../constants'

export default function CoupleSettingsScreen() {
  const { user } = useAuthStore()
  const router = useRouter()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>情侣设置</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.item}>
          <Text style={styles.label}>配对状态</Text>
          <Text style={styles.value}>{user?.coupleId ? '已配对' : '未配对'}</Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg },
  title: { ...typography.h3, color: colors.text.primary },
  content: { padding: spacing['2xl'] },
  item: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.lg },
  label: { ...typography.caption, color: colors.text.muted },
  value: { ...typography.body, color: colors.text.primary, marginTop: spacing.xs },
})
