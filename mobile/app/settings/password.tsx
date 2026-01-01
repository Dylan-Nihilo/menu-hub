import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { colors, typography, spacing, borderRadius } from '../../constants'

export default function PasswordSettingsScreen() {
  const router = useRouter()

  const handleSave = () => {
    Alert.alert('提示', '功能开发中')
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>修改密码</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveBtn}>保存</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TextInput style={styles.input} placeholder="当前密码" secureTextEntry placeholderTextColor={colors.text.muted} />
        <TextInput style={styles.input} placeholder="新密码" secureTextEntry placeholderTextColor={colors.text.muted} />
        <TextInput style={styles.input} placeholder="确认新密码" secureTextEntry placeholderTextColor={colors.text.muted} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg },
  title: { ...typography.h3, color: colors.text.primary },
  saveBtn: { ...typography.body, fontWeight: '600', color: colors.primary },
  content: { padding: spacing['2xl'], gap: spacing.md },
  input: { height: 56, backgroundColor: colors.surface, borderRadius: borderRadius.xl, paddingHorizontal: spacing.xl, ...typography.body, color: colors.text.primary },
})
