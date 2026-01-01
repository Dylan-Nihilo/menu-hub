import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useAuthStore } from '../../stores/authStore'
import { api } from '../../lib/api'
import { colors, typography, spacing, borderRadius } from '../../constants'

export default function NewRecipeScreen() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()
  const router = useRouter()

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert('提示', '请输入菜名')
    setLoading(true)
    try {
      await api.post('/recipes', {
        coupleId: user?.coupleId,
        createdById: user?.id,
        name: name.trim(),
        category: category.trim() || null,
      })
      router.back()
    } catch {
      Alert.alert('保存失败', '请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="x" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>新建食谱</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <Text style={[styles.saveBtn, loading && { opacity: 0.5 }]}>
            {loading ? '保存中' : '保存'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.label}>菜名</Text>
        <TextInput
          style={styles.input}
          placeholder="输入菜名"
          placeholderTextColor={colors.text.muted}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>分类</Text>
        <TextInput
          style={styles.input}
          placeholder="如：家常菜、川菜"
          placeholderTextColor={colors.text.muted}
          value={category}
          onChangeText={setCategory}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg },
  title: { ...typography.h3, color: colors.text.primary },
  saveBtn: { ...typography.body, fontWeight: '600', color: colors.primary },
  content: { flex: 1, padding: spacing['2xl'] },
  label: { ...typography.caption, color: colors.text.secondary, marginBottom: spacing.sm, marginTop: spacing.lg },
  input: { height: 56, backgroundColor: colors.surface, borderRadius: borderRadius.xl, paddingHorizontal: spacing.xl, ...typography.body, color: colors.text.primary },
})
